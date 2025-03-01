from flask_socketio import SocketIO
from typing import Dict, Any
import time

class WebSocketHandler:
    """WebSocket处理器，用于发送消息到客户端"""

    def __init__(self, socketio=None):
        """初始化WebSocket处理器
        
        Args:
            socketio: Flask-SocketIO实例
        """
        self.socketio = socketio
        
    def set_socketio(self, socketio):
        """设置SocketIO实例
        
        Args:
            socketio: Flask-SocketIO实例
        """
        self.socketio = socketio
        
    def send_message(self, message_data: dict):
        """发送WebSocket消息
        
        Args:
            message_data: 消息数据字典，包含type和message字段
        """
        if not self.socketio:
            print("警告: socketio未设置，无法发送WebSocket消息")
            return
            
        try:
            # 根据消息类型发送不同的事件
            message_type = message_data.get("type")
            
            print(f"发送WebSocket消息：类型={message_type}")
            
            if message_type == "user_message":
                self.socketio.emit('user_message', message_data["message"])
            elif message_type == "ai_message":
                self.socketio.emit('agent_response', {
                    'agent': message_data["message"]["agent"],
                    'message': message_data["message"]["content"],
                    'timestamp': message_data["message"]["timestamp"]
                })
            elif message_type == "error":
                self.socketio.emit('error', {
                    'message': message_data["message"]["content"]
                })
            else:
                # 默认直接发送整个消息
                self.socketio.emit(message_type, message_data)
                
            print(f"WebSocket消息发送成功：{message_type}")
            
        except Exception as e:
            print(f"发送WebSocket消息失败: {str(e)}")
    
    # 保留旧方法以兼容现有代码
    def emit_agent_response(self, agent_name, message, response_type="message"):
        """发送代理响应（兼容方法）"""
        print(f"使用兼容方法emit_agent_response: {agent_name}")
        self.send_message({
            "type": "ai_message",
            "message": {
                "role": "assistant",
                "agent": agent_name,
                "content": message,
                "timestamp": int(time.time() * 1000)
            }
        })
        
    def emit_connection_update(self, from_agent, to_agent, status):
        """发送连接更新（兼容方法）"""
        print(f"使用兼容方法emit_connection_update: {from_agent} -> {to_agent}")
        self.send_message({
            "type": "connection_update",
            "from": from_agent,
            "to": to_agent,
            "status": status
        })
        
    def emit_agent_status(self, agent_name: str, status: str, data: Dict[str, Any] = None):
        """发送Agent状态更新"""
        status_data = {
            'agentName': agent_name,
            'status': status,
            'data': data,
            'timestamp': self.get_timestamp()
        }
        self.socketio.emit('agent_status', status_data)
        
    def emit_conversation_update(self, message: Dict):
        """发送对话更新"""
        self.socketio.emit('conversation_update', message)
        
    def emit_task_update(self, task: Dict):
        """发送任务更新"""
        self.socketio.emit('task_update', task)
        
    def emit_artifact_update(self, artifact: Dict):
        """发送制品更新"""
        self.socketio.emit('artifact_update', artifact)
        
    def get_timestamp(self) -> str:
        """获取当前时间戳"""
        from datetime import datetime
        return datetime.now().isoformat() 