from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class CamelModel(BaseModel):
    model_config = ConfigDict(populate_by_name=True, serialize_by_alias=True)


class FAQ(CamelModel):
    question: str
    answer: str


class DocumentExplanation(CamelModel):
    summary: str
    eligibility: list[str]
    required_documents: list[str] = Field(alias="requiredDocuments")
    deadline: str
    important_notes: list[str] = Field(alias="importantNotes")
    action_checklist: list[str] = Field(alias="actionChecklist")
    faqs: list[FAQ]


class RoadmapStep(CamelModel):
    title: str
    description: str
    estimated_days: int = Field(alias="estimatedDays")
    documents: list[str]
    tips: list[str]


class ApplicationRoadmap(CamelModel):
    opportunity_title: str = Field(alias="opportunityTitle")
    total_days: int = Field(alias="totalDays")
    steps: list[RoadmapStep]
    success_tips: list[str] = Field(alias="successTips")


class Course(CamelModel):
    title: str
    provider: str
    reason: str


class CareerAdvice(CamelModel):
    skills: list[str]
    certifications: list[str]
    courses: list[Course]
    projects: list[str]
    eligibility_impact: str = Field(alias="eligibilityImpact")


class ChatReply(CamelModel):
    reply: str


class ExplainDocumentRequest(BaseModel):
    text: str = Field(min_length=1)


class RoadmapRequest(BaseModel):
    opportunity_id: str = Field(min_length=1)
    profile: dict[str, Any] | None = None


class CareerAdviceRequest(BaseModel):
    profile: dict[str, Any]


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1)
    profile: dict[str, Any] | None = None


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    gemini_configured: bool = False
