'use client';

import { useState } from 'react';
import { Check, Copy } from 'phosphor-react';

interface CodeViewProps {
  code?: string;
  language?: string;
}

export default function CodeView({ code = '', language = 'typescript' }: CodeViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 代码头部 */}
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-gray-400">{language}</div>
        <button
          onClick={handleCopy}
          className="p-2 hover:bg-gray-700 rounded-md transition-colors"
        >
          {copied ? (
            <Check size={20} className="text-green-500" />
          ) : (
            <Copy size={20} className="text-gray-400" />
          )}
        </button>
      </div>

      {/* 代码内容 */}
      <div className="flex-1 overflow-auto rounded-lg bg-gray-900 p-4">
        <pre className="font-mono text-sm text-gray-300">
          <code>{code || '// 代码将在这里显示...'}</code>
        </pre>
      </div>
    </div>
  );
} 