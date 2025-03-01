'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { User, Robot, Copy, Pencil, Trash, ArrowBendUpLeft, ArrowClockwise } from 'phosphor-react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { MessageProps } from './types';
import { useChatContext } from './ChatContext';

export const Message: React.FC<MessageProps> = ({
  message,
  onEdit,
  onDelete,
  onReply,
  onRetry
}) => {
  const { agents } = useChatContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showActions, setShowActions] = useState(false);

  const agent = message.agentName ? 
    agents.find(a => a.name.toLowerCase() === message.agentName?.toLowerCase()) :
    null;

  const handleEdit = () => {
    if (isEditing) {
      onEdit?.(message.id, editContent);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const renderContent = () => {
    if (message.deleted) {
      return <span className="italic text-gray-400">此消息已被删除</span>;
    }

    if (isEditing) {
      return (
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full bg-gray-800 text-gray-100 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows={3}
          autoFocus
        />
      );
    }

    const codeBlocks = message.codeBlocks || extractCodeBlocks(message.content);
    const textContent = message.content.replace(/```[\s\S]*?```/g, '').trim();

    return (
      <>
        {textContent && <div className="mb-2">{textContent}</div>}
        {codeBlocks.map((block, index) => (
          <div key={index} className="mt-2">
            <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
              <span>{block.language}</span>
              <button
                onClick={() => handleCopyCode(block.code)}
                className="hover:text-gray-200 transition-colors"
              >
                <Copy size={16} />
              </button>
            </div>
            <SyntaxHighlighter
              language={block.language}
              style={atomDark}
              customStyle={{
                margin: 0,
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
              }}
              PreTag="div"
            >
              {block.code}
            </SyntaxHighlighter>
          </div>
        ))}
      </>
    );
  };

  const extractCodeBlocks = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const codeBlocks = [];
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      codeBlocks.push({
        language: match[1] || 'plaintext',
        code: match[2].trim(),
      });
    }

    return codeBlocks;
  };

  return (
    <div
      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`flex ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[80%] space-x-2`}>
        {/* Avatar */}
        <div 
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            message.role === 'user' ? 'ml-2' : 'mr-2'
          }`}
          style={{
            backgroundColor: message.role === 'user' ? '#6366f1' : (agent?.color || '#4b5563')
          }}
        >
          {message.role === 'user' ? (
            <User size={20} weight="fill" className="text-white" />
          ) : (
            <Robot size={20} weight="fill" className="text-white" />
          )}
        </div>

        {/* Message content */}
        <div className="flex flex-col">
          {/* Agent name if present */}
          {message.role === 'assistant' && agent && (
            <div className="text-sm text-gray-400 mb-1">
              {agent.role}
            </div>
          )}
          
          {/* Message bubble */}
          <div
            className={`rounded-lg p-3 ${
              message.role === 'user'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-100'
            }`}
          >
            {renderContent()}
          </div>

          {/* Message status and actions */}
          <div className={`flex items-center mt-1 text-xs ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          }`}>
            <span className="text-gray-500">
              {format(message.timestamp, 'HH:mm', { locale: zhCN })}
            </span>
            
            {showActions && (
              <div className={`flex items-center space-x-2 ml-2 ${
                message.status === 'failed' ? 'text-red-500' : 'text-gray-500'
              }`}>
                {message.edited && (
                  <span className="italic">(已编辑)</span>
                )}
                
                {message.status === 'failed' && (
                  <button
                    onClick={() => onRetry?.(message.id)}
                    className="hover:text-gray-300 transition-colors"
                  >
                    <ArrowClockwise size={16} />
                  </button>
                )}
                
                <button
                  onClick={() => onReply?.(message.id)}
                  className="hover:text-gray-300 transition-colors"
                >
                  <ArrowBendUpLeft size={16} />
                </button>
                
                {message.role === 'user' && !message.deleted && (
                  <>
                    <button
                      onClick={handleEdit}
                      className="hover:text-gray-300 transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    
                    <button
                      onClick={() => onDelete?.(message.id)}
                      className="hover:text-gray-300 transition-colors"
                    >
                      <Trash size={16} />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 