import { ReactNode } from 'react';

/**
 * 消息类型
 */
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agentName?: string;
  status: 'sending' | 'sent' | 'failed';
  replyTo?: string;
  edited?: boolean;
  deleted?: boolean;
  codeBlocks?: Array<{
    language: string;
    code: string;
  }>;
}

/**
 * 聊天会话类型
 */
export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
  unreadCount: number;
  archived: boolean;
}

/**
 * 代理类型
 */
export interface Agent {
  name: string;
  role: string;
  avatar: string;
  color: string;
  online: boolean;
}

/**
 * 聊天上下文类型
 */
export interface ChatContextType {
  currentSession: ChatSession | null;
  sessions: ChatSession[];
  agents: Agent[];
  theme: 'light' | 'dark';
  isConnected: boolean;
  isLoadingMore: boolean;
  createSession: () => void;
  switchSession: (sessionId: string) => void;
  archiveSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  sendMessage: (content: string, replyTo?: string) => Promise<void>;
  editMessage: (messageId: string, content: string) => void;
  deleteMessage: (messageId: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  loadMoreMessages: (sessionId: string) => Promise<void>;
}

/**
 * 组件Props类型
 */
export interface ChatProps {
  initialSession?: ChatSession;
  onSessionChange?: (session: ChatSession) => void;
  onThemeChange?: (theme: 'light' | 'dark') => void;
}

export interface MessageProps {
  message: Message;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  onReply?: (messageId: string) => void;
  onRetry?: (messageId: string) => void;
}

export interface InputProps {
  onSend: (content: string) => void;
  onUpload: (files: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
  mentions?: Agent[];
}

export interface CodeBlockProps {
  language: string;
  code: string;
  onCopy?: () => void;
}

export interface TimeGroupProps {
  date: Date;
  children: ReactNode;
}

export interface ScrollButtonProps {
  direction: 'up' | 'down';
  onClick: () => void;
  visible: boolean;
}

export interface LoadingProps {
  type?: 'dots' | 'spinner';
  size?: 'small' | 'medium' | 'large';
} 