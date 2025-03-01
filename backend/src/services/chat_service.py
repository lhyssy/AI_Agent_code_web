from typing import List, Dict, Optional
from models.chat import ChatMessage, ChatSession
from utils.baidu_client import BaiduClient

class ChatService:
    def __init__(self):
        self.baidu_client = BaiduClient()
        self.sessions: Dict[str, ChatSession] = {}
        
    def create_session(self, title: str = None) -> Dict:
        """创建新的聊天会话"""
        session = ChatSession(title=title)
        self.sessions[session.session_id] = session
        return session.to_dict()
        
    def get_session(self, session_id: str) -> Optional[Dict]:
        """获取指定会话"""
        session = self.sessions.get(session_id)
        return session.to_dict() if session else None
        
    def list_sessions(self) -> List[Dict]:
        """获取所有会话列表"""
        return [
            {
                "session_id": session.session_id,
                "title": session.title,
                "created_at": session.created_at.isoformat(),
                "message_count": len(session.messages),
                "is_archived": session.is_archived
            }
            for session in self.sessions.values()
        ]
        
    def archive_session(self, session_id: str) -> bool:
        """归档会话"""
        if session_id in self.sessions:
            self.sessions[session_id].is_archived = True
            return True
        return False
        
    def delete_session(self, session_id: str) -> bool:
        """删除会话"""
        if session_id in self.sessions:
            del self.sessions[session_id]
            return True
        return False
        
    def process_message(self, session_id: str, message: str, context: Optional[Dict] = None) -> Dict:
        """处理用户消息并返回 AI 响应"""
        try:
            # 获取或创建会话
            session = self.sessions.get(session_id)
            if not session:
                session = ChatSession(session_id=session_id)
                self.sessions[session_id] = session
            
            # 创建新的聊天消息
            user_message = ChatMessage(
                role="user",
                content=message,
                session_id=session_id,
                metadata=context
            )
            session.add_message(user_message)
            
            # 获取 AI 响应
            messages_for_api = [msg.to_dict() for msg in session.messages]
            ai_response = self.baidu_client.get_completion(messages=messages_for_api)
            
            # 保存 AI 响应
            ai_message = ChatMessage(
                role="assistant",
                content=ai_response,
                session_id=session_id
            )
            session.add_message(ai_message)
            
            return {
                "message_id": ai_message.message_id,
                "content": ai_response,
                "role": "assistant",
                "session": session.to_dict()
            }
            
        except Exception as e:
            raise Exception(f"处理消息时出错: {str(e)}")
            
    def get_session_history(self, session_id: str) -> List[Dict]:
        """获取指定会话的历史记录"""
        session = self.sessions.get(session_id)
        if not session:
            return []
        return [msg.to_dict() for msg in session.messages]
        
    def clear_session_history(self, session_id: str) -> bool:
        """清空指定会话的历史记录"""
        session = self.sessions.get(session_id)
        if session:
            session.messages.clear()
            return True
        return False
        
    def update_session_title(self, session_id: str, title: str) -> bool:
        """更新会话标题"""
        session = self.sessions.get(session_id)
        if session:
            session.title = title
            return True
        return False 