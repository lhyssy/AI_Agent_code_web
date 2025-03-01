from datetime import datetime
from typing import Dict, Literal, List, Optional
from uuid import uuid4

class ChatSession:
    def __init__(
        self,
        session_id: str = None,
        title: str = None,
        created_at: datetime = None
    ):
        self.session_id = session_id or str(uuid4())
        self.title = title or "新对话"
        self.created_at = created_at or datetime.utcnow()
        self.messages: List[ChatMessage] = []
        self.is_archived = False
        
    def to_dict(self) -> Dict:
        return {
            "session_id": self.session_id,
            "title": self.title,
            "created_at": self.created_at.isoformat(),
            "messages": [msg.to_dict() for msg in self.messages],
            "is_archived": self.is_archived
        }
        
    def add_message(self, message: 'ChatMessage'):
        self.messages.append(message)
        # 如果是第一条用户消息，根据内容更新会话标题
        if len(self.messages) == 1 and message.role == "user":
            self.update_title(message.content)
            
    def update_title(self, content: str):
        # 取消息的前20个字符作为标题
        self.title = content[:20] + "..." if len(content) > 20 else content

class ChatMessage:
    def __init__(
        self,
        role: Literal["user", "assistant"],
        content: str,
        message_id: str = None,
        session_id: str = None,
        timestamp: datetime = None,
        metadata: Optional[Dict] = None
    ):
        self.message_id = message_id or str(uuid4())
        self.role = role
        self.content = content
        self.session_id = session_id
        self.timestamp = timestamp or datetime.utcnow()
        self.metadata = metadata or {}
        
    def to_dict(self) -> Dict:
        return {
            "message_id": self.message_id,
            "role": self.role,
            "content": self.content,
            "session_id": self.session_id,
            "timestamp": self.timestamp.isoformat(),
            "metadata": self.metadata
        }
        
    @classmethod
    def from_dict(cls, data: Dict) -> 'ChatMessage':
        return cls(
            message_id=data.get("message_id"),
            role=data["role"],
            content=data["content"],
            session_id=data.get("session_id"),
            timestamp=datetime.fromisoformat(data["timestamp"])
            if "timestamp" in data else None,
            metadata=data.get("metadata", {})
        ) 