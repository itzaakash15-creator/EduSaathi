from __future__ import annotations

import json
import logging
import re
from typing import Any, TypeVar

from google import genai
from google.genai import types
from pydantic import BaseModel, ValidationError

from app.config import Settings, get_settings
from app.schemas import (
    ApplicationRoadmap,
    CareerAdvice,
    ChatReply,
    DocumentExplanation,
)
from app.services.fallbacks import (
    fallback_career_advice,
    fallback_chat,
    fallback_document_explanation,
    fallback_roadmap,
)

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)

_JSON_FENCE_RE = re.compile(r"^```(?:json)?\s*|\s*```$", re.IGNORECASE | re.MULTILINE)

_SCHEMES_CONTEXT = """
You know major Indian government portals and schemes by name, including:
- MyScheme (myscheme.gov.in) — discovery of central/state schemes
- National Scholarship Portal / NSP (scholarships.gov.in)
- UMANG app and DigiLocker for documents
- PM-KISAN, PM Awas Yojana (PMAY), Ayushman Bharat (PM-JAY)
- Skill India / PMKVY, NCS (ncs.gov.in), Internship portals
- Udyam / MSME registration, Startup India
- eShram, EPFO / ESIC portals where relevant
- State scholarship and welfare portals when the user mentions a state

Prefer real portal names and practical next steps. Never invent fake URLs;
if unsure of an exact URL, name the official portal and say to search from
the Government of India website or MyScheme.
"""


class GeminiService:
    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()
        self._client: genai.Client | None = None
        self._model_name: str | None = None

    @property
    def is_available(self) -> bool:
        return bool(self._settings.gemini_api_key.strip())

    def _ensure_client(self) -> genai.Client | None:
        if not self.is_available:
            return None
        if self._client is not None:
            return self._client
        try:
            self._client = genai.Client(api_key=self._settings.gemini_api_key)
            return self._client
        except Exception:
            logger.exception("Failed to create Gemini client")
            return None

    def _generate_json(self, prompt: str) -> dict[str, Any] | None:
        client = self._ensure_client()
        if client is None:
            return None

        models = (
            self._settings.gemini_model_primary,
            self._settings.gemini_model_fallback,
        )
        last_error: Exception | None = None

        for model_name in models:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.4,
                        response_mime_type="application/json",
                    ),
                )
                text = (response.text or "").strip()
                if not text:
                    logger.warning("Gemini returned empty text (model=%s)", model_name)
                    continue
                self._model_name = model_name
                return json.loads(_strip_json_fences(text))
            except Exception as exc:
                last_error = exc
                logger.warning(
                    "Gemini JSON generation failed (model=%s)",
                    model_name,
                    exc_info=True,
                )

        if last_error is not None:
            logger.warning("All Gemini models failed; last error: %s", last_error)
        return None

    def _parse_model(self, data: dict[str, Any] | None, model_cls: type[T]) -> T | None:
        if data is None:
            return None
        try:
            return model_cls.model_validate(data)
        except ValidationError:
            logger.warning("Gemini response failed validation for %s", model_cls.__name__)
            return None

    def explain_document(self, text: str) -> DocumentExplanation:
        prompt = f"""You are EduSaathi AI, an expert at explaining Indian government scheme notifications in plain language.
{_SCHEMES_CONTEXT}

Analyze the document text below and return ONLY valid JSON matching this exact schema (use camelCase keys):
{{
  "summary": "string — 2-3 sentence plain-language overview",
  "eligibility": ["string"],
  "requiredDocuments": ["string"],
  "deadline": "string",
  "importantNotes": ["string"],
  "actionChecklist": ["string"],
  "faqs": [{{"question": "string", "answer": "string"}}]
}}

When the document names a scheme or portal, mention the official portal name in summary/notes/checklist where helpful.

Document text:
{text[:12000]}
"""
        result = self._parse_model(self._generate_json(prompt), DocumentExplanation)
        return result or fallback_document_explanation()

    def generate_roadmap(
        self,
        opportunity_id: str,
        profile: dict[str, Any] | None = None,
    ) -> ApplicationRoadmap:
        profile_json = json.dumps(profile or {}, ensure_ascii=False)
        prompt = f"""You are EduSaathi AI, helping Indian students and citizens apply for government opportunities.
{_SCHEMES_CONTEXT}

Create a practical application roadmap for opportunity_id="{opportunity_id}" and user profile:
{profile_json}

Map opportunity_id to a real Indian scheme/internship/scholarship when possible
(e.g. NSP scholarships, PMKVY, NCS internships, PM-KISAN, PMAY). Name the official
portal in step descriptions (MyScheme, NSP, UMANG, DigiLocker, etc.).

Return ONLY valid JSON matching this exact schema (camelCase keys):
{{
  "opportunityTitle": "string",
  "totalDays": number,
  "steps": [
    {{
      "title": "string",
      "description": "string",
      "estimatedDays": number,
      "documents": ["string"],
      "tips": ["string"]
    }}
  ],
  "successTips": ["string"]
}}

Include 4-6 actionable steps. totalDays should equal the sum of estimatedDays.
"""
        result = self._parse_model(self._generate_json(prompt), ApplicationRoadmap)
        return result or fallback_roadmap(opportunity_id, profile)

    def career_advice(self, profile: dict[str, Any]) -> CareerAdvice:
        profile_json = json.dumps(profile, ensure_ascii=False)
        prompt = f"""You are EduSaathi AI, a career advisor for Indian students and job seekers navigating government opportunities.
{_SCHEMES_CONTEXT}

Based on this user profile, suggest skills, certifications, courses, and projects that improve eligibility for scholarships, internships, and schemes.
Prefer real Indian providers where relevant (NPTEL, SWAYAM, Skill India / PMKVY, DigiLocker-ready certificates).

Profile:
{profile_json}

Return ONLY valid JSON matching this exact schema (camelCase keys):
{{
  "skills": ["string"],
  "certifications": ["string"],
  "courses": [{{"title": "string", "provider": "string", "reason": "string"}}],
  "projects": ["string"],
  "eligibilityImpact": "string — one sentence on how this improves match scores"
}}
"""
        result = self._parse_model(self._generate_json(prompt), CareerAdvice)
        return result or fallback_career_advice(profile)

    def chat(
        self,
        messages: list[dict[str, str]],
        profile: dict[str, Any] | None = None,
    ) -> ChatReply:
        profile_json = json.dumps(profile or {}, ensure_ascii=False)
        history = "\n".join(
            f"{m.get('role', 'user').upper()}: {m.get('content', '')}" for m in messages[-10:]
        )
        prompt = f"""You are EduSaathi AI, a helpful assistant for Indian government schemes, scholarships, internships, and educational opportunities.
{_SCHEMES_CONTEXT}

User profile:
{profile_json}

Conversation:
{history}

Reply helpfully in markdown. Focus on eligibility, documents, deadlines, and next steps.
Name real portals (MyScheme, NSP, DigiLocker, UMANG, NCS, etc.) when recommending where to apply or check status.

Return ONLY valid JSON: {{ "reply": "your response here" }}
"""
        result = self._parse_model(self._generate_json(prompt), ChatReply)
        if result and result.reply.strip():
            return result
        return fallback_chat(messages, profile)


def _strip_json_fences(text: str) -> str:
    cleaned = _JSON_FENCE_RE.sub("", text.strip())
    return cleaned.strip()


_gemini_service: GeminiService | None = None


def get_gemini_service() -> GeminiService:
    global _gemini_service
    if _gemini_service is None:
        _gemini_service = GeminiService()
    return _gemini_service
