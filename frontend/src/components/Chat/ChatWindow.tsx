'use client';

import React, { useRef, useEffect, useState } from 'react';
import { CaretUp, CaretDown } from 'phosphor-react';
import { Message } from './Message';
import { Input } from './Input';
import { SessionList } from './SessionList';
import { useChatContext } from './ChatContext';
import { LoadingProps } from './types';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const Loading: React.FC<LoadingProps> = ({ type = 'dots', size = 'medium' }) => {
  const sizes = {
    small: 'w-1.5 h-1.5',
    medium: 'w-2 h-2',
    large: 'w-3 h-3'
  };

  if (type === 'dots') {
    return (
      <div className="flex justify-start">
        <div className="bg-gray-700 rounded-lg p-3 flex items-center space-x-2">
          <div className={`${sizes[size]} bg-gray-400 rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
          <div className={`${sizes[size]} bg-gray-400 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
          <div className={`${sizes[size]} bg-gray-400 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="bg-gray-700 rounded-lg p-3">
        <div className={`${sizes[size]} border-2 border-gray-400 border-t-transparent rounded-full animate-spin`} />
      </div>
    </div>
  );
};

const TimeGroup: React.FC<{ date: Date; children: React.ReactNode }> = ({ date, children }) => (
  <div className="relative py-4">
    <div className="absolute inset-0 flex items-center">
      <div className="border-t border-gray-700 w-full" />
    </div>
    <div className="relative flex justify-center">
      <span className="px-2 text-xs text-gray-500 bg-gray-900">
        {format(date, 'yyyy年MM月dd日', { locale: zhCN })}
      </span>
    </div>
    {children}
  </div>
);

export default function ChatWindow() {
  const {
    currentSession,
    agents,
    sendMessage,
    editMessage,
    deleteMessage,
    isConnected
  } = useChatContext();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      setShowScrollUp(scrollTop > 100);
      setShowScrollDown(scrollHeight - scrollTop - clientHeight > 100);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    messagesContainerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleSend = async (content: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await sendMessage(content);
    } catch (error) {
      setError(error instanceof Error ? error.message : '发送消息失败');
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (files: File[]) => {
    // TODO: 实现文件上传功能
    console.log('Uploading files:', files);
  };

  if (!currentSession) {
    return (
      <div className="flex h-full">
        <SessionList />
        <div className="flex-1 flex items-center justify-center bg-gray-900 text-gray-400">
          选择或创建一个会话开始聊天
        </div>
      </div>
    );
  }

  const groupMessagesByDate = (messages: typeof currentSession.messages) => {
    const groups: { [key: string]: typeof messages } = {};
    
    messages.forEach(message => {
      const date = format(message.timestamp, 'yyyy-MM-dd');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return Object.entries(groups).map(([date, messages]) => {
      // 使用日期和消息组的第一个和最后一个消息ID来生成唯一ID
      const firstId = messages[0].id;
      const lastId = messages[messages.length - 1].id;
      const groupId = `${date}-${firstId}-${lastId}`;
      return {
        id: groupId,
        date: new Date(date),
        messages
      };
    });
  };

  const messageGroups = groupMessagesByDate(currentSession.messages);

  return (
    <div className="flex h-full">
      <SessionList />
      
      <div className="flex-1 flex flex-col bg-gray-900">
        {/* Connection status */}
        {!isConnected && (
          <div className="bg-red-500/20 border border-red-500/50 text-white px-4 py-3 text-sm flex items-center justify-between rounded-md m-2">
            <div className="flex flex-col">
              <div className="flex items-center mb-1">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                <span className="font-medium">后端服务未连接</span>
              </div>
              <div className="ml-7 text-xs text-gray-300">
                请按以下步骤启动后端服务:
                <pre className="mt-1 bg-gray-800/50 p-1 rounded text-gray-400 overflow-x-auto">
                  1. cd backend<br/>
                  2. cd src<br/>
                  3. python app.py
                </pre>
                <div className="mt-1 text-gray-400">
                  如果仍然无法连接，请检查:
                  <ul className="list-disc ml-4 mt-1">
                    <li>端口5000是否被占用</li>
                    <li>防火墙设置是否允许连接</li>
                    <li>Python环境是否正确配置</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button 
                onClick={() => window.location.reload()}
                className="bg-red-500/30 hover:bg-red-500/50 px-3 py-1 rounded-md transition-colors text-xs whitespace-nowrap"
              >
                重试连接
              </button>
              <a 
                href="http://localhost:5000/health"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-700/50 hover:bg-gray-700 px-3 py-1 rounded-md transition-colors text-xs whitespace-nowrap text-center"
              >
                检查后端状态
              </a>
            </div>
          </div>
        )}

        {/* Failed to fetch error message */}
        {error && error.includes('fetch') && (
          <div className="bg-amber-500/20 border border-amber-500/50 text-white px-4 py-3 text-sm flex items-center justify-between rounded-md mx-2 mb-1">
            <div className="flex flex-col">
              <div className="flex items-center mb-1">
                <svg className="w-5 h-5 text-amber-400 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="font-medium">网络请求失败</span>
              </div>
              <div className="ml-7 text-xs text-gray-300">
                可能的原因:
                <ul className="list-disc ml-4 mt-1">
                  <li>后端服务未启动或已停止</li>
                  <li>网络连接不稳定</li>
                  <li>服务器响应超时</li>
                </ul>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSend(currentSession?.messages[currentSession.messages.length - 1]?.content || '')}
                className="bg-amber-500/30 hover:bg-amber-500/50 px-3 py-1 rounded-md transition-colors text-xs"
              >
                重试请求
              </button>
              <button 
                onClick={() => setError(null)}
                className="text-amber-400 hover:text-amber-300 p-1"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Other error messages */}
        {error && !error.includes('fetch') && (
          <div className="bg-red-500 text-white px-4 py-2 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        )}

        {/* Messages list */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4"
        >
          {messageGroups.map(group => (
            <TimeGroup key={group.id} date={group.date}>
              {group.messages.map(message => (
                <Message
                  key={message.id}
                  message={message}
                  onEdit={editMessage}
                  onDelete={deleteMessage}
                  onReply={(id) => handleSend(`回复 @${message.agentName}: ${message.content}`)}
                  onRetry={() => handleSend(message.content)}
                />
              ))}
            </TimeGroup>
          ))}
          
          {isLoading && <Loading />}
          <div ref={messagesEndRef} />
        </div>

        {/* Scroll buttons */}
        {showScrollUp && (
          <button
            onClick={scrollToTop}
            className="absolute right-8 top-4 p-2 bg-gray-800 rounded-full text-gray-400 hover:text-gray-200 transition-colors"
          >
            <CaretUp size={20} />
          </button>
        )}
        {showScrollDown && (
          <button
            onClick={scrollToBottom}
            className="absolute right-8 bottom-24 p-2 bg-gray-800 rounded-full text-gray-400 hover:text-gray-200 transition-colors"
          >
            <CaretDown size={20} />
          </button>
        )}

        {/* Input form */}
        <Input
          onSend={handleSend}
          onUpload={handleUpload}
          disabled={isLoading || !isConnected}
          mentions={agents}
        />
      </div>
    </div>
  );
} 