from app.providers.base import BaseAIProvider
from app.providers.mock_provider import MockAIProvider
from app.providers.openai_adapter import OpenAIProvider
from app.providers.gemini_provider import GeminiProvider
from app.core.config import settings

def get_ai_provider(provider_type: str = None, model_name: str = None) -> BaseAIProvider:
    p_type = (provider_type or "").lower()
    m_name = (model_name or "").lower()

    if p_type == "gemini" or "gemini" in m_name or "flash" in m_name:
        return GeminiProvider()

    if p_type in ["openai", "self-hosted"] or "gpt-4" in m_name or "claude" in m_name:
        if settings.OPENAI_API_KEY:
            return OpenAIProvider()

    return MockAIProvider()
