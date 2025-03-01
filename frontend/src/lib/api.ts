const API_BASE_URL = 'http://localhost:5000/api';

export interface AnalyzeResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export class ApiService {
  private static async retryRequest(
    fn: () => Promise<Response>,
    retries = 3,
    delay = 1000
  ): Promise<Response> {
    try {
      return await fn();
    } catch (error) {
      if (retries === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.retryRequest(fn, retries - 1, delay * 1.5);
    }
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
              message,
              timestamp: new Date().toISOString()
            }),
            credentials: 'include'
          })
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || '请求处理失败');
      }

      return data;
    } catch (error) {
      console.error('Error analyzing request:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : '请求分析失败',
      };
    }
  }

  static async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const apiService = new ApiService(); 