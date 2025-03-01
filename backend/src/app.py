from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO
from api.agent import agent_bp, agent_system
from utils.ws_handler import WebSocketHandler
import os

def create_app():
    app = Flask(__name__, static_folder='../static')
    CORS(app)
    
    # 初始化 SocketIO
    socketio = SocketIO(app, cors_allowed_origins="*")
    
    # 创建 WebSocket 处理器
    ws_handler = WebSocketHandler(socketio)
    
    # 更新 agent_system 的 WebSocket 处理器
    agent_system.ws_handler = ws_handler
    
    # 注册蓝图
    app.register_blueprint(agent_bp, url_prefix='/api/agent')
    
    # 添加健康检查路由
    @app.route('/health')
    def health_check():
        return {'status': 'healthy'}, 200
        
    # 添加静态文件路由
    @app.route('/')
    def index():
        return send_from_directory(app.static_folder, 'test.html')
        
    return app, socketio

app, socketio = create_app()

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000) 