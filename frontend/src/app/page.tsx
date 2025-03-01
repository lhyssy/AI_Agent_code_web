'use client';

import { Suspense, useState, useEffect } from 'react';
import Split from 'react-split';
import ChatWindow from '@/components/Chat/ChatWindow';
import CodeView from '@/components/Code/CodeView';
import CollaborationFlow from '@/components/Flow/CollaborationFlow';

export default function Home() {
  const [sizes, setSizes] = useState({
    chat: 35,
    flow: 40
  });

  // 保存布局大小到localStorage
  useEffect(() => {
    const savedSizes = localStorage.getItem('layout_sizes');
    if (savedSizes) {
      setSizes(JSON.parse(savedSizes));
    }
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

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      {/* 顶部导航栏 */}
      <header className="h-14 border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm flex items-center justify-between px-6">
        <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          AI Agent 协作平台
        </h1>
        <div className="flex items-center space-x-4">
          {/* 这里可以添加其他导航元素 */}
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