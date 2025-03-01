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
│   ├── src/              # 源代码目录
│   │   ├── api/         # API接口目录
│   │   ├── utils/       # 工具函数目录
│   │   └── app.py      # 主应用入口
│   ├── static/          # 静态资源目录
│   └── requirements.txt  # 依赖配置文件
│
└── README.md             # 项目说明文档
```

## 项目重构计划

经过代码审查，我们发现项目中存在一些重复的代码和结构，需要进行重构以提高代码质量和维护性。

### 1. 前端重构计划

#### 1.1 组件层重构
- **创建公共UI组件库**: 将重复使用的UI元素（按钮、输入框、卡片等）抽象为通用组件
- **优化组件层次结构**: 减少组件嵌套层级，提高渲染性能
- **代码分割优化**: 使用动态导入减少初始加载体积

#### 1.2 逻辑层重构
- **自定义Hook封装**: 将重复的状态逻辑封装为自定义Hooks
  - 创建`useWebSocket`钩子统一管理WebSocket连接和消息处理
  - 创建`useMessageProcessor`钩子处理消息格式化和代码块提取
  - 创建`useLocalStorage`钩子统一管理本地存储逻辑
- **Context优化**: 拆分ChatContext为多个专用Context，提高性能和可维护性

#### 1.3 工具函数重构
- **创建统一Utils库**: 将分散在各文件的工具函数合并到集中的工具库
- **TypeScript类型共享**: 建立统一的类型定义文件减少重复定义

### 2. 后端重构计划

#### 2.1 模块化重构
- **服务层分离**: 将业务逻辑从处理器中分离，创建专门的服务类
- **依赖注入模式**: 采用依赖注入减少模块间的硬依赖

#### 2.2 工具类优化
- **统一错误处理**: 创建全局错误处理机制替代分散的try-catch
- **WebSocket消息统一**: 标准化WebSocket消息格式和处理流程

### 3. 文档更新计划
- **统一文档风格**: 所有Markdown文档使用一致的格式和结构
- **API文档生成**: 添加自动生成API文档的工具
- **添加架构图**: 使用图表明确展示重构后的系统架构

### 4. 实施进度
- **第一阶段**: 前端组件和工具函数重构 (2周)
- **第二阶段**: 后端服务层和工具类重构 (2周)
- **第三阶段**: 文档更新和最终测试 (1周)

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

**方法1：使用启动脚本 (Windows)** 
```
双击运行 start-services.bat
```
这将同时启动前端和后端服务。

**方法2：分别启动**

前端:
```bash
cd frontend
npm run dev
```

后端:
```bash
cd backend
cd src
python app.py
```

访问 http://localhost:3000 查看应用

## 问题排查

### 常见问题

1. **"API服务未连接"错误**
   - 确保后端服务已启动并监听在端口5000上
   - 检查防火墙或安全软件是否阻止了连接
   - 在Windows上，使用`start-services.bat`脚本启动服务
   - 在浏览器中访问 http://localhost:5000/health 测试后端健康状态

2. **"Failed to fetch"错误**
   - 这通常表示前端无法连接到后端API
   - 确保后端服务正在运行，检查启动命令是否有错误
   - 检查浏览器控制台是否有更详细的错误信息

3. **WebSocket连接断开**
   - 检查后端日志查看是否有错误信息
   - 确保网络稳定，没有代理干扰WebSocket连接

4. **代码高亮不显示**
   - 确保`react-syntax-highlighter`依赖已正确安装
   - 清除浏览器缓存后重试

### 环境要求

- Node.js >= 14.0.0 (推荐使用 Node.js 18)
- Python >= 3.8 (推荐使用 Python 3.10)
- SQLite3
- 现代浏览器（Chrome, Firefox, Safari, Edge）

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

## 最近优化更新

我们对聊天应用进行了以下优化：

### 前端优化

1. **消息加载优化**：
   - 添加了历史消息分页加载功能
   - 实现了消息备份和恢复机制，防止状态丢失
   - 限制每个会话的最大消息数量，提高性能

2. **UI/UX改进**：
   - 添加了消息动画效果，提升用户体验
   - 实现了滚动控制按钮，方便查看历史消息
   - 优化了代码块显示和复制功能
   - 添加了消息状态指示器（发送中、发送失败等）

3. **错误处理**：
   - 增强了WebSocket消息处理的错误检测
   - 添加了消息备份机制，防止数据丢失
   - 修复了`agentName`和`agent`字段不一致的问题

4. **性能优化**：
   - 使用React.memo减少不必要的重渲染
   - 添加了消息加载状态指示器
   - 优化了大量消息的渲染性能

#### 聊天窗口滚动优化
- **滚动控制按钮**: 添加了明显的上下滚动按钮，使用户可以更方便地查看历史消息
- **滚动位置指示器**: 在窗口右侧添加了滚动位置指示条，直观显示当前位置
- **自动滚动控制**: 优化了自动滚动逻辑，当用户向上滚动查看历史消息时自动禁用，有新消息时显示提示
- **加载更多按钮**: 添加了加载更多历史消息的按钮，并在加载过程中显示加载状态
- **平滑滚动效果**: 为所有滚动操作添加了平滑动画效果，提升用户体验

### 后端优化

1. **WebSocket处理**：
   - 修复了WebSocket消息格式不一致的问题
   - 确保`agentName`字段正确传递

2. **测试模式增强**：
   - 改进了测试模式下的响应多样性
   - 为不同代理添加了更专业的响应内容

### 工具和脚本

1. **启动脚本**：
   - 创建了一键启动前后端服务的批处理脚本
   - 添加了适当的延迟确保服务按顺序启动

2. **开发工具**：
   - 添加了代码格式化和语法高亮功能
   - 集成了framer-motion库用于动画效果

## 使用方法

要启动整个应用，只需运行：

```
start-services.bat
```

这将依次启动后端和前端服务。

- 前端访问地址: http://localhost:3000
- 后端API地址: http://localhost:5000 