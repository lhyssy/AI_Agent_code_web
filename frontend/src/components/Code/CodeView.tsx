'use client';

import { useState, useEffect } from 'react';
import { Check, Copy, Code, File } from 'phosphor-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useChatContext } from '../Chat/ChatContext';

interface CodeViewProps {
  code?: string;
  language?: string;
  fileName?: string;
}

// 添加示例代码展示
const EXAMPLE_CODE = `// 欢迎使用AI代码协作平台
// 这是一个示例代码

import React, { useState } from 'react';

interface Props {
  title: string;
  onAction: () => void;
}

export const ExampleComponent: React.FC<Props> = ({ 
  title, 
  onAction 
}) => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(prev => prev + 1);
    onAction();
  };

  return (
    <div className="example-component">
      <h2>{title}</h2>
      <p>计数: {count}</p>
      <button onClick={handleClick}>
        点击增加
      </button>
    </div>
  );
};

// 连接到后端后将展示实际生成的代码
`;

export default function CodeView({ 
  code = '', 
  language = 'typescript',
  fileName = 'example.tsx'
}: CodeViewProps) {
  const [copied, setCopied] = useState(false);
  const { isConnected } = useChatContext();
  const [displayCode, setDisplayCode] = useState(code || EXAMPLE_CODE);
  const [displayFileName, setDisplayFileName] = useState(fileName);

  useEffect(() => {
    // 如果有真实代码就显示，否则当未连接时显示示例代码
    if (code) {
      setDisplayCode(code);
      setDisplayFileName(fileName);
    } else if (!isConnected) {
      setDisplayCode(EXAMPLE_CODE);
      setDisplayFileName('ExampleComponent.tsx');
    } else {
      setDisplayCode('');
      setDisplayFileName('example.tsx');
    }
  }, [code, isConnected, fileName]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 代码头部 */}
      <div className="flex justify-between items-center mb-2 bg-gray-800/70 p-2 rounded-t-md border-b border-gray-700">
        <div className="flex items-center">
          <File size={18} className="text-gray-400 mr-2" />
          <div className="text-sm text-gray-300 font-mono">{displayFileName}</div>
          <div className="ml-3 px-2 py-0.5 bg-gray-700 rounded-md text-xs text-gray-400">{language}</div>
        </div>
        <button
          onClick={handleCopy}
          className="p-2 hover:bg-gray-700 rounded-md transition-colors flex items-center"
          title={copied ? "已复制" : "复制代码"}
        >
          {copied ? (
            <>
              <Check size={18} className="text-green-500 mr-1" />
              <span className="text-xs text-green-500">已复制</span>
            </>
          ) : (
            <>
              <Copy size={18} className="text-gray-400 mr-1" />
              <span className="text-xs text-gray-400">复制</span>
            </>
          )}
        </button>
      </div>

      {/* 代码内容 */}
      <div className="flex-1 overflow-auto rounded-b-lg bg-gray-900 border border-gray-800">
        {displayCode ? (
          <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: '1rem',
              borderRadius: '0 0 0.375rem 0.375rem',
              fontSize: '0.875rem',
              backgroundColor: 'transparent'
            }}
          >
            {displayCode}
          </SyntaxHighlighter>
        ) : (
          <div className="p-4 font-mono text-sm text-gray-500 flex items-center justify-center h-full">
            <Code size={24} className="mr-2 text-gray-600" />
            <span>// 代码将在这里显示...</span>
          </div>
        )}
      </div>
    </div>
  );
} 