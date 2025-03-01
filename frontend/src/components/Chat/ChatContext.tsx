'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ChatContextType, ChatSession, Message, Agent } from './types';
import { socketService } from '@/lib/socket';
import { ApiService } from '@/lib/api';

const defaultAgents: Agent[] = [
  {
    name: 'Mike',
    role: 'Team Leader',
    avatar: '👨‍💼',
    color: '#6366f1',
    online: true
  },
  {
    name: 'Emma',
    role: 'Product Manager',
    avatar: '👩‍💼',
    color: '#ec4899',
    online: true
  },
  {
    name: 'Bob',
    role: 'Architect',
    avatar: '👨‍🔧',
    color: '#2dd4bf',
    online: true
  },
  {
    name: 'Alex',
    role: 'Engineer',
    avatar: '👨‍💻',
    color: '#f59e0b',
    online: true
  },
  {
    name: 'David',
    role: 'Data Analyst',
    avatar: '👨‍🔬',
    color: '#8b5cf6',
    online: true
  }
];

const ChatContext = createContext<ChatContextType | null>(null);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [agents] = useState<Agent[]>(defaultAgents);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 检查API健康状态
    const checkApiHealth = async () => {
      const isHealthy = await ApiService.checkHealth();
      setIsConnected(isHealthy);
    };

    checkApiHealth();
    const interval = setInterval(checkApiHealth, 30000); // 每30秒检查一次

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // 从localStorage加载会话
    const savedSessions = localStorage.getItem('chat_sessions');
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed.map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
        messages: s.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
      })));
    }

    // 监听WebSocket消息
    const unsubscribe = socketService.onMessage((data) => {
      const messageContent = typeof data.message === 'string' ? 
        data.message : 
        (data.message.content || '无效的消息格式');

      const newMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: messageContent,
        timestamp: new Date(),
        agentName: data.agentName.toLowerCase(),
        status: 'sent'
      };

      setCurrentSession(prev => {
        if (!prev) return null;
        const updated = {
          ...prev,
          messages: [...prev.messages, newMessage],
          updatedAt: new Date()
        };
        updateSession(updated);
        return updated;
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // 保存会话到localStorage
  const updateSession = (session: ChatSession) => {
    setSessions(prev => {
      const updated = prev.map(s => s.id === session.id ? session : s);
      localStorage.setItem('chat_sessions', JSON.stringify(updated));
      return updated;
    });
  };

  const createSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: '新对话',
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
      unreadCount: 0,
      archived: false
    };
    setSessions(prev => [...prev, newSession]);
    setCurrentSession(newSession);
  };

  const switchSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      session.unreadCount = 0;
      setCurrentSession(session);
      updateSession(session);
    }
  };

  const archiveSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      session.archived = true;
      updateSession(session);
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
      }
    }
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
    }
    localStorage.setItem('chat_sessions', JSON.stringify(
      sessions.filter(s => s.id !== sessionId)
    ));
  };

  const sendMessage = async (content: string, replyTo?: string) => {
    if (!currentSession || !isConnected) {
      throw new Error(isConnected ? '请先创建或选择一个会话' : 'API服务未连接');
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      status: 'sending',
      replyTo
    };

    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, newMessage],
      updatedAt: new Date()
    };
    setCurrentSession(updatedSession);
    updateSession(updatedSession);

    try {
      const response = await ApiService.analyzeRequest(content);
      if (!response.success) {
        throw new Error(response.message || '请求分析失败');
      }
      
      // 更新消息状态为已发送
      const sentMessage = { ...newMessage, status: 'sent' as const };
      const finalSession = {
        ...updatedSession,
        messages: updatedSession.messages.map(m => 
          m.id === newMessage.id ? sentMessage : m
        )
      };
      setCurrentSession(finalSession);
      updateSession(finalSession);
    } catch (error) {
      // 更新消息状态为发送失败
      const failedMessage = { ...newMessage, status: 'failed' as const };
      const finalSession = {
        ...updatedSession,
        messages: updatedSession.messages.map(m => 
          m.id === newMessage.id ? failedMessage : m
        )
      };
      setCurrentSession(finalSession);
      updateSession(finalSession);
      throw error;
    }
  };

  const editMessage = (messageId: string, content: string) => {
    if (!currentSession) return;

    const updatedSession = {
      ...currentSession,
      messages: currentSession.messages.map(m => 
        m.id === messageId ? { ...m, content, edited: true } : m
      ),
      updatedAt: new Date()
    };
    setCurrentSession(updatedSession);
    updateSession(updatedSession);
  };

  const deleteMessage = (messageId: string) => {
    if (!currentSession) return;

    const updatedSession = {
      ...currentSession,
      messages: currentSession.messages.map(m => 
        m.id === messageId ? { ...m, deleted: true } : m
      ),
      updatedAt: new Date()
    };
    setCurrentSession(updatedSession);
    updateSession(updatedSession);
  };

  return (
    <ChatContext.Provider value={{
      currentSession,
      sessions,
      agents,
      theme,
      isConnected,
      createSession,
      switchSession,
      archiveSession,
      deleteSession,
      sendMessage,
      editMessage,
      deleteMessage,
      setTheme
    }}>
      {children}
    </ChatContext.Provider>
  );
}; 