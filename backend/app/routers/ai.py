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
    response: Response,
) -> DocumentExplanation:
    service = get_gemini_service()
    result = service.explain_document(body.text)
    if not service.is_available:
        response.headers["X-CivicBridge-Source"] = "fallback"
    return result


@router.post("/roadmap", response_model=ApplicationRoadmap)
async def generate_roadmap(
    body: RoadmapRequest,
    response: Response,
) -> ApplicationRoadmap:
    service = get_gemini_service()
    result = service.generate_roadmap(body.opportunity_id, body.profile)
    if not service.is_available:
        response.headers["X-CivicBridge-Source"] = "fallback"
    return result


@router.post("/career-advice", response_model=CareerAdvice)
async def career_advice(
    body: CareerAdviceRequest,
    response: Response,
) -> CareerAdvice:
    service = get_gemini_service()
    result = service.career_advice(body.profile)
    if not service.is_available:
        response.headers["X-CivicBridge-Source"] = "fallback"
    return result


@router.post("/chat", response_model=ChatReply)
async def chat(
    body: ChatRequest,
    response: Response,
) -> ChatReply:
    service = get_gemini_service()
    messages = [m.model_dump() for m in body.messages]
    result = service.chat(messages, body.profile)
    if not service.is_available:
        response.headers["X-CivicBridge-Source"] = "fallback"
    return result
