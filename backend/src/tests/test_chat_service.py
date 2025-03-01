import pytest
from datetime import datetime
from services.chat_service import ChatService
from models.chat import ChatMessage

@pytest.fixture
def chat_service():
    return ChatService()

def test_chat_message_creation():
    message = ChatMessage(
        role="user",
        content="测试消息",
        timestamp=datetime(2024, 2, 28, 12, 0, 0)
    )
    
    assert message.role == "user"
    assert message.content == "测试消息"
    assert message.timestamp == datetime(2024, 2, 28, 12, 0, 0)
    
def test_chat_message_to_dict():
    message = ChatMessage(
        role="user",
        content="测试消息",
        timestamp=datetime(2024, 2, 28, 12, 0, 0)
    )
    
    message_dict = message.to_dict()
    assert message_dict["role"] == "user"
    assert message_dict["content"] == "测试消息"
    assert message_dict["timestamp"] == "2024-02-28T12:00:00"
    
def test_chat_message_from_dict():
    message_dict = {
        "role": "assistant",
        "content": "测试响应",
        "timestamp": "2024-02-28T12:00:00"
    }
    
    message = ChatMessage.from_dict(message_dict)
    assert message.role == "assistant"
    assert message.content == "测试响应"
    assert message.timestamp == datetime(2024, 2, 28, 12, 0, 0)
    
def test_chat_history(chat_service):
    # 添加测试消息
    chat_service.chat_history.append(
        ChatMessage(
            role="user",
            content="测试消息 1"
        )
    )
    chat_service.chat_history.append(
        ChatMessage(
            role="assistant",
            content="测试响应 1"
        )
    )
    
    history = chat_service.get_chat_history()
    assert len(history) == 2
    assert history[0]["role"] == "user"
    assert history[0]["content"] == "测试消息 1"
    assert history[1]["role"] == "assistant"
    assert history[1]["content"] == "测试响应 1" 