/**
 * API响应基础类型
 */
export interface ApiResponse {
  success: boolean;
  message?: string;
}

/**
 * 分析请求响应
 */
export interface AnalyzeResponse extends ApiResponse {
  result?: {
    message: string;
    analysis: string;
  };
}

/**
 * 代码生成响应
 */
export interface CodeGenerationResponse extends ApiResponse {
  code?: {
    files: Array<{
      path: string;
      content: string;
      language: string;
    }>;
    summary: string;
  };
}

/**
 * 会话响应
 */
export interface SessionResponse extends ApiResponse {
  session?: {
    id: string;
    title: string;
    messages: Array<{
      id: string;
      role: string;
      content: string;
      timestamp: string;
      agent?: string;
    }>;
  };
}

/**
 * 会话列表响应
 */
export interface SessionListResponse extends ApiResponse {
  sessions?: Array<{
    id: string;
    title: string;
    created_at: string;
    message_count: number;
    is_archived: boolean;
  }>;
}

/**
 * 代理状态响应
 */
export interface AgentStatusResponse extends ApiResponse {
  agents?: Array<{
    name: string;
    role: string;
    status: 'idle' | 'thinking' | 'responding';
    last_active: string;
  }>;
} 