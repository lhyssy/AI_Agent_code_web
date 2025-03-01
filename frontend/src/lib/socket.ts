import { Socket as ClientSocket } from 'socket.io-client';
import io from 'socket.io-client';

interface AgentResponse {
  agentName?: string;
  agent?: string;
  message: string | { content: string; type: string };
  type: string;
  timestamp: string;
}

class SocketService {
  private socket: ReturnType<typeof io> | null = null;
  private messageHandlers: ((data: AgentResponse) => void)[] = [];
  private errorHandlers: ((error: Error) => void)[] = [];
  private connectionStatus: boolean = false;

  constructor() {
    this.initSocket();
  }

  private initSocket() {
    if (this.socket?.connected) return;

    this.socket = io('http://localhost:5000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      autoConnect: true,
      forceNew: true
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('已连接到WebSocket服务器');
      this.connectionStatus = true;
      this.socket?.emit('client_ready');
    });

    this.socket.on('disconnect', () => {
      console.log('与WebSocket服务器断开连接');
      this.connectionStatus = false;
    });

    this.socket.on('reconnect_attempt', (attemptNumber: number) => {
      console.log(`正在尝试重新连接(第${attemptNumber}次)...`);
    });

    this.socket.on('reconnect', (attemptNumber: number) => {
      console.log(`重新连接成功(尝试次数: ${attemptNumber})`);
      this.connectionStatus = true;
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('连接错误:', error);
      this.errorHandlers.forEach(handler => handler(error));
    });

    this.socket.on('error', (error: Error) => {
      console.error('WebSocket错误:', error);
      this.errorHandlers.forEach(handler => handler(error));
    });

    this.socket.on('agent_response', (data: any) => {
      try {
        // 确保data存在
        if (!data) {
          console.error('收到无效的WebSocket消息: 数据为空');
          return;
        }
        
        console.log('收到WebSocket消息:', data);
        
        // 安全地获取代理名称
        let agentName = 'system';
        if (typeof data.agentName === 'string') {
          agentName = data.agentName.toLowerCase();
        } else if (typeof data.agent === 'string') {
          agentName = data.agent.toLowerCase();
        }
        
        // 安全地获取消息内容
        let messageContent = '无效的消息格式';
        if (typeof data.message === 'string') {
          messageContent = data.message;
        } else if (data.message && typeof data.message === 'object' && 'content' in data.message) {
          messageContent = data.message.content;
        }
        
        // 安全地获取时间戳
        const timestamp = data.timestamp || new Date().toISOString();
        
        const formattedData = {
          ...data,
          agentName,
          message: messageContent,
          timestamp
        };
        
        console.log('处理后的消息:', formattedData);
        
        this.saveMessageToLocalStorage(formattedData);
        
        this.messageHandlers.forEach(handler => {
          try {
            handler(formattedData);
          } catch (handlerError) {
            console.error('消息处理程序执行出错:', handlerError);
          }
        });
        
        console.log('消息处理完成');
      } catch (error) {
        console.error('处理消息时出错:', error);
        this.errorHandlers.forEach(handler => 
          handler(new Error('消息处理失败'))
        );
      }
    });
  }

  private saveMessageToLocalStorage(message: AgentResponse) {
    try {
      // 确保在浏览器环境中才访问localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedMessages = localStorage.getItem('socket_message_backup');
        const messages = storedMessages ? JSON.parse(storedMessages) : [];
        messages.push({
          ...message,
          backupTimestamp: new Date().toISOString()
        });
        
        const recentMessages = messages.slice(-50); 
        localStorage.setItem('socket_message_backup', JSON.stringify(recentMessages));
      }
    } catch (error) {
      console.error('保存消息到本地存储失败:', error);
    }
  }

  public isConnected(): boolean {
    return this.connectionStatus;
  }

  public reconnect() {
    this.disconnect();
    this.initSocket();
  }

  public onMessage(handler: (data: AgentResponse) => void) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  public onError(handler: (error: Error) => void) {
    this.errorHandlers.push(handler);
    return () => {
      this.errorHandlers = this.errorHandlers.filter(h => h !== handler);
    };
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionStatus = false;
    }
  }
}

export const socketService = new SocketService(); 