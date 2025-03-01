'use client';

import React, { useState, useEffect } from 'react';
import { useChatContext } from './ChatContext';
import { TimeGroup } from './TimeGroup';
import { Input } from './Input';
import Message from './Message';
import { Loading } from '../ui/Loading';
import { ScrollButtons } from './ScrollButtons';
import { LoadMoreButton } from './LoadMoreButton';
import { useScrollControl } from '@/hooks/useScrollControl';
import { groupMessagesByDate } from '@/lib/messageUtils';

export const ChatWindow = React.memo(() => {
  const {
    currentSession,
    sendMessage,
    isLoadingMore,
    loadMoreMessages,
    hasMoreMessages,
    isConnected
  } = useChatContext();

  // 本地状态
  const [isLoading, setIsLoading] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // 使用滚动控制钩子
  const {
    containerRef,
    endRef,
    showScrollUp,
    showScrollDown,
    autoScroll,
    scrollPosition,
    scrollToTop,
    scrollToBottom
  } = useScrollControl();

  // 处理发送消息
  const handleSend = async (content: string) => {
    setIsLoading(true);
    setLoadingError(null);
    try {
      await sendMessage(content);
      // 发送后等待一小段时间再滚动，确保消息已渲染
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      setLoadingError(error instanceof Error ? error.message : '发送消息失败');
      console.error('发送消息失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理文件上传
  const handleUpload = async (files: File[]) => {
    console.log('上传文件:', files);
    setTimeout(scrollToBottom, 100);
  };

  // 加载更多消息
  const handleLoadMoreMessages = async () => {
    if (currentSession) {
      const success = await loadMoreMessages(currentSession.id);
      if (success) {
        // 加载更多后保持滚动位置
      }
    }
  };

  // 自动滚动到底部
  useEffect(() => {
    if (autoScroll && currentSession?.messages?.length) {
      scrollToBottom();
    }
  }, [currentSession?.messages, autoScroll, scrollToBottom]);

  if (!currentSession) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        <p>未选择对话</p>
      </div>
    );
  }

  // 使用工具函数对消息按日期分组
  const timeGroupedMessages = groupMessagesByDate(currentSession.messages);

  return (
    <div className="flex flex-col h-full relative">
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto pb-4 px-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        {/* 加载更多按钮 */}
        {hasMoreMessages && (
          <LoadMoreButton 
            onClick={handleLoadMoreMessages} 
            isLoading={isLoadingMore} 
          />
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

        <div ref={endRef} />
      </div>

      {/* 滚动控制按钮 */}
      <ScrollButtons 
        showScrollUp={showScrollUp}
        showScrollDown={showScrollDown}
        autoScroll={autoScroll}
        scrollPosition={scrollPosition}
        scrollToTop={scrollToTop}
        scrollToBottom={scrollToBottom}
        hasNewMessages={!autoScroll && currentSession.messages?.length > 0}
      />

      <div className="p-4 border-t border-gray-800">
        <Input 
          onSend={handleSend}
          onUpload={handleUpload}
          disabled={!isConnected}
          placeholder={isConnected ? "请输入您的需求..." : "连接已断开..."}
        />
      </div>
    </div>
  );
}); 