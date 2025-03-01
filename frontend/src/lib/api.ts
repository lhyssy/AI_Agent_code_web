const API_BASE_URL = 'http://localhost:5000/api';

export interface AnalyzeResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export class ApiService {
  private static async retryRequest<T>(
    requestFn: () => Promise<Response>,
    maxRetries = 3,
    delay = 1000
  ): Promise<Response> {
    let lastError: Error | null = null;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;
        console.error(`请求失败，尝试重试 (${retries + 1}/${maxRetries})`, error);
        retries++;
        if (retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * retries));
        }
      }
    }

    throw lastError || new Error('请求失败，达到最大重试次数');
  }

  static async analyzeRequest(message: string): Promise<AnalyzeResponse> {
    try {
      const response = await this.retryRequest(
        () =>
          fetch(`${API_BASE_URL}/agent/analyze`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              input: message,
              timestamp: new Date().toISOString()
            }),
            credentials: 'include',
            mode: 'cors'
          }),
        3,
        1000
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || this.getStatusErrorMessage(response.status);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '请求处理失败，请稍后重试');
      }

      return data;
    } catch (error) {
      console.error('分析请求失败:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          success: false,
          message: '无法连接到后端服务，请确保服务已启动并且网络正常',
        };
      }
      
      return {
        success: false,
        message: error instanceof Error ? error.message : '请求失败，请重试',
      };
    }
  }

  static async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch('http://localhost:5000/health', {
        signal: AbortSignal.timeout(5000),
        credentials: 'include',
        mode: 'cors'
      });
      console.log('后端服务状态检查:', response.status);
      return response.ok;
    } catch (error) {
      console.error('后端服务状态检查失败:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('无法连接到后端服务，请确保服务已启动');
      } else if (error instanceof DOMException && error.name === 'AbortError') {
        console.error('状态检查超时，后端服务响应时间过长');
      }
      return false;
    }
  }

  private static getStatusErrorMessage(status: number): string {
    const statusMessages: { [key: number]: string } = {
      400: '请求参数错误，请检查输入',
      401: '未经授权的访问',
      403: '访问被禁止',
      404: '请求的资源不存在',
      408: '请求超时，请重试',
      429: '请求过于频繁，请稍后再试',
      500: '服务器内部错误',
      502: '网关错误',
      503: '服务暂时不可用',
      504: '网关超时'
    };
    return statusMessages[status] || `请求失败，状态码: ${status}`;
  }
}

export const apiService = new ApiService(); 