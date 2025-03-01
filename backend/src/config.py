import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask 配置
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    
    # 数据库配置
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # 百度云配置
    BAIDU_API_KEY = os.getenv('BAIDU_API_KEY', '')
    BAIDU_SECRET_KEY = os.getenv('BAIDU_SECRET_KEY', '')
    BAIDU_MODEL_NAME = os.getenv('BAIDU_MODEL_NAME', 'ERNIE-Bot-4')
    
    # JWT 配置
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-jwt-secret')
    JWT_ACCESS_TOKEN_EXPIRES = 3600  # 1小时
    
    # CORS 配置
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')
    
    # Socket.IO 配置
    SOCKETIO_PING_TIMEOUT = 60
    SOCKETIO_PING_INTERVAL = 25
    
    # 日志配置
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE', 'app.log') 