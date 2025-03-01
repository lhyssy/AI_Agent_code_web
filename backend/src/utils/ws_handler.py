from flask_socketio import SocketIO
from typing import Dict, Any

class WebSocketHandler:
    def __init__(self, socketio: SocketIO):
        self.socketio = socketio
        
    def emit_agent_response(self, agent_name: str, message: str, response_type: str = 'message'):
        """发送Agent响应"""
        data = {
            'agentName': agent_name,
            'message': message,
            'type': response_type,
            'timestamp': self.get_timestamp()
        }
        self.socketio.emit('agent_response', data)
        
    def emit_agent_status(self, agent_name: str, status: str, data: Dict[str, Any] = None):
        """发送Agent状态更新"""
        status_data = {
            'agentName': agent_name,
            'status': status,
            'data': data,
            'timestamp': self.get_timestamp()
        }
        self.socketio.emit('agent_status', status_data)
        
    def emit_connection_update(self, from_agent: str, to_agent: str, active: bool):
        """发送Agent之间的连接更新"""
        connection_data = {
            'from': from_agent,
            'to': to_agent,
            'active': active,
            'timestamp': self.get_timestamp()
        }
        self.socketio.emit('connection_update', connection_data)
        
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