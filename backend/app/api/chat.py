from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import uuid
import json
from datetime import datetime
from app.core.database import get_db
from app.models.models import Conversation, Message
from app.schemas.schemas import ChatRequest, ChatResponse, MessageResponse
from app.providers.factory import get_ai_provider
from app.api.conversations import get_or_create_default_user

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(payload: ChatRequest, db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)

    # Get or create conversation
    conv_id = payload.conversation_id
    if not conv_id:
        conv_id = str(uuid.uuid4())
        title = (payload.message[:30] + "...") if len(payload.message) > 30 else payload.message
        conv = Conversation(
            id=conv_id,
            user_id=user.id,
            title=title,
            model=payload.model or "ela-gpt-v4-turbo"
        )
        db.add(conv)
        db.commit()
    else:
        conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
        if not conv:
            conv = Conversation(
                id=conv_id,
                user_id=user.id,
                title="New Chat",
                model=payload.model or "ela-gpt-v4-turbo"
            )
            db.add(conv)
            db.commit()

    # Save user message
    user_msg_id = str(uuid.uuid4())
    user_msg = Message(
        id=user_msg_id,
        conversation_id=conv.id,
        role="user",
        content=payload.message,
        tokens=len(payload.message.split())
    )
    db.add(user_msg)
    db.commit()

    # Fetch conversation history for context
    past_messages = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at.asc()).all()
    formatted_messages = [{"role": m.role, "content": m.content} for m in past_messages]

    # Select AI provider based on model name
    model_to_use = payload.model or conv.model or "ela-gpt-v4-turbo"
    ai_provider = get_ai_provider(model_name=model_to_use)
    reply_content = await ai_provider.generate_response(formatted_messages, model_to_use)

    # Save assistant message
    assistant_msg_id = str(uuid.uuid4())
    assistant_msg = Message(
        id=assistant_msg_id,
        conversation_id=conv.id,
        role="assistant",
        content=reply_content,
        tokens=len(reply_content.split())
    )
    db.add(assistant_msg)

    # Update conversation timestamp
    conv.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(assistant_msg)
    db.refresh(user_msg)

    return ChatResponse(
        conversation_id=conv.id,
        message=MessageResponse.model_validate(user_msg),
        reply=MessageResponse.model_validate(assistant_msg)
    )

@router.get("/chat/stream")
async def chat_stream_endpoint(conversation_id: str, message: str, model: str = "ela-gpt-v4-turbo", db: Session = Depends(get_db)):
    user = get_or_create_default_user(db)

    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        title = (message[:30] + "...") if len(message) > 30 else message
        conv = Conversation(
            id=conversation_id,
            user_id=user.id,
            title=title,
            model=model
        )
        db.add(conv)
        db.commit()

    # Save user message
    user_msg_id = str(uuid.uuid4())
    user_msg = Message(
        id=user_msg_id,
        conversation_id=conv.id,
        role="user",
        content=message,
        tokens=len(message.split())
    )
    db.add(user_msg)
    db.commit()

    past_messages = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at.asc()).all()
    formatted_messages = [{"role": m.role, "content": m.content} for m in past_messages]

    ai_provider = get_ai_provider(model_name=model)

    async def event_generator():
        full_reply = ""
        try:
            async for chunk in ai_provider.stream_response(formatted_messages, model):
                if chunk:
                    full_reply += chunk
                    yield f"data: {json.dumps({'chunk': chunk, 'conversation_id': conv.id})}\n\n"

            if not full_reply.strip():
                full_reply = "I am processing your request. Please let me know how I can assist you further."
                yield f"data: {json.dumps({'chunk': full_reply, 'conversation_id': conv.id})}\n\n"

            # Save assistant message after stream completes
            assistant_msg_id = str(uuid.uuid4())
            assistant_msg = Message(
                id=assistant_msg_id,
                conversation_id=conv.id,
                role="assistant",
                content=full_reply,
                tokens=len(full_reply.split())
            )
            db.add(assistant_msg)
            conv.updated_at = datetime.utcnow()
            db.commit()

            yield f"data: {json.dumps({'done': True, 'conversation_id': conv.id, 'reply_id': assistant_msg_id})}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
