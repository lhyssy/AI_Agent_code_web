'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ChatContextType, ChatSession, Message, Agent } from './types';
import { socketService } from '@/lib/socket';
import { ApiService } from '@/lib/api';

// 生成唯一ID的辅助函数
const generateUniqueId = () => {
  return `${Date.now().toString()}-${Math.random().toString(36).substring(2, 9)}`;
};

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
      console.log('收到新的WebSocket消息:', data);
      
      // 确保消息格式正确
      const messageContent = typeof data.message === 'string' ? 
        data.message : 
        (data.message && data.message.content ? data.message.content : '无效的消息格式');

      // 为每条消息生成唯一ID
      const messageId = generateUniqueId();
      console.log(`为消息创建ID: ${messageId}`);
      
      // 获取代理名称，确保它存在
      const agentName = data.agentName ? data.agentName.toLowerCase() : 
                       (data.agent ? data.agent.toLowerCase() : 'system');
      
      // 创建新消息对象
      const newMessage: Message = {
        id: messageId,
        role: 'assistant',
        content: messageContent,
        timestamp: new Date(),
        agentName: agentName,
        status: 'sent'
      };
      
      // 在SessionStorage中备份该消息，防止状态丢失
      try {
        const backupKey = `message_backup_${messageId}`;
        sessionStorage.setItem(backupKey, JSON.stringify(newMessage));
        console.log(`已备份消息到SessionStorage: ${backupKey}`);
      } catch (e) {
        console.error('备份消息失败:', e);
      }

      setCurrentSession(prev => {
        if (!prev) {
          console.log('没有当前会话，创建新会话');
          // 如果没有当前会话，创建一个新会话
          const newSession: ChatSession = {
            id: Date.now().toString(),
            title: '新对话',
            createdAt: new Date(),
            updatedAt: new Date(),
            messages: [newMessage],
            unreadCount: 1,
            archived: false
          };
          
          // 保存新会话到localStorage以确保持久化
          try {
            const updatedSessions = [...sessions, newSession];
            localStorage.setItem('chat_sessions', JSON.stringify(updatedSessions));
            console.log('已创建并保存新会话');
            
            // 更新会话列表
            setSessions(updatedSessions);
          } catch (e) {
            console.error('保存新会话失败:', e);
          }
          
          return newSession;
        }
        
        console.log(`更新现有会话 ID: ${prev.id}, 添加消息 ID: ${messageId}`);
        
        // 创建会话的深拷贝，避免状态问题
        const updated = {
          ...prev,
          messages: [...prev.messages, newMessage],
          updatedAt: new Date()
        };
        
        // 立即保存更新后的会话，确保消息持久化
        try {
          const updatedSessions = sessions.map(s => 
            s.id === updated.id ? updated : s
          );
          localStorage.setItem('chat_sessions', JSON.stringify(updatedSessions));
          console.log('已更新并保存现有会话');
          
          // 在下一个事件循环更新会话列表，避免状态冲突
          setTimeout(() => {
            setSessions(updatedSessions);
          }, 0);
        } catch (e) {
          console.error('保存更新会话失败:', e);
        }
        
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
      id: generateUniqueId(),
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