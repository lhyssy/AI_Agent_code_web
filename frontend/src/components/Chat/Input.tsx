'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PaperPlaneRight, Paperclip, X } from 'phosphor-react';
import { InputProps } from './types';

export const Input: React.FC<InputProps> = ({
  onSend,
  onUpload,
  disabled = false,
  placeholder = '请输入您的需求...',
  mentions = []
}) => {
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mentionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mentionsRef.current && !mentionsRef.current.contains(event.target as Node)) {
        setShowMentions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === '@') {
      setShowMentions(true);
      setMentionFilter('');
    } else if (showMentions && e.key === 'Escape') {
      setShowMentions(false);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    // 自动调整高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }

    // 处理@提及
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const filterText = value.slice(lastAtIndex + 1);
      setMentionFilter(filterText);
      setShowMentions(true);
    }
  };

  const handleMention = (agent: { name: string; role: string }) => {
    const lastAtIndex = input.lastIndexOf('@');
    const newInput = input.slice(0, lastAtIndex) + `@${agent.name} `;
    setInput(newInput);
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!input.trim() && files.length === 0) return;

    if (files.length > 0) {
      onUpload(files);
      setFiles([]);
    }

    if (input.trim()) {
      onSend(input);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const filteredMentions = mentions.filter(agent => 
    agent.name.toLowerCase().includes(mentionFilter.toLowerCase()) ||
    agent.role.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  return (
    <div className="relative">
      {/* 文件预览 */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-gray-800 rounded-t-lg">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center bg-gray-700 text-gray-200 px-2 py-1 rounded"
            >
              <span className="text-sm truncate max-w-[200px]">{file.name}</span>
              <button
                onClick={() => handleRemoveFile(index)}
                className="ml-2 text-gray-400 hover:text-gray-200"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 输入区域 */}
      <div className="flex items-end p-4 bg-gray-900 border-t border-gray-700">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-gray-800 text-gray-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none min-h-[40px] max-h-[200px]"
            disabled={disabled}
            rows={1}
          />

          {/* @提及下拉框 */}
          {showMentions && filteredMentions.length > 0 && (
            <div
              ref={mentionsRef}
              className="absolute bottom-full mb-2 w-64 bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            >
              {filteredMentions.map(agent => (
                <button
                  key={agent.name}
                  onClick={() => handleMention(agent)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center space-x-2"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: agent.color }}
                  />
                  <span className="text-gray-200">{agent.name}</span>
                  <span className="text-gray-400 text-sm">({agent.role})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 文件上传按钮 */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-2 ml-2 text-gray-400 hover:text-gray-200 transition-colors"
          disabled={disabled}
        >
          <Paperclip size={20} />
        </button>

        {/* 发送按钮 */}
        <button
          onClick={handleSubmit}
          className={`px-4 py-2 ml-2 rounded-lg bg-purple-600 text-white flex items-center justify-center transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'
          }`}
          disabled={disabled}
        >
          <PaperPlaneRight size={20} weight="fill" />
        </button>
      </div>
    </div>
  );
}; 