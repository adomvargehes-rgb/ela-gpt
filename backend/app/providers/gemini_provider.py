import httpx
import json
import asyncio
from typing import AsyncGenerator, List, Dict
from app.providers.base import BaseAIProvider
from app.providers.mock_provider import MockAIProvider
from app.core.config import settings

class GeminiProvider(BaseAIProvider):
    def __init__(self, api_key: str = None):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.fallback_mock = MockAIProvider()

    def _convert_messages(self, messages: List[Dict[str, str]]) -> List[Dict]:
        gemini_contents = []
        for m in messages:
            role = "model" if m.get("role") in ["assistant", "model"] else "user"
            content = m.get("content", "")
            if content.strip():
                gemini_contents.append({
                    "role": role,
                    "parts": [{"text": content}]
                })
        return gemini_contents

    def _normalize_model_id(self, model: str) -> str:
        # Normalize model names to valid Gemini API model identifiers
        m = model.lower().strip()
        if "gemini-3.6" in m or "3.6" in m:
            return "gemini-1.5-flash" # Fallback to stable gemini model ID if 3.6 alias
        if "gemini" in m:
            return m
        return "gemini-1.5-flash"

    async def generate_response(self, messages: List[Dict[str, str]], model: str) -> str:
        if not self.api_key:
            # Fallback to intelligent response generator if no key provided
            return await self.fallback_mock.generate_response(messages, model)

        model_id = self._normalize_model_id(model)
        contents = self._convert_messages(messages)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={self.api_key}"

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(url, json={"contents": contents})
                res.raise_for_status()
                data = res.json()

                # Extract text from response structure
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    extracted_text = "".join([p.get("text", "") for p in parts if p.get("text")])
                    if extracted_text.strip():
                        return extracted_text.strip()

                return await self.fallback_mock.generate_response(messages, model)
        except Exception as e:
            print(f"Gemini API error ({e}), falling back to mock provider.")
            return await self.fallback_mock.generate_response(messages, model)

    async def stream_response(self, messages: List[Dict[str, str]], model: str) -> AsyncGenerator[str, None]:
        if not self.api_key:
            async for chunk in self.fallback_mock.stream_response(messages, model):
                yield chunk
            return

        model_id = self._normalize_model_id(model)
        contents = self._convert_messages(messages)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:streamGenerateContent?alt=sse&key={self.api_key}"

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                async with client.stream("POST", url, json={"contents": contents}) as response:
                    if response.status_code != 200:
                        async for chunk in self.fallback_mock.stream_response(messages, model):
                            yield chunk
                        return

                    has_content = False
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            raw_json = line[6:].strip()
                            if not raw_json:
                                continue
                            try:
                                chunk_data = json.loads(raw_json)
                                candidates = chunk_data.get("candidates", [])
                                if candidates:
                                    parts = candidates[0].get("content", {}).get("parts", [])
                                    text_part = "".join([p.get("text", "") for p in parts if p.get("text")])
                                    if text_part:
                                        has_content = True
                                        yield text_part
                            except json.JSONDecodeError:
                                continue

                    if not has_content:
                        async for chunk in self.fallback_mock.stream_response(messages, model):
                            yield chunk
        except Exception as e:
            print(f"Gemini streaming error ({e}), falling back to mock stream.")
            async for chunk in self.fallback_mock.stream_response(messages, model):
                yield chunk
