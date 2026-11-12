from abc import ABC, abstractmethod
from typing import AsyncGenerator, List, Dict, Any

class BaseAIProvider(ABC):
    @abstractmethod
    async def generate_response(self, messages: List[Dict[str, str]], model: str) -> str:
        """Generate a complete response from the AI model."""
        pass

    @abstractmethod
    async def stream_response(self, messages: List[Dict[str, str]], model: str) -> AsyncGenerator[str, None]:
        """Stream response chunks from the AI model using Server-Sent Events pattern."""
        pass
