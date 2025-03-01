from flask_socketio import SocketIO
from typing import Dict, Any, Optional, List, Union
from datetime import datetime
import time
import json
import logging

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('ws_handler')

class WebSocketMessageType:
    """WebSocket消息类型枚举"""
    USER_MESSAGE = 'user_message'
    AGENT_RESPONSE = 'agent_response'
    CONNECTION_UPDATE = 'connection_update'
    AGENT_STATUS = 'agent_status'
    CONVERSATION_UPDATE = 'conversation_update'
    TASK_UPDATE = 'task_update'
    ARTIFACT_UPDATE = 'artifact_update'
    ERROR = 'error'

class WebSocketHandler:
    """WebSocket处理器，用于发送消息到客户端"""

    def __init__(self, socketio: Optional[SocketIO] = None):
        """初始化WebSocket处理器
        
        Args:
            socketio: Flask-SocketIO实例
        """
        self.socketio = socketio
        
    def set_socketio(self, socketio: SocketIO) -> None:
        """设置SocketIO实例
        
        Args:
            socketio: Flask-SocketIO实例
        """
        self.socketio = socketio
        logger.info("SocketIO实例已设置")
        
    def send_message(self, message_data: Dict[str, Any]) -> bool:
        """发送WebSocket消息
        
        Args:
            message_data: 消息数据字典，包含type和message字段
            
        Returns:
            bool: 发送是否成功
        """
        if not self.socketio:
            logger.warning("socketio未设置，无法发送WebSocket消息")
            return False
            
        try:
            # 确保消息包含必要字段
            if 'type' not in message_data:
                logger.error("消息缺少type字段")
                return False
                
            # 添加时间戳（如果没有）
            if 'timestamp' not in message_data:
                message_data['timestamp'] = self.get_timestamp()
                
            message_type = message_data.get("type")
            logger.info(f"发送WebSocket消息：类型={message_type}")
            
            # 根据消息类型标准化消息格式
            if message_type == WebSocketMessageType.USER_MESSAGE:
                self._emit_user_message(message_data)
            elif message_type == "ai_message" or message_type == WebSocketMessageType.AGENT_RESPONSE:
                self._emit_agent_response(message_data)
            elif message_type == WebSocketMessageType.ERROR:
                self._emit_error(message_data)
            elif message_type == WebSocketMessageType.CONNECTION_UPDATE:
                self._emit_connection_update(message_data)
            elif message_type == WebSocketMessageType.AGENT_STATUS:
                self._emit_agent_status(message_data)
            elif message_type == WebSocketMessageType.CONVERSATION_UPDATE:
                self._emit_conversation_update(message_data)
            elif message_type == WebSocketMessageType.TASK_UPDATE:
                self._emit_task_update(message_data)
            elif message_type == WebSocketMessageType.ARTIFACT_UPDATE:
                self._emit_artifact_update(message_data)
            else:
                # 默认直接发送整个消息
                self.socketio.emit(message_type, message_data)
                
            logger.info(f"WebSocket消息发送成功：{message_type}")
            return True
            
        except Exception as e:
            logger.error(f"发送WebSocket消息失败: {str(e)}", exc_info=True)
            return False
    
    def _emit_user_message(self, message_data: Dict[str, Any]) -> None:
        """发送用户消息"""
        self.socketio.emit(WebSocketMessageType.USER_MESSAGE, {
            'message': message_data.get("message", {}),
            'timestamp': message_data.get("timestamp", self.get_timestamp()),
            'type': WebSocketMessageType.USER_MESSAGE,
            'sessionId': message_data.get("sessionId")
        })
    
    def _emit_agent_response(self, message_data: Dict[str, Any]) -> None:
        """发送代理响应"""
        message = message_data.get("message", {})
        agent_name = message.get("agent", "")
        
        self.socketio.emit(WebSocketMessageType.AGENT_RESPONSE, {
            'message': {
                'content': message.get("content", ""),
                'agent': agent_name
            },
            'agentName': agent_name,  # 确保agentName字段与agent一致
            'timestamp': message_data.get("timestamp", self.get_timestamp()),
            'type': WebSocketMessageType.AGENT_RESPONSE,
            'sessionId': message_data.get("sessionId")
        })
    
    def _emit_error(self, message_data: Dict[str, Any]) -> None:
        """发送错误消息"""
        error_message = message_data.get("message", {})
        if isinstance(error_message, str):
            error_content = error_message
            error_code = "UNKNOWN_ERROR"
        else:
            error_content = error_message.get("content", "未知错误")
            error_code = error_message.get("code", "UNKNOWN_ERROR")
            
        self.socketio.emit(WebSocketMessageType.ERROR, {
            'error': {
                'code': error_code,
                'message': error_content
            },
            'timestamp': message_data.get("timestamp", self.get_timestamp()),
            'type': WebSocketMessageType.ERROR
        })
    
    def _emit_connection_update(self, message_data: Dict[str, Any]) -> None:
        """发送连接更新"""
        self.socketio.emit(WebSocketMessageType.CONNECTION_UPDATE, {
            'from': message_data.get("from", ""),
            'to': message_data.get("to", ""),
            'status': message_data.get("status", ""),
            'timestamp': message_data.get("timestamp", self.get_timestamp()),
            'type': WebSocketMessageType.CONNECTION_UPDATE
        })
    
    def _emit_agent_status(self, message_data: Dict[str, Any]) -> None:
        """发送Agent状态更新"""
        agents_data = message_data.get("agents", [])
        if not agents_data and "agentName" in message_data:
            # 兼容旧格式
            agents_data = [{
                'name': message_data.get("agentName", ""),
                'status': message_data.get("status", ""),
                'role': message_data.get("role", "")
            }]
            
        self.socketio.emit(WebSocketMessageType.AGENT_STATUS, {
            'agents': agents_data,
            'timestamp': message_data.get("timestamp", self.get_timestamp()),
            'type': WebSocketMessageType.AGENT_STATUS
        })
    
    def _emit_conversation_update(self, message_data: Dict[str, Any]) -> None:
        """发送对话更新"""
        self.socketio.emit(WebSocketMessageType.CONVERSATION_UPDATE, {
            'session': message_data.get("session", {}),
            'timestamp': message_data.get("timestamp", self.get_timestamp()),
            'type': WebSocketMessageType.CONVERSATION_UPDATE
        })
    
    def _emit_task_update(self, message_data: Dict[str, Any]) -> None:
        """发送任务更新"""
        self.socketio.emit(WebSocketMessageType.TASK_UPDATE, {
            'task': message_data.get("task", {}),
            'timestamp': message_data.get("timestamp", self.get_timestamp()),
            'type': WebSocketMessageType.TASK_UPDATE
        })
    
    def _emit_artifact_update(self, message_data: Dict[str, Any]) -> None:
        """发送制品更新"""
        self.socketio.emit(WebSocketMessageType.ARTIFACT_UPDATE, {
            'artifact': message_data.get("artifact", {}),
            'timestamp': message_data.get("timestamp", self.get_timestamp()),
            'type': WebSocketMessageType.ARTIFACT_UPDATE
        })
        
    # 兼容方法
    def emit_agent_response(self, agent_name: str, message: str, response_type: str = "message") -> bool:
        """发送代理响应（兼容方法）"""
        logger.info(f"使用兼容方法emit_agent_response: {agent_name}")
        return self.send_message({
            "type": WebSocketMessageType.AGENT_RESPONSE,
            "message": {
                "role": "assistant",
                "agent": agent_name,
                "content": message,
                "timestamp": int(time.time() * 1000)
            }
        })
        
    def emit_connection_update(self, from_agent: str, to_agent: str, status: str) -> bool:
        """发送连接更新（兼容方法）"""
        logger.info(f"使用兼容方法emit_connection_update: {from_agent} -> {to_agent}")
        return self.send_message({
            "type": WebSocketMessageType.CONNECTION_UPDATE,
            "from": from_agent,
            "to": to_agent,
            "status": status
        })
        
    def emit_agent_status(self, agent_name: str, status: str, data: Dict[str, Any] = None) -> bool:
        """发送Agent状态更新（兼容方法）"""
        logger.info(f"使用兼容方法emit_agent_status: {agent_name}")
        return self.send_message({
            "type": WebSocketMessageType.AGENT_STATUS,
            "agentName": agent_name,
            "status": status,
            "data": data
        })
        
    def emit_conversation_update(self, message: Dict[str, Any]) -> bool:
        """发送对话更新（兼容方法）"""
        return self.send_message({
            "type": WebSocketMessageType.CONVERSATION_UPDATE,
            "session": message
        })
        
    def emit_task_update(self, task: Dict[str, Any]) -> bool:
        """发送任务更新（兼容方法）"""
        return self.send_message({
            "type": WebSocketMessageType.TASK_UPDATE,
            "task": task
        })
        
    def emit_artifact_update(self, artifact: Dict[str, Any]) -> bool:
        """发送制品更新（兼容方法）"""
        return self.send_message({
            "type": WebSocketMessageType.ARTIFACT_UPDATE,
            "artifact": artifact
        })
        
    def get_timestamp(self) -> str:
        """获取当前时间戳"""
        return datetime.now().isoformat() 