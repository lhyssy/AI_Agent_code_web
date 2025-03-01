from flask import Flask, request, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS
import os
import traceback
import logging
from datetime import datetime

from services.agent_service import MultiAgentSystem
from utils.ws_handler import WebSocketHandler

# 初始化Flask应用
app = Flask(__name__)
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "ai-code-team-secret")

# 配置CORS
cors_allowed_origins = os.environ.get("CORS_ALLOWED_ORIGINS", "*")
CORS(app, resources={r"/*": {"origins": cors_allowed_origins}}, supports_credentials=True)

# 设置Socket.IO
socketio = SocketIO(
    app, 
    cors_allowed_origins=cors_allowed_origins,
    logger=True, 
    engineio_logger=True,
    cors_credentials=True
)

# 初始化WebSocket处理器
ws_handler = WebSocketHandler()
ws_handler.set_socketio(socketio)

# 创建多Agent系统
agent_system = MultiAgentSystem(ws_handler)

# 配置日志
logging.basicConfig(
    level=os.environ.get("LOG_LEVEL", "INFO"),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

@app.route("/")
def home():
    return jsonify({"status": "running", "service": "AI Agent Collaborative System"})

@app.route("/health")
def health_check():
    try:
        return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})
    except Exception as e:
        logger.error(f"健康检查失败: {str(e)}")
        return jsonify({"status": "unhealthy", "error": str(e)}), 500

@app.route("/api/agent/analyze", methods=["POST"])
def analyze():
    try:
        data = request.get_json()
        user_input = data.get("input", "")
        
        if not user_input:
            return jsonify({"success": False, "error": "请提供用户输入"}), 400
            
        # 处理用户输入，获取多个Agent的协同分析结果
        result = agent_system.process_input(user_input)
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"处理分析请求时出错: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({"success": False, "error": f"处理请求失败: {str(e)}"}), 500

@socketio.on("connect")
def handle_connect():
    logger.info("客户端已连接")
    socketio.emit("connection_status", {"status": "connected"})

@socketio.on("disconnect")
def handle_disconnect():
    logger.info("客户端已断开连接")

@socketio.on("user_message")
def handle_message(data):
    logger.info(f"收到用户消息: {data}")
    # 此处只接收消息，实际处理通过/api/agent/analyze接口完成
    socketio.emit("message_received", {"status": "received"})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("DEBUG", "False").lower() == "true"
    logger.info(f"启动应用，端口: {port}, 调试模式: {debug}")
    socketio.run(app, host="0.0.0.0", port=port, debug=debug) 