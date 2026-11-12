from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import AIModel
from app.schemas.schemas import AIModelResponse

router = APIRouter()

@router.get("/models", response_model=List[AIModelResponse])
def list_models(db: Session = Depends(get_db)):
    default_models = [
        AIModel(id="ela-gpt-v4-turbo", name="Ela GPT v4 Turbo", provider="mock", description="Fast and versatile multimodal model for general tasks and coding.", context_window=128000, is_active=True),
        AIModel(id="ela-gpt-v4-reasoner", name="Ela GPT v4 Reasoner", provider="mock", description="Advanced reasoning model optimized for complex software architecture and logic.", context_window=64000, is_active=True),
        AIModel(id="gemini-3.6-flash", name="Gemini 3.6 Flash", provider="gemini", description="Next-generation fast multimodal model by Google DeepMind.", context_window=1000000, is_active=True),
        AIModel(id="gpt-4o-compatible", name="GPT-4o (Compatible)", provider="openai", description="OpenAI GPT-4o adapter for production deployment.", context_window=128000, is_active=True),
        AIModel(id="claude-3-5-sonnet", name="Claude 3.5 Sonnet (Adapter)", provider="openai", description="Anthropic Claude 3.5 Sonnet adapter for advanced coding.", context_window=200000, is_active=True),
    ]
    for dm in default_models:
        existing = db.query(AIModel).filter(AIModel.id == dm.id).first()
        if not existing:
            db.add(dm)
    db.commit()

    models = db.query(AIModel).filter(AIModel.is_active == True).all()
    return models
