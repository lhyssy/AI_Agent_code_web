# AI Code Team

一个基于多Agent AI的代码生成协作平台，通过AI代理团队将自然语言需求转化为可运行代码。

## 项目特点

- 🤖 **智能AI团队**: 由多个专业角色组成的AI代理团队，协同完成代码生成任务
- 🎨 **优雅的界面**: 现代化的深色主题设计，提供流畅的用户体验
- 🔄 **实时协作**: 可视化的团队协作流程，直观展示任务进展
- 💻 **代码生成**: 自动生成高质量、可运行的代码
- 📱 **响应式设计**: 完美支持各种设备和屏幕尺寸

## 项目结构

```
AI_Agent_code_web/
├── docs/                    # 文档目录
│   ├── PRD.md              # 产品需求文档
│   ├── UI_Design.md        # 界面设计文档
│   └── Architecture.md     # 系统架构设计文档
│
├── frontend/               # 前端应用目录
│   ├── src/               # 源代码目录
│   │   ├── app/          # 应用主目录
│   │   ├── components/   # 组件目录
│   │   │   ├── Chat/    # 聊天相关组件
│   │   │   ├── Flow/    # 流程图相关组件
│   │   │   └── Code/    # 代码展示相关组件
│   │   ├── styles/      # 样式文件
│   │   └── lib/         # 工具库
│   └── public/          # 静态资源
│
├── backend/               # 后端应用目录
│   ├── app/              # 应用主目录
│   ├── config.py         # 配置文件
│   └── run.py            # 启动脚本
│
└── README.md             # 项目说明文档
```

## 已实现功能

### 1. 团队协作流程图
- ✅ 可视化团队成员节点
- ✅ 动态连接线展示
- ✅ 节点拖拽功能
- ✅ 角色信息显示
- ✅ 位置重置功能

### 2. AI 聊天窗口
- ✅ 多轮对话支持
- ✅ 代码块语法高亮
- ✅ AI 角色标识
- ✅ 消息时间戳
- ✅ 加载状态动画

### 3. 代码展示
- 🚧 代码高亮显示
- 🚧 文件树导航
- 🚧 实时预览
- 🚧 代码编辑

## 技术栈

### 前端
- Next.js 14
- React 19
- TailwindCSS
- ReactFlow
- Socket.IO Client
- React Syntax Highlighter
- Phosphor Icons

### 后端
- Python Flask
- AppBuilder SDK
- SQLite
- WebSocket

## 开发环境要求

- Node.js >= 14.0.0
- Python >= 3.8
- SQLite3

## 快速开始

1. 克隆项目
```bash
git clone https://github.com/yourusername/AI_Agent_code_web.git
cd AI_Agent_code_web
```

2. 安装前端依赖
```bash
cd frontend
npm install
```

3. 安装后端依赖
```bash
cd backend
pip install -r requirements.txt
```

4. 启动开发服务器

前端:
```bash
cd frontend
npm run dev
```

后端:
```bash
cd backend
python run.py
```

访问 http://localhost:3000 查看应用

## AI代理团队

### Mike (Team Leader)
- 负责任务分配和团队协调
- 与用户直接对话
- 确保项目目标达成

### Emma (Product Manager)
- 负责需求分析和功能规划
- 提供用户体验建议
- 确保产品质量

### Bob (Architect)
- 负责系统架构设计
- 技术选型建议
- 代码结构规划

### Alex (Engineer)
- 负责具体代码实现
- 代码优化
- 测试验证

### David (Data Analyst)
- 负责数据分析
- 性能优化
- 业务洞察

## 开发路线图

### 第一阶段 (已完成)
- ✅ 项目基础架构搭建
- ✅ 团队协作流程图实现
- ✅ 基础UI组件开发

### 第二阶段 (进行中)
- 🚧 AI聊天功能完善
- 🚧 代码生成与展示
- 🚧 实时协作优化

### 第三阶段 (计划中)
- 📅 用户认证系统
- 📅 项目管理功能
- 📅 协作模板库

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 联系方式

项目维护者 - [@yourusername](https://github.com/yourusername)

项目链接: [https://github.com/yourusername/AI_Agent_code_web](https://github.com/yourusername/AI_Agent_code_web) 