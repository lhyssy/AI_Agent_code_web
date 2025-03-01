# AI Code Team 后端

这是 AI Code Team 项目的后端部分，使用 Python Flask 框架开发。

## 功能特点

- 基于 OpenAI API 的智能对话
- WebSocket 实时通信
- RESTful API 设计
- 完整的测试覆盖
- 模块化的代码结构

## 项目结构

```
backend/
├── src/
│   ├── api/            # API 路由
│   ├── models/         # 数据模型
│   ├── services/       # 业务逻辑
│   ├── utils/          # 工具类
│   ├── tests/          # 测试文件
│   ├── app.py         # 应用入口
│   └── config.py      # 配置文件
├── .env.example       # 环境变量示例
├── requirements.txt   # 项目依赖
└── README.md         # 项目文档
```

## 开发环境要求

- Python 3.8+
- pip
- virtualenv（推荐）

## 快速开始

1. 创建并激活虚拟环境：

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

2. 安装依赖：

```bash
pip install -r requirements.txt
```

3. 配置环境变量：

```bash
cp .env.example .env
# 编辑 .env 文件，填入必要的配置信息
```

4. 运行开发服务器：

```bash
cd src
python app.py
```

服务器将在 http://localhost:5000 启动。

## API 文档

### 聊天相关

#### 发送消息
- 端点：`POST /api/chat/send`
- 请求体：
```json
{
    "message": "用户消息"
}
```
- 响应：
```json
{
    "response": "AI 响应内容"
}
```

#### 获取历史记录
- 端点：`GET /api/chat/history`
- 响应：
```json
{
    "history": [
        {
            "role": "user",
            "content": "用户消息",
            "timestamp": "2024-02-28T12:00:00"
        },
        {
            "role": "assistant",
            "content": "AI 响应",
            "timestamp": "2024-02-28T12:00:01"
        }
    ]
}
```

## 测试

运行测试：

```bash
pytest
```

运行测试覆盖率报告：

```bash
pytest --cov=src
```

## 代码质量

运行代码格式化：

```bash
black src
```

运行代码检查：

```bash
flake8 src
mypy src
```

## 部署

1. 确保所有环境变量都已正确配置
2. 使用生产级别的 WSGI 服务器（如 Gunicorn）
3. 配置反向代理（如 Nginx）

示例 Gunicorn 命令：

```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License 