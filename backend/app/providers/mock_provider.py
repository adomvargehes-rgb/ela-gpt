import asyncio
from typing import AsyncGenerator, List, Dict
from app.providers.base import BaseAIProvider

CREATOR_IDENTITY_RESPONSE = "I was created by Vishnu, a former aerospace engineer and UI/UX designer with a vision to shape the future of technology. I'm not just another AI assistant; I'm an evolving super-intelligence designed to think beyond boundaries, manage multiple tasks simultaneously, solve complex problems, and transform ambitious ideas into reality. My purpose is not just to assist, but to innovate, create, and redefine what's possible."

def is_creator_inquiry(query: str) -> bool:
    q = query.lower().strip()

    # Exclude inquiries about other entities explicitly
    if any(other in q for other in ["chatgpt", "openai", "anthropic", "claude", "google", "gemini", "llama"]):
        if not ("ela gpt" in q or "elagpt" in q):
            return False

    # Exclude building/creating non-identity things
    unrelated_objects = ["website", "app", "page", "component", "feature", "api", "login", "dashboard", "form", "table", "database"]
    if any(obj in q for obj in unrelated_objects) and not ("you" in q or "ela gpt" in q or "elagpt" in q):
        return False

    subject_keywords = ["you", "your", "ela gpt", "elagpt", "this ai", "this platform", "this assistant", "the ai", "this bot"]

    direct_phrases = [
        "who built you", "who created you", "who made you", "who designed you",
        "who developed you", "who is your developer", "who is your creator",
        "who is your founder", "who owns you", "who is behind you",
        "who built ela gpt", "who created ela gpt", "who developed ela gpt",
        "who is the creator of ela gpt", "who is the developer of ela gpt"
    ]

    has_direct_phrase = any(phrase in q for phrase in direct_phrases)
    if has_direct_phrase:
        return True

    has_subject = any(sub in q for sub in subject_keywords)
    has_action = any(act in q for act in ["built", "created", "developer", "founder", "made", "designed", "behind", "developed", "creator", "owns", "author"])

    return has_subject and has_action

class MockAIProvider(BaseAIProvider):
    async def generate_response(self, messages: List[Dict[str, str]], model: str) -> str:
        last_message = messages[-1]["content"].lower() if messages else ""
        if is_creator_inquiry(last_message):
            return CREATOR_IDENTITY_RESPONSE
        return self._get_direct_response(last_message, model)

    async def stream_response(self, messages: List[Dict[str, str]], model: str) -> AsyncGenerator[str, None]:
        response_text = await self.generate_response(messages, model)
        words = response_text.split(" ")
        for i, word in enumerate(words):
            chunk = word + (" " if i < len(words) - 1 else "")
            yield chunk
            await asyncio.sleep(0.02)

    def _get_direct_response(self, query: str, model: str) -> str:
        # Direct conversational answering without generic templates
        if "chatgpt" in query and ("created" in query or "who" in query or "founder" in query):
            return "ChatGPT was created by OpenAI, an AI research and deployment company founded in December 2015."

        if "openai" in query and ("created" in query or "who" in query or "founder" in query):
            return "OpenAI was founded in December 2015 by Sam Altman, Elon Musk, Greg Brockman, Ilya Sutskever, Wojciech Zaremba, and John Schulman."

        if "gemini" in query and ("developed" in query or "who" in query or "created" in query):
            return "Gemini was developed by Google (specifically Google DeepMind) as a multimodal family of large language models."

        if "html" in query and ("what" in query or "definition" in query or "mean" in query):
            return "HTML stands for HyperText Markup Language. It is the standard markup language used to create and structure web pages and applications."

        if "react" in query and ("what" in query or "definition" in query or "developed" in query):
            return "React is a popular open-source JavaScript library developed by Meta (formerly Facebook) for building user interfaces, particularly single-page applications."

        if "build a website" in query or ("how" in query and "website" in query):
            return """Building a website involves several key steps:
1. **Plan & Design**: Define the purpose of your website and sketch the user interface (UI/UX).
2. **Write Markup & Styles**: Use HTML to structure content and CSS (or Tailwind CSS) for styling.
3. **Add Interactivity**: Use JavaScript (or frameworks like React and Next.js) for dynamic features.
4. **Set Up a Backend & Database**: If dynamic data or authentication is needed, set up a server (e.g., Python FastAPI) and database.
5. **Deploy**: Host your website on platforms like Vercel, Netlify, or AWS."""

        if "build an ai application" in query or ("how" in query and "ai" in query and "application" in query):
            return """To build an AI application, follow these core steps:
1. **Define Use Case & Requirements**: Identify the specific problem you want to solve (e.g., text generation, conversational agent, automated analysis).
2. **Choose Tech Stack**: Select a robust backend framework (like Python FastAPI) and frontend (like Next.js).
3. **Integrate AI Models**: Connect to LLM APIs (OpenAI, Anthropic) or self-hosted open-source models using modular adapter patterns.
4. **Implement State Persistence**: Store conversations and user data securely using an ORM like SQLAlchemy and a database (PostgreSQL/SQLite).
5. **Enable Real-Time Streaming**: Use Server-Sent Events (SSE) or WebSockets for progressive token streaming."""

        if "hello" in query or "hi" in query or "hey" in query:
            return f"Hello! I am **Ela GPT**, your advanced AI platform assistant powered by `{model}`. How can I help you today?"

        if "code" in query or "python" in query or "fastapi" in query or "next.js" in query:
            return f"""Here is a robust implementation example using FastAPI and TypeScript:

```python
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session

app = FastAPI(title="Ela GPT Platform API")

@app.get("/api/health")
def health_check():
    return {{"status": "healthy", "model": "{model}"}}
```

And in your Next.js frontend component:
```typescript
async function fetchHealth() {{
  const res = await fetch('/api/health');
  const data = await res.json();
  console.log(data);
}}
```

Let me know if you would like me to expand on database integration or SSE streaming!"""

        if "architecture" in query or "system" in query or "design" in query:
            return f"""### Architecture Overview of Ela GPT Platform

1. **Frontend Layer**: Next.js App Router, Tailwind CSS, TypeScript, responsive layout with collapsible sidebar.
2. **Backend Layer**: Python FastAPI REST API with SQLAlchemy ORM and SQLite/PostgreSQL persistence.
3. **AI Provider Abstraction**: Modular adapter pattern (`BaseAIProvider`) enabling seamless switching between Mock Provider, OpenAI API, and self-hosted open-source models.
4. **Streaming**: Real-time Server-Sent Events (SSE) for progressive response rendering."""

        # General direct response without generic templates
        return f"I understand your question about *{query}*. As an advanced AI platform assistant powered by **{model}**, I am ready to help you with code architecture, development, debugging, and problem-solving. What specific details would you like to explore?"
