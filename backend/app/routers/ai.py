from fastapi import APIRouter, Response

from app.schemas import (
    ApplicationRoadmap,
    CareerAdvice,
    CareerAdviceRequest,
    ChatReply,
    ChatRequest,
    DocumentExplanation,
    ExplainDocumentRequest,
    RoadmapRequest,
)
from app.services.gemini import get_gemini_service

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/explain-document", response_model=DocumentExplanation)
async def explain_document(
    body: ExplainDocumentRequest,
) -> DocumentExplanation:
    service = get_gemini_service()
    return service.explain_document(body.text)


@router.post("/roadmap", response_model=ApplicationRoadmap)
async def generate_roadmap(
    body: RoadmapRequest,
) -> ApplicationRoadmap:
    service = get_gemini_service()
    return service.generate_roadmap(body.opportunity_id, body.profile)


@router.post("/career-advice", response_model=CareerAdvice)
async def career_advice(
    body: CareerAdviceRequest,
) -> CareerAdvice:
    service = get_gemini_service()
    return service.career_advice(body.profile)


@router.post("/chat", response_model=ChatReply)
async def chat(
    body: ChatRequest,
) -> ChatReply:
    service = get_gemini_service()
    messages = [m.model_dump() for m in body.messages]
    return service.chat(messages, body.profile)

