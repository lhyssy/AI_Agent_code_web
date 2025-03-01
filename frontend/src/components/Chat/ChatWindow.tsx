'use client';

import React, { useRef, useEffect, useState, useCallback, memo } from 'react';
import { CaretUp, CaretDown } from 'phosphor-react';
import Message from './Message';
import { Input } from './Input';
import { useChatContext } from './ChatContext';
import { format, isSameDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { formatMessage } from '@/lib/utils';
import { TimeGroup } from './TimeGroup';
import { Message as MessageType } from './types';

interface LoadingProps {
  type?: 'dots' | 'spinner';
  size?: 'small' | 'medium' | 'large';
}

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

export const ChatWindow = memo(() => {
  const {
    currentSession,
    sendMessage,
    uploadFile,
    isLoading,
    loadingError,
    isLoadingMore,
    loadMoreMessages,
    hasMoreMessages,
    isConnected
  } = useChatContext();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // 滚动状态
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // 滚动到顶部
  const scrollToTop = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, []);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setAutoScroll(true);
    }
  }, []);

  // 监听滚动事件，控制滚动按钮显示
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const atTop = scrollTop < 50;
    const atBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    // 更新滚动位置百分比
    const newScrollPosition = scrollHeight <= clientHeight 
      ? 100 
      : (scrollTop / (scrollHeight - clientHeight)) * 100;
    setScrollPosition(Math.min(newScrollPosition, 100));
    
    setShowScrollUp(!atTop);
    setShowScrollDown(!atBottom);
    
    // 如果接近底部，启用自动滚动
    if (atBottom) {
      setAutoScroll(true);
    } else {
      setAutoScroll(false);
    }
  }, []);

  // 初始化和消息更新时处理滚动
  useEffect(() => {
    if (!messagesContainerRef.current) return;
    
    // 添加滚动事件监听
    const container = messagesContainerRef.current;
    container.addEventListener('scroll', handleScroll);
    
    // 初始检查
    handleScroll();
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // 自动滚动到底部
  useEffect(() => {
    if (autoScroll && messagesEndRef.current && currentSession?.messages?.length) {
      scrollToBottom();
    }
  }, [currentSession?.messages, autoScroll, scrollToBottom]);

  // 处理发送消息
  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
    // 发送后等待一小段时间再滚动，确保消息已渲染
    setTimeout(() => {
      scrollToBottom();
      setAutoScroll(true);
    }, 100);
  };

  // 处理文件上传
  const handleFileUpload = async (file: File) => {
    await uploadFile(file);
    setTimeout(scrollToBottom, 100);
  };

  // 加载更多消息
  const handleLoadMoreMessages = async () => {
    if (currentSession) {
      const success = await loadMoreMessages(currentSession.id);
      if (success) {
        // 加载更多后保持滚动位置
        setAutoScroll(false);
      }
    }
  };

  if (!currentSession) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        <p>未选择对话</p>
      </div>
    );
  }

  const timeGroupedMessages: { date: Date; messages: MessageType[] }[] = [];
  
  if (currentSession.messages && currentSession.messages.length > 0) {
    currentSession.messages.forEach((message) => {
      const messageDate = new Date(message.timestamp);
      const lastGroup = timeGroupedMessages[timeGroupedMessages.length - 1];

      if (lastGroup && isSameDay(lastGroup.date, messageDate)) {
        lastGroup.messages.push(message);
      } else {
        timeGroupedMessages.push({
          date: messageDate,
          messages: [message],
        });
      }
    });
  }

  return (
    <div className="flex flex-col h-full relative">
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto pb-4 px-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        {/* 加载更多按钮 */}
        {hasMoreMessages && (
          <div className="sticky top-0 py-2 z-10 flex justify-center">
            <button
              onClick={handleLoadMoreMessages}
              disabled={isLoadingMore}
              className="bg-gray-800 hover:bg-gray-700 text-blue-400 rounded-full px-4 py-1 text-sm flex items-center space-x-1 disabled:opacity-50 transition-all duration-200"
            >
              {isLoadingMore ? (
                <>
                  <div className="animate-spin h-3 w-3 mr-2 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  <span>加载中...</span>
                </>
              ) : (
                <>
                  <CaretUp size={14} />
                  <span>加载更多</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* 消息时间分组 */}
        {timeGroupedMessages.map((group, groupIndex) => (
          <TimeGroup key={`group-${groupIndex}`} date={group.date}>
            {group.messages.map((message) => (
              <Message
                key={message.id}
                message={message}
              />
            ))}
          </TimeGroup>
        ))}

        {isLoading && (
          <div className="p-4 bg-gray-800 rounded-lg my-2 animate-pulse">
            <Loading type="dots" />
          </div>
        )}

        {loadingError && (
          <div className="p-4 bg-red-900 bg-opacity-20 text-red-400 rounded-lg my-2">
            {loadingError}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 滚动控制按钮 - 上滚动 */}
      {showScrollUp && (
        <div 
          className={`absolute top-4 right-4 bg-gray-800 hover:bg-gray-700 p-2 rounded-full shadow-lg z-10 cursor-pointer transition-all duration-200 ${showScrollUp ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
          onClick={scrollToTop}
        >
          <CaretUp size={18} className="text-blue-400" />
        </div>
      )}
      
      {/* 滚动控制按钮 - 下滚动 */}
      {showScrollDown && (
        <div 
          className={`absolute bottom-20 right-4 bg-gray-800 hover:bg-gray-700 p-2 rounded-full shadow-lg z-10 cursor-pointer transition-all duration-200 ${showScrollDown ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
          onClick={scrollToBottom}
        >
          <CaretDown size={18} className="text-blue-400" />
        </div>
      )}
      
      {/* 自动滚动指示器 */}
      {!autoScroll && currentSession.messages?.length > 0 && (
        <div 
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-blue-900 bg-opacity-70 text-blue-200 text-xs px-3 py-1 rounded-full cursor-pointer shadow-lg transition-all duration-200 hover:bg-blue-800"
          onClick={scrollToBottom}
        >
          <div className="flex items-center space-x-1">
            <span>新消息</span>
            <CaretDown size={12} />
          </div>
        </div>
      )}
      
      {/* 滚动位置指示器 */}
      <div className="absolute right-1.5 top-0 bottom-16 w-1 pointer-events-none">
        <div 
          className="absolute bg-blue-500 w-1 opacity-30 rounded transition-all duration-200"
          style={{
            top: '0%',
            height: `${scrollPosition}%`
          }}
        ></div>
      </div>

      <div className="p-4 border-t border-gray-800">
        <Input onSendMessage={handleSendMessage} onFileUpload={handleFileUpload} />
      </div>
    </div>
  );
}); 