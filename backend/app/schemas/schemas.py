from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class MessageBase(BaseModel):
    role: str
    content: str

class MessageCreate(MessageBase):
    pass

class MessageResponse(MessageBase):
    id: str
    conversation_id: str
    tokens: int
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationBase(BaseModel):
    title: Optional[str] = "New Conversation"
    model: Optional[str] = "ela-gpt-v4-turbo"
    folder: Optional[str] = "Coding"

class ConversationCreate(ConversationBase):
    pass

class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    model: Optional[str] = None
    folder: Optional[str] = None

class ConversationResponse(ConversationBase):
    id: str
    user_id: int
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str
    model: Optional[str] = "ela-gpt-v4-turbo"
    stream: Optional[bool] = True

class ChatResponse(BaseModel):
    conversation_id: str
    message: MessageResponse
    reply: MessageResponse

class AIModelResponse(BaseModel):
    id: str
    name: str
    provider: str
    description: Optional[str] = None
    context_window: int
    is_active: bool

    class Config:
        from_attributes = True

class UserSettingsResponse(BaseModel):
    theme: str
    default_model: str
    stream_responses: bool

    class Config:
        from_attributes = True
