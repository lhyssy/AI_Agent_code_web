/**
 * WebSocket消息类型
 */
export enum WebSocketMessageType {
  USER_MESSAGE = 'user_message',
  AGENT_RESPONSE = 'agent_response',
  CONNECTION_UPDATE = 'connection_update',
  AGENT_STATUS = 'agent_status',
  CONVERSATION_UPDATE = 'conversation_update',
  TASK_UPDATE = 'task_update',
  ARTIFACT_UPDATE = 'artifact_update',
  ERROR = 'error'
}

/**
 * WebSocket消息基础接口
 */
export interface WebSocketMessage {
  type: WebSocketMessageType;
  timestamp: string;
}

/**
 * 代理响应消息
 */
export interface AgentResponse extends WebSocketMessage {
  type: WebSocketMessageType.AGENT_RESPONSE;
  message: {
    content: string;
    agent: string;
  };
  agentName?: string;
  sessionId?: string;
}

/**
 * 用户消息
 */
export interface UserMessage extends WebSocketMessage {
  type: WebSocketMessageType.USER_MESSAGE;
  message: {
    content: string;
    id: string;
  };
  sessionId?: string;
}

/**
 * 连接更新消息
 */
export interface ConnectionUpdate extends WebSocketMessage {
  type: WebSocketMessageType.CONNECTION_UPDATE;
  status: 'connected' | 'disconnected';
}

/**
 * 代理状态消息
 */
export interface AgentStatus extends WebSocketMessage {
  type: WebSocketMessageType.AGENT_STATUS;
  agents: Array<{
    name: string;
    role: string;
    status: 'idle' | 'thinking' | 'responding';
  }>;
}

/**
 * 会话更新消息
 */
export interface ConversationUpdate extends WebSocketMessage {
  type: WebSocketMessageType.CONVERSATION_UPDATE;
  session: {
    id: string;
    title: string;
    updatedAt: string;
  };
}

/**
 * 任务更新消息
 */
export interface TaskUpdate extends WebSocketMessage {
  type: WebSocketMessageType.TASK_UPDATE;
  task: {
    id: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    progress: number;
    description: string;
  };
}

/**
 * 构件更新消息
 */
export interface ArtifactUpdate extends WebSocketMessage {
  type: WebSocketMessageType.ARTIFACT_UPDATE;
  artifact: {
    id: string;
    type: 'code' | 'document' | 'image';
    name: string;
    url: string;
  };
}

/**
 * 错误消息
 */
export interface ErrorMessage extends WebSocketMessage {
  type: WebSocketMessageType.ERROR;
  error: {
    code: string;
    message: string;
  };
}

/**
 * 任意WebSocket消息联合类型
 */
export type AnyWebSocketMessage =
  | AgentResponse
  | UserMessage
  | ConnectionUpdate
  | AgentStatus
  | ConversationUpdate
  | TaskUpdate
  | ArtifactUpdate
  | ErrorMessage; 