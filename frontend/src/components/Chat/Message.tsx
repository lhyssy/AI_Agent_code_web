'use client';

import React, { useState, useEffect, memo } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { User, Robot, Copy, Pencil, Trash, ArrowBendUpLeft, ArrowClockwise } from 'phosphor-react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { MessageProps } from './types';
import { useChatContext } from './ChatContext';
import { motion } from 'framer-motion';
import { formatCode } from '@/lib/utils';

const Message = memo(({ message, onEdit, onDelete, onReply, onRetry }: MessageProps) => {
  const { agents } = useChatContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [copiedBlocks, setCopiedBlocks] = useState<{[key: string]: boolean}>({});
  
  // 从sessionStorage恢复可能丢失的消息内容
  useEffect(() => {
    // 在组件挂载时应用淡入动画
    const timer = setTimeout(() => setIsVisible(true), 100);
    
    // 尝试从备份加载消息内容（如果当前内容为空）
    if (!message.content && message.id) {
      try {
        const backupKey = `message_backup_${message.id}`;
        const backup = sessionStorage.getItem(backupKey);
        if (backup) {
          const backupData = JSON.parse(backup);
          if (backupData && backupData.content) {
            console.log(`已从备份恢复消息: ${message.id}`);
            // 我们不直接修改message，因为它是props，但可以提供给onEdit处理
            if (onEdit) {
              onEdit(message.id, backupData.content);
            }
          }
        }
      } catch (e) {
        console.error('恢复消息备份失败:', e);
      }
    }
    
    return () => clearTimeout(timer);
  }, [message.id]);

  const agent = message.agentName ? 
    agents.find(a => a.name.toLowerCase() === message.agentName?.toLowerCase()) :
    null;

  // 提取代码块
  useEffect(() => {
    if (!message.codeBlocks && message.content) {
      const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
      const codeBlocks = [];
      let match;
      
      while ((match = codeRegex.exec(message.content)) !== null) {
        codeBlocks.push({
          language: match[1] || 'text',
          code: match[2].trim()
        });
      }
      
      if (codeBlocks.length > 0 && onEdit) {
        onEdit(message.id, message.content);
      }
    }
  }, [message.content, message.id]);

  const handleEditClick = () => {
    setEditContent(message.content);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (onEdit && editContent.trim() !== message.content.trim()) {
      onEdit(message.id, editContent);
    }
    setIsEditing(false);
  };

  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code).then(() => {
      // 显示复制成功状态，然后自动消失
      setCopiedBlocks(prev => ({ ...prev, [index]: true }));
      setTimeout(() => {
        setCopiedBlocks(prev => ({ ...prev, [index]: false }));
      }, 2000);
    });
  };

  const formatContent = (content: string) => {
    if (!content) return '';
    
    // 保留空格和换行
    let formatted = content
      .replace(/\n/g, '<br/>')
      .replace(/\s\s/g, '&nbsp;&nbsp;');
    
    // 替换代码块
    if (message.codeBlocks && message.codeBlocks.length > 0) {
      const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
      let index = 0;
      
      formatted = formatted.replace(codeRegex, () => {
        const codeBlock = message.codeBlocks![index];
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
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4 relative group`}
    >
      {/* 如果不是用户消息，显示代理头像 */}
      {message.role !== 'user' && (
        <div className="flex-shrink-0 mr-3">
          <div 
            className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-medium"
            style={{ 
              backgroundColor: message.agentName 
                ? `var(--agent-${message.agentName.toLowerCase()}-color, #6366f1)` 
                : '#6366f1' 
            }}
          >
            {message.agentName ? message.agentName.charAt(0).toUpperCase() : 'A'}
          </div>
        </div>
      )}
      
      <div 
        className={`relative max-w-3xl ${
          message.role === 'user'
            ? 'bg-blue-600 text-white rounded-t-xl rounded-bl-xl' 
            : 'bg-gray-700 text-gray-100 rounded-t-xl rounded-br-xl'
        } px-4 py-3 shadow-md ${message.deleted ? 'opacity-50' : ''}`}
      >
        {/* 消息状态指示器 */}
        {message.status === 'sending' && (
          <div className="absolute bottom-1 right-2">
            <div className="animate-pulse w-2 h-2 bg-blue-300 rounded-full"></div>
          </div>
        )}
        
        {message.status === 'failed' && (
          <div className="absolute -bottom-5 right-0 text-xs text-red-500 flex items-center">
            <span>发送失败</span>
            {onRetry && (
              <button 
                onClick={() => onRetry(message.id)} 
                className="ml-2 underline hover:text-red-400"
              >
                重试
              </button>
            )}
          </div>
        )}
        
        {/* 编辑模式 */}
        {isEditing ? (
          <div>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded p-2 focus:outline-none focus:border-blue-500"
              rows={5}
            />
            <div className="flex justify-end mt-2 space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded text-white"
              >
                取消
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 rounded text-white"
              >
                保存
              </button>
            </div>
          </div>
        ) : (
          <div>
            {message.deleted ? (
              <div className="italic text-gray-400">此消息已删除</div>
            ) : (
              <div 
                className="break-words"
                dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
              />
            )}
          </div>
        )}
        
        {/* 消息操作按钮 */}
        {!isEditing && !message.deleted && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex space-x-1">
              {onReply && (
                <button
                  onClick={() => onReply(message.id)}
                  className="text-xs bg-gray-800 hover:bg-gray-700 rounded p-1 text-gray-300"
                  title="回复"
                >
                  回复
                </button>
              )}
              {onEdit && message.role === 'user' && (
                <button
                  onClick={handleEditClick}
                  className="text-xs bg-gray-800 hover:bg-gray-700 rounded p-1 text-gray-300"
                  title="编辑"
                >
                  编辑
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => {
                    if (window.confirm('确定要删除这条消息吗？')) {
                      onDelete(message.id);
                    }
                  }}
                  className="text-xs bg-gray-800 hover:bg-gray-700 rounded p-1 text-gray-300"
                  title="删除"
                >
                  删除
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* 时间戳 */}
        <div className={`text-xs ${message.role === 'user' ? 'text-blue-300' : 'text-gray-400'} mt-1`}>
          {format(message.timestamp, 'HH:mm', { locale: zhCN })}
          {message.edited && <span className="ml-1">(已编辑)</span>}
          {message.agentName && message.role !== 'user' && (
            <span className="ml-1">- {message.agentName}</span>
          )}
        </div>
      </div>
      
      {message.role === 'user' && (
        <div className="flex-shrink-0 ml-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium">
            U
          </div>
        </div>
      )}
    </motion.div>
  );
});

Message.displayName = 'Message';

export default Message; 