'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ChatContextType, ChatSession, Message, Agent } from './types';
import { socketService } from '@/lib/socket';
import { ApiService } from '@/lib/api';

// 生成唯一ID的辅助函数
const generateUniqueId = () => {
  return `${Date.now().toString()}-${Math.random().toString(36).substring(2, 9)}`;
};

// 最大允许的消息数量，超过此数量将分页显示
const MAX_MESSAGES_PER_SESSION = 100;

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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);

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

  // 从localStorage加载会话
  const loadSessionsFromStorage = useCallback(() => {
    try {
      const savedSessions = localStorage.getItem('chat_sessions');
      if (savedSessions) {
        const parsed = JSON.parse(savedSessions);
        const formattedSessions = parsed.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          updatedAt: new Date(s.updatedAt),
          messages: s.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        }));
        
        setSessions(formattedSessions);
        return formattedSessions;
      }
    } catch (error) {
      console.error('加载会话数据失败:', error);
    }
    return [];
  }, []);

  useEffect(() => {
    const formattedSessions = loadSessionsFromStorage();
    
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
        
        // 限制消息数量，保留最新的MAX_MESSAGES_PER_SESSION条
        const updatedMessages = [...prev.messages, newMessage];
        const messagesToKeep = updatedMessages.length > MAX_MESSAGES_PER_SESSION
          ? updatedMessages.slice(-MAX_MESSAGES_PER_SESSION)
          : updatedMessages;
        
        // 创建会话的深拷贝，避免状态问题
        const updated = {
          ...prev,
          messages: messagesToKeep,
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
  }, [sessions, loadSessionsFromStorage]);

  // 保存会话到localStorage
  const updateSession = (session: ChatSession) => {
    // 限制消息数量，保留最新的MAX_MESSAGES_PER_SESSION条
    const messagesToKeep = session.messages.length > MAX_MESSAGES_PER_SESSION
      ? session.messages.slice(-MAX_MESSAGES_PER_SESSION)
      : session.messages;
    
    const updatedSession = {
      ...session,
      messages: messagesToKeep
    };
    
    setSessions(prev => {
      const updated = prev.map(s => s.id === updatedSession.id ? updatedSession : s);
      try {
        localStorage.setItem('chat_sessions', JSON.stringify(updated));
      } catch (error) {
        console.error('保存会话到localStorage失败:', error);
      }
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

  // 发送消息
  const sendMessage = async (content: string, replyTo?: string) => {
    if (!content.trim() || !currentSession) return;
    if (!isConnected) {
      console.error('API服务未连接');
      return;
    }

    // 创建一个临时的用户消息
    const messageId = generateUniqueId();
    const userMessage: Message = {
      id: messageId,
      role: 'user',
      content,
      timestamp: new Date(),
      status: 'sending',
      replyTo
    };

    // 添加消息到当前会话
    setCurrentSession(prev => {
      if (!prev) return null;
      
      // 添加发送动画效果
      const updatedMessages = [...prev.messages, userMessage];
      const updatedSession = { 
        ...prev, 
        messages: updatedMessages,
        updatedAt: new Date()
      };
      
      // 保存消息到sessionStorage作为备份
      try {
        const backupKey = `message_backup_${messageId}`;
        sessionStorage.setItem(backupKey, JSON.stringify(userMessage));
        console.log(`已备份消息到SessionStorage: ${backupKey}`);
      } catch (e) {
        console.error('备份消息失败:', e);
      }
      
      return updatedSession;
    });

    try {
      // 发送消息到API
      await ApiService.analyzeRequest(content);
      
      // 更新消息状态为已发送
      setCurrentSession(prev => {
        if (!prev) return null;
        
        const updatedMessages = prev.messages.map(m => 
          m.id === messageId ? { ...m, status: 'sent' as const } : m
        );
        
        const updatedSession = { 
          ...prev, 
          messages: updatedMessages 
        };
        
        updateSession(updatedSession);
        return updatedSession;
      });
    } catch (error) {
      console.error('发送消息失败:', error);
      
      // 更新消息状态为失败
      setCurrentSession(prev => {
        if (!prev) return null;
        
        const updatedMessages = prev.messages.map(m => 
          m.id === messageId ? { ...m, status: 'failed' as const } : m
        );
        
        const updatedSession = { 
          ...prev, 
          messages: updatedMessages 
        };
        
        updateSession(updatedSession);
        return updatedSession;
      });
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

  // 检查是否有更多消息
  const checkHasMoreMessages = useCallback((session: ChatSession | null) => {
    if (!session) {
      setHasMoreMessages(false);
      return;
    }
    
    // 这里可以根据你的实际逻辑来判断是否有更多消息
    // 例如，如果消息数量达到了限制，就认为有更多消息
    const hasMore = session.messages.length >= MAX_MESSAGES_PER_SESSION;
    setHasMoreMessages(hasMore);
  }, []);

  // 当当前会话变化时，检查是否有更多消息
  useEffect(() => {
    checkHasMoreMessages(currentSession);
  }, [currentSession, checkHasMoreMessages]);

  // 更新loadMoreMessages函数
  const loadMoreMessages = async (sessionId: string): Promise<boolean> => {
    if (!isLoadingMore) {
      try {
        setIsLoadingMore(true);
        
        // 这里是你原有的加载更多消息的逻辑
        // 实现你的加载逻辑...
        
        // 模拟请求延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 返回是否成功加载了更多消息
        setIsLoadingMore(false);
        return true;
      } catch (error) {
        console.error('加载更多消息失败:', error);
        setIsLoadingMore(false);
        return false;
      }
    }
    return false;
  };

  return (
    <ChatContext.Provider value={{
      currentSession,
      sessions,
      agents,
      theme,
      isConnected,
      isLoadingMore,
      hasMoreMessages,
      createSession,
      switchSession,
      archiveSession,
      deleteSession,
      sendMessage,
      editMessage,
      deleteMessage,
      setTheme,
      loadMoreMessages
    }}>
      {children}
    </ChatContext.Provider>
  );
}; 