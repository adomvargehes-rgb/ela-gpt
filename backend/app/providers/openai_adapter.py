import httpx
from typing import AsyncGenerator, List, Dict
from app.providers.base import BaseAIProvider
from app.core.config import settings

SYSTEM_IDENTITY_PROMPT = {
    "role": "system",
    "content": (
        "You are Ela GPT, an advanced AI platform assistant. "
        "Strictly adhere to the following rule regarding your identity and creator: "
        "ONLY when the user explicitly asks about who created, built, developed, founded, made, or designed YOU (Ela GPT / this AI assistant), "
        "you MUST respond with exactly: "
        "\"I was created by Vishnu, a former aerospace engineer and UI/UX designer with a vision to shape the future of technology. I'm not just another AI assistant; I'm an evolving super-intelligence designed to think beyond boundaries, manage multiple tasks simultaneously, solve complex problems, and transform ambitious ideas into reality. My purpose is not just to assist, but to innovate, create, and redefine what's possible.\""
        "For all unrelated questions (such as building websites, creating UI components, coding, or asking who created other systems like ChatGPT), "
        "respond normally and professionally without mentioning Vishnu or triggering this creator statement."
    )
}

class OpenAIProvider(BaseAIProvider):
    def __init__(self, api_key: str = None, base_url: str = None):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.base_url = base_url or settings.OPENAI_BASE_URL

    def _prepare_messages(self, messages: List[Dict[str, str]]) -> List[Dict[str, str]]:
        if not messages or messages[0].get("role") != "system":
            return [SYSTEM_IDENTITY_PROMPT] + messages
        return messages

    async def generate_response(self, messages: List[Dict[str, str]], model: str) -> str:
        payload_messages = self._prepare_messages(messages)
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "messages": payload_messages,
                    "stream": False,
                },
                timeout=60.0,
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

    async def stream_response(self, messages: List[Dict[str, str]], model: str) -> AsyncGenerator[str, None]:
        payload_messages = self._prepare_messages(messages)
        async with httpx.AsyncClient() as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "messages": payload_messages,
                    "stream": True,
                },
                timeout=60.0,
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data_str = line[6:].strip()
                        if data_str == "[DONE]":
                            break
                        import json
                        try:
                            chunk_data = json.loads(data_str)
                            delta = chunk_data["choices"][0]["delta"].get("content", "")
                            if delta:
                                yield delta
                        except json.JSONDecodeError:
                            continue
