import { useState, useCallback } from 'react';
import { Message } from '@/components/Chat/types';
import { formatCode } from '@/lib/utils';

/**
 * 消息处理器Hook - 处理消息格式化和代码块提取
 */
export function useMessageProcessor() {
  const [processedMessages, setProcessedMessages] = useState<Map<string, Message>>(new Map());

  /**
   * 从消息内容中提取代码块
   */
  const extractCodeBlocks = useCallback((content: string) => {
    if (!content) return [];
    
    const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const codeBlocks = [];
    let match;
    
    while ((match = codeRegex.exec(content)) !== null) {
      codeBlocks.push({
        language: match[1] || 'text',
        code: match[2].trim()
      });
    }
    
    return codeBlocks;
  }, []);

  /**
   * 处理消息，提取代码块并格式化内容
   */
  const processMessage = useCallback((message: Message): Message => {
    // 如果消息已经处理过，直接返回缓存
    if (processedMessages.has(message.id)) {
      return processedMessages.get(message.id)!;
    }
    
    // 提取代码块
    const codeBlocks = !message.codeBlocks ? extractCodeBlocks(message.content) : message.codeBlocks;
    
    // 创建处理后的消息对象
    const processedMessage: Message = {
      ...message,
      codeBlocks: codeBlocks.length > 0 ? codeBlocks : message.codeBlocks
    };
    
    // 缓存处理结果
    setProcessedMessages(prev => {
      const updated = new Map(prev);
      updated.set(message.id, processedMessage);
      return updated;
    });
    
    return processedMessage;
  }, [extractCodeBlocks, processedMessages]);

  /**
   * 格式化消息内容，处理代码块和特殊字符
   */
  const formatContent = useCallback((message: Message, copiedBlocks: {[key: string]: boolean} = {}) => {
    if (!message.content) return '';
    
    // 确保消息已经处理过
    const processedMsg = processMessage(message);
    
    // 保留空格和换行
    let formatted = message.content
      .replace(/\n/g, '<br/>')
      .replace(/\s\s/g, '&nbsp;&nbsp;');
    
    // 替换代码块
    if (processedMsg.codeBlocks && processedMsg.codeBlocks.length > 0) {
      const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
      let index = 0;
      
      formatted = formatted.replace(codeRegex, () => {
        if (!processedMsg.codeBlocks || index >= processedMsg.codeBlocks.length) {
          return '';
        }
        
        const codeBlock = processedMsg.codeBlocks[index];
        const language = codeBlock.language || 'text';
        const code = codeBlock.code;
        const isCopied = copiedBlocks[index] || false;
        
        const result = `
          <div class="my-4 rounded-md overflow-hidden bg-gray-900">
            <div class="flex items-center justify-between bg-gray-800 px-4 py-2">
              <span class="text-xs font-mono text-gray-400">${language}</span>
              <button 
                class="text-xs ${isCopied ? 'text-green-400' : 'text-gray-400 hover:text-white'}"
                data-code-index="${index}"
                onclick="copyCode(${index})"
              >
                ${isCopied ? '已复制' : '复制'}
              </button>
            </div>
            <pre class="px-4 py-3 overflow-x-auto"><code>${formatCode(code, language)}</code></pre>
          </div>
        `;
        
        index++;
        return result;
      });
    }
    
    return formatted;
  }, [processMessage]);

  /**
   * 备份消息到SessionStorage
   */
  const backupMessage = useCallback((message: Message) => {
    try {
      const backupKey = `message_backup_${message.id}`;
      sessionStorage.setItem(backupKey, JSON.stringify(message));
    } catch (err) {
      console.error('消息备份失败:', err);
    }
  }, []);

  /**
   * 从SessionStorage恢复消息
   */
  const restoreMessage = useCallback((messageId: string): Message | null => {
    try {
      const backupKey = `message_backup_${messageId}`;
      const backupData = sessionStorage.getItem(backupKey);
      if (backupData) {
        const message = JSON.parse(backupData);
        return {
          ...message,
          timestamp: new Date(message.timestamp)
        };
      }
    } catch (err) {
      console.error('消息恢复失败:', err);
    }
    return null;
  }, []);

  return {
    processMessage,
    formatContent,
    extractCodeBlocks,
    backupMessage,
    restoreMessage
  };
} 