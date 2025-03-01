'use client';

import { Suspense, useState, useEffect } from 'react';
import Split from 'react-split';
import ChatWindow from '@/components/Chat/ChatWindow';
import CodeView from '@/components/Code/CodeView';
import CollaborationFlow from '@/components/Flow/CollaborationFlow';

export default function Home() {
  // 初始大小设置为常量以确保首次渲染时有默认值
  const DEFAULT_SIZES = {
    chat: 35,
    flow: 40
  };
  
  const [sizes, setSizes] = useState(DEFAULT_SIZES);
  const [layoutLoaded, setLayoutLoaded] = useState(false);

  // 保存布局大小到localStorage并从中加载
  useEffect(() => {
    const savedSizes = localStorage.getItem('layout_sizes');
    if (savedSizes) {
      setSizes(JSON.parse(savedSizes));
    }
    setLayoutLoaded(true);
  }, []);

  const handleSizesChange = (newSizes: number[]) => {
    const [chat] = newSizes;
    setSizes(prev => {
      const newState = { ...prev, chat };
      localStorage.setItem('layout_sizes', JSON.stringify(newState));
      return newState;
    });
  };

  const handleVerticalSizesChange = (newSizes: number[]) => {
    const [flow] = newSizes;
    setSizes(prev => {
      const newState = { ...prev, flow };
      localStorage.setItem('layout_sizes', JSON.stringify(newState));
      return newState;
    });
  };

  // 在布局加载前显示加载状态
  if (!layoutLoaded) {
    return (
      <div className="flex flex-col h-screen bg-gray-950 text-white">
        <header className="h-14 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 mr-2" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.5 6.75h15m-15 10.5h15M7.5 12h9" stroke="url(#paint0_linear)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="paint0_linear" x1="4.5" y1="6.75" x2="19.5" y2="17.25" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#a78bfa" />
                  <stop offset="1" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            AI Agent 协作平台
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-gray-500">v0.1.0</span>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-400">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      {/* 顶部导航栏 */}
      <header className="h-14 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm flex items-center justify-between px-6">
        <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center">
          <svg viewBox="0 0 24 24" className="w-6 h-6 mr-2" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.5 6.75h15m-15 10.5h15M7.5 12h9" stroke="url(#paint0_linear)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="paint0_linear" x1="4.5" y1="6.75" x2="19.5" y2="17.25" gradientUnits="userSpaceOnUse">
                <stop stopColor="#a78bfa" />
                <stop offset="1" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          AI Agent 协作平台
        </h1>
        <div className="flex items-center space-x-4">
          <a 
            href="https://github.com/yourusername/AI_Agent_code_web" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-sm text-gray-400 hover:text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 mr-1" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.09.682-.217.682-.48 0-.236-.008-.865-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            GitHub
          </a>
          <span className="text-xs text-gray-500">v0.1.0</span>
        </div>
      </header>

      {/* 主要内容区域 */}
      <Split
        className="flex-1 flex"
        sizes={[sizes.chat, 100 - sizes.chat]}
        minSize={[400, 600]}
        expandToMin={false}
        gutterSize={6}
        gutterStyle={() => ({
          backgroundColor: '#1f2937',
          cursor: 'col-resize'
        })}
        onDragEnd={handleSizesChange}
      >
        {/* 左侧聊天区域 */}
        <div className="h-full flex flex-col bg-gray-900/30 backdrop-blur-sm">
          <ChatWindow />
        </div>

        {/* 右侧内容区域 */}
        <Split
          className="flex flex-col bg-gray-900/30 backdrop-blur-sm"
          direction="vertical"
          sizes={[sizes.flow, 100 - sizes.flow]}
          minSize={[250, 350]}
          expandToMin={false}
          gutterSize={6}
          gutterStyle={() => ({
            backgroundColor: '#1f2937',
            cursor: 'row-resize'
          })}
          onDragEnd={handleVerticalSizesChange}
        >
          {/* 上方协作流程图 */}
          <div className="w-full h-full overflow-hidden p-4">
            <CollaborationFlow />
          </div>

          {/* 下方代码展示区 */}
          <div className="w-full h-full overflow-auto p-4">
            <CodeView />
          </div>
        </Split>
      </Split>
    </div>
  );
} 