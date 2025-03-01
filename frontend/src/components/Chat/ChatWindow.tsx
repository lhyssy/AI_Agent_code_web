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

    return Object.entries(groups).map(([date, messages]) => ({
      date: new Date(date),
      messages
    }));
  };

  const messageGroups = groupMessagesByDate(currentSession.messages);

  return (
    <div className="flex h-full">
      <SessionList />
      
      <div className="flex-1 flex flex-col bg-gray-900">
        {/* Connection status */}
        {!isConnected && (
          <div className="bg-red-500 text-white px-4 py-2 text-sm">
            API服务未连接，请检查网络连接或稍后重试
          </div>
        )}

        {/* Error message */}
        {error && (
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
            <TimeGroup key={group.date.toISOString()} date={group.date}>
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