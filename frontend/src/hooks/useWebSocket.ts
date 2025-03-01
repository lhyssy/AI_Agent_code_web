import { useState, useEffect, useCallback } from 'react';
import { socketService, AgentResponse } from '@/lib/socket';

interface UseWebSocketOptions {
  onMessage?: (data: AgentResponse) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

/**
 * 自定义WebSocket连接管理Hook
 * 
 * 统一管理WebSocket连接和消息处理，提供连接状态和事件回调
 */
export function useWebSocket(options: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<AgentResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // 初始化WebSocket连接
  useEffect(() => {
    // 连接状态监听
    const unsubConnected = socketService.onConnected(() => {
      setIsConnected(true);
      setError(null);
      options.onConnect?.();
    });
    
    // 断开连接监听
    const unsubDisconnected = socketService.onDisconnected(() => {
      setIsConnected(false);
      options.onDisconnect?.();
    });
    
    // 消息监听
    const unsubMessage = socketService.onMessage((data) => {
      setLastMessage(data);
      options.onMessage?.(data);
    });
    
    // 错误监听
    const unsubError = socketService.onError((err) => {
      setError(err);
      options.onError?.(err);
    });
    
    // 确保WebSocket已连接
    if (!socketService.isConnected()) {
      socketService.connect();
    }
    
    // 清理函数
    return () => {
      unsubConnected();
      unsubDisconnected();
      unsubMessage();
      unsubError();
    };
  }, [options.onMessage, options.onError, options.onConnect, options.onDisconnect]);

  // 重新连接方法
  const reconnect = useCallback(() => {
    socketService.reconnect();
  }, []);

  // 检查健康状态
  const checkHealth = useCallback(async () => {
    try {
      const isHealthy = await fetch('http://localhost:5000/health', {
        signal: AbortSignal.timeout(5000),
      });
      return isHealthy.ok;
    } catch (error) {
      console.error('健康检查失败:', error);
      return false;
    }
  }, []);

  return {
    isConnected,
    lastMessage,
    error,
    reconnect,
    checkHealth
  };
} 