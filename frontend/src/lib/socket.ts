import { Socket as ClientSocket, io } from 'socket.io-client';

interface AgentResponse {
  agentName: string;
  message: string | { content: string; type: string };
  type: string;
  timestamp: string;
}

class SocketService {
  private socket: ClientSocket | null = null;
  private messageHandlers: ((data: AgentResponse) => void)[] = [];
  private errorHandlers: ((error: Error) => void)[] = [];

  constructor() {
    this.socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    this.socket.on('agent_response', (data: AgentResponse) => {
      // 确保agent名称格式正确
      const formattedData = {
        ...data,
        agentName: data.agentName.toLowerCase(),
        message: typeof data.message === 'string' ? data.message : 
                typeof data.message === 'object' && 'content' in data.message ? 
                data.message.content : '无效的消息格式'
      };
      
      this.messageHandlers.forEach(handler => handler(formattedData));
    });

    this.socket.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
      this.errorHandlers.forEach(handler => handler(error));
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Connection error:', error);
      this.errorHandlers.forEach(handler => handler(error));
    });
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
    }
  }
}

export const socketService = new SocketService(); 