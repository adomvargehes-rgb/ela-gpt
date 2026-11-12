# Ela GPT – Complete AI Platform (Frontend + Backend)

Ela GPT is a modern, scalable full-stack AI platform built with **Next.js**, **TypeScript**, **Tailwind CSS**, **Python FastAPI**, **SQLAlchemy ORM**, and **Server-Sent Events (SSE)** for real-time token streaming.

## 🚀 Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Python FastAPI, REST API architecture, SSE streaming, SQLite / PostgreSQL.
- **AI Architecture**: Modular AI provider architecture (`BaseAIProvider`, `MockAIProvider`, `OpenAIProvider` adapter) enabling seamless switching between mock demonstration and real LLM APIs.

---

## 🛠️ Project Structure

```text
/Ela GPT
  /backend
    /app
      /api         # FastAPI routers (chat, conversations, models, health)
      /core        # Configuration & database session
      /models      # SQLAlchemy models (User, Conversation, Message, AIModel, UserSettings)
      /schemas     # Pydantic request/response schemas
      /services    # Business logic & services
      /providers   # Modular AI provider architecture (Mock & OpenAI adapter)
      /database    # DB setup
    main.py        # FastAPI app entrypoint
    requirements.txt
  /frontend
    /src
      /app         # Next.js App Router (layout.tsx, page.tsx, globals.css)
      /components  # Sidebar, ChatArea, MessageList, MessageItem, ChatComposer, Modals
      /services    # API client & SSE streaming
      /types       # TypeScript interfaces
    package.json
    tsconfig.json
    tailwind.config.ts
  .env.example
  README.md
```

---

## 🏁 Setup & Running Instructions

### 1. Backend Setup (FastAPI)

Open a terminal and navigate to the `backend` directory:

```bash
cd backend
python -m pip install -r requirements.txt
python main.py
```
*(The FastAPI server will start on `http://localhost:8000`. Interactive API docs are available at `http://localhost:8000/docs`)*

### 2. Frontend Setup (Next.js)

Open another terminal and navigate to the `frontend` directory:

```bash
cd frontend
npm install
npm run dev
```
*(The Next.js frontend will start on `http://localhost:3000`)*

---

## 🔌 Real AI Model Integration Guide

The backend features a pluggable AI provider architecture defined in `backend/app/providers/base.py`. To switch from the contextual mock provider to a real OpenAI or self-hosted model (such as Llama 3 via vLLM):

1. Set your API key and base URL in `backend/.env`:
   ```env
   DEFAULT_AI_PROVIDER="openai"
   OPENAI_API_KEY="your-api-key-here"
   OPENAI_BASE_URL="https://api.openai.com/v1" # or your self-hosted vLLM endpoint
   ```
2. The `OpenAIProvider` adapter (`backend/app/providers/openai_adapter.py`) will automatically handle non-streaming completions and Server-Sent Events (SSE) streaming without requiring any changes to frontend components.
