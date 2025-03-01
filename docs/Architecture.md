# AI Code Team - 系统架构设计文档

## 1. 系统架构概述

### 1.1 架构设计原则
- 模块化设计
- 高内聚低耦合
- 可扩展性
- 实时响应
- 状态管理清晰

### 1.2 技术栈选择
#### 前端技术栈
- **框架**: Next.js 14 + React 19
- **样式**: TailwindCSS
- **状态管理**: React Hooks
- **实时通信**: Socket.IO Client
- **可视化**: ReactFlow
- **UI组件**:
  - React Syntax Highlighter
  - Phosphor Icons
  - Radix UI

#### 后端技术栈
- **框架**: Python Flask
- **AI集成**: AppBuilder SDK
- **数据存储**: SQLite
- **实时通信**: WebSocket
- **API设计**: RESTful

## 2. 前端架构设计

### 2.1 目录结构
```
frontend/
├── src/
│   ├── app/                 # 应用路由和页面
│   ├── components/         # 可复用组件
│   │   ├── Chat/          # 聊天相关组件
│   │   │   └── ChatWindow.tsx
│   │   ├── Flow/          # 流程图相关组件
│   │   │   └── CollaborationFlow.tsx
│   │   └── Code/          # 代码展示组件
│   ├── hooks/             # 自定义Hooks
│   │   ├── useWebSocket.ts
│   │   ├── useMessageProcessor.ts
│   │   └── useLocalStorage.ts
│   ├── types/             # 类型定义
│   │   ├── chat.ts
│   │   ├── api.ts
│   │   └── socket.ts
│   ├── styles/            # 全局样式
│   └── lib/               # 工具和服务
├── public/                # 静态资源
└── package.json          # 项目配置
```

### 2.2 核心组件设计

#### ChatWindow 组件
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agentName?: string;
  codeBlocks?: Array<{
    language: string;
    code: string;
  }>;
}

// 组件职责：
// 1. 消息展示和管理
// 2. 代码块解析和高亮
// 3. 实时通信处理
// 4. 状态管理
// 5. 用户输入处理
```

#### CollaborationFlow 组件
```typescript
interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  color: string;
}

interface FlowNode extends Node {
  data: {
    label: ReactNode;
    member: TeamMember;
  };
}

// 组件职责：
// 1. 节点管理和渲染
// 2. 连接线处理
// 3. 拖拽交互
// 4. 信息展示
// 5. 位置重置
```

### 2.3 状态管理
- 使用 React Hooks 进行本地状态管理
- 实时数据通过 WebSocket 同步
- 组件状态通过 Props 和回调传递

### 2.4 通信机制
- RESTful API 用于常规请求
- WebSocket 用于实时更新
- 事件总线用于组件间通信

### 2.5 自定义Hooks设计

#### useWebSocket
```typescript
function useWebSocket(options: UseWebSocketOptions = {}) {
  // 管理WebSocket连接状态
  // 处理消息接收和错误
  // 提供重连和健康检查方法
}
```

#### useMessageProcessor
```typescript
function useMessageProcessor() {
  // 处理消息格式化
  // 提取代码块
  // 消息备份和恢复
}
```

#### useLocalStorage
```typescript
function useLocalStorage<T>(key: string, initialValue: T) {
  // 管理本地存储数据
  // 提供读写和删除方法
  // 处理序列化和反序列化
}
```

## 3. 后端架构设计

### 3.1 目录结构
```
backend/
├── src/
│   ├── api/              # API 路由
│   ├── models/          # 数据模型
│   ├── services/        # 业务逻辑
│   │   ├── agent_service.py
│   │   └── chat_service.py
│   └── utils/           # 工具函数
│       ├── ws_handler.py
│       └── baidu_client.py
├── config.py            # 配置文件
└── app.py              # 启动脚本
```

### 3.2 API 设计
- RESTful 风格
- WebSocket 实时通信
- 统一的响应格式

### 3.3 数据模型
- 用户会话
- 消息历史
- 代码生成记录

### 3.4 WebSocket消息标准化

#### 消息类型枚举
```python
class WebSocketMessageType:
    USER_MESSAGE = 'user_message'
    AGENT_RESPONSE = 'agent_response'
    CONNECTION_UPDATE = 'connection_update'
    AGENT_STATUS = 'agent_status'
    CONVERSATION_UPDATE = 'conversation_update'
    TASK_UPDATE = 'task_update'
    ARTIFACT_UPDATE = 'artifact_update'
    ERROR = 'error'
```

#### 标准消息格式
```python
{
    "type": WebSocketMessageType.AGENT_RESPONSE,
    "message": {
        "content": "消息内容",
        "agent": "代理名称"
    },
    "agentName": "代理名称",
    "timestamp": "2023-01-01T12:00:00",
    "sessionId": "会话ID"
}
```

## 4. AI 代理系统设计

### 4.1 代理角色定义
- Team Leader (Mike)
- Product Manager (Emma)
- Architect (Bob)
- Engineer (Alex)
- Data Analyst (David)

### 4.2 协作流程
1. 需求接收和分析
2. 任务分配
3. 架构设计
4. 代码生成
5. 测试验证

### 4.3 通信协议
```typescript
interface AgentMessage {
  type: 'TASK' | 'RESPONSE' | 'UPDATE';
  from: string;
  to: string;
  content: any;
  timestamp: Date;
}
```

## 5. 安全设计

### 5.1 前端安全
- XSS 防护
- CSRF 防护
- 输入验证

### 5.2 后端安全
- 认证授权
- 数据加密
- 请求限流

## 6. 性能优化

### 6.1 前端优化
- 代码分割
- 懒加载
- 缓存策略
- 渲染优化

### 6.2 后端优化
- 数据库优化
- 缓存机制
- 并发处理

## 7. 部署架构

### 7.1 开发环境
- 本地开发服务器
- 热重载
- 调试工具

### 7.2 生产环境
- 容器化部署
- 负载均衡
- 监控系统

## 8. 扩展性设计

### 8.1 插件系统
- 代码生成器插件
- 主题插件
- 工具插件

### 8.2 API 扩展
- 版本控制
- 向后兼容
- 文档自动生成

## 9. 监控和日志

### 9.1 监控指标
- 性能指标
- 错误率
- 用户行为

### 9.2 日志系统
- 操作日志
- 错误日志
- 性能日志

## 10. 重构后的系统架构

### 10.1 前端架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        应用层 (App)                          │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                        组件层 (Components)                   │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │  ChatWindow │    │ FlowViewer  │    │  CodeView   │      │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘      │
│         │                  │                  │             │
│  ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐      │
│  │   Message   │    │    Node     │    │ CodeBlock   │      │
│  └──────┬──────┘    └─────────────┘    └─────────────┘      │
│         │                                                   │
│  ┌──────▼──────┐                                            │
│  │    Input    │                                            │
│  └─────────────┘                                            │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      自定义Hooks层                           │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │useWebSocket │    │useProcessor │    │useStorage   │      │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘      │
│         │                  │                  │             │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────────┐
│                        服务层 (Services)                     │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │SocketService│    │ ApiService  │    │UtilsService │      │
│  └─────────────┘    └─────────────┘    └─────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 10.2 后端架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        应用层 (App)                          │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                        API层 (Routes)                        │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐      │
│  │  /agent     │    │  /chat      │    │  /health    │      │
│  └──────┬──────┘    └──────┬──────┘    └─────────────┘      │
└─────────┼─────────────────┼────────────────────────────────┘
          │                 │
┌─────────▼─────────────────▼────────────────────────────────┐
│                      服务层 (Services)                      │
│                                                            │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │AgentService │    │ChatService  │    │CodeService  │     │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘     │
└─────────┼─────────────────┼─────────────────┼─────────────┘
          │                 │                 │
┌─────────▼─────────────────▼─────────────────▼─────────────┐
│                      模型层 (Models)                       │
│                                                           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │   Agent     │    │   Message   │    │   Session   │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    │
└───────────────────────────┬───────────────────────────────┘
                            │
┌───────────────────────────▼───────────────────────────────┐
│                      工具层 (Utils)                        │
│                                                           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │WebSocketHdlr│    │BaiduClient  │    │ErrorHandler │    │
│  └─────────────┘    └─────────────┘    └─────────────┘    │
└───────────────────────────────────────────────────────────┘
```

### 10.3 数据流图

```
┌──────────┐     WebSocket     ┌──────────┐
│          │◄─────消息────────►│          │
│  前端     │                  │  后端     │
│          │─────请求────────►│          │
│ (Next.js) │                  │ (Flask)  │
│          │◄────响应─────────│          │
└──────────┘                  └──────────┘
     ▲                             ▲
     │                             │
     │                             │
     ▼                             ▼
┌──────────┐                  ┌──────────┐
│          │                  │          │
│ 本地存储  │                  │  AI模型   │
│          │                  │          │
└──────────┘                  └──────────┘
``` 