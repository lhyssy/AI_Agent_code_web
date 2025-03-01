import React from 'react';
import { CaretUp, CaretDown } from 'phosphor-react';

interface ScrollButtonsProps {
  showScrollUp: boolean;
  showScrollDown: boolean;
  autoScroll: boolean;
  scrollPosition: number;
  scrollToTop: () => void;
  scrollToBottom: () => void;
  hasNewMessages?: boolean;
}

export const ScrollButtons: React.FC<ScrollButtonsProps> = ({
  showScrollUp,
  showScrollDown,
  autoScroll,
  scrollPosition,
  scrollToTop,
  scrollToBottom,
  hasNewMessages = false
}) => {
  return (
    <>
      {/* 滚动控制按钮 - 上滚动 */}
      {showScrollUp && (
        <div 
          className={`absolute top-4 right-4 bg-gray-800 hover:bg-gray-700 p-2 rounded-full shadow-lg z-10 cursor-pointer transition-all duration-200 ${showScrollUp ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
          onClick={scrollToTop}
        >
          <CaretUp size={18} className="text-blue-400" />
        </div>
      )}
      
      {/* 滚动控制按钮 - 下滚动 */}
      {showScrollDown && (
        <div 
          className={`absolute bottom-20 right-4 bg-gray-800 hover:bg-gray-700 p-2 rounded-full shadow-lg z-10 cursor-pointer transition-all duration-200 ${showScrollDown ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
          onClick={scrollToBottom}
        >
          <CaretDown size={18} className="text-blue-400" />
        </div>
      )}
      
      {/* 新消息提示 */}
      {!autoScroll && hasNewMessages && (
        <div 
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-blue-900 bg-opacity-70 text-blue-200 text-xs px-3 py-1 rounded-full cursor-pointer shadow-lg transition-all duration-200 hover:bg-blue-800"
          onClick={scrollToBottom}
        >
          <div className="flex items-center space-x-1">
            <span>新消息</span>
            <CaretDown size={12} />
          </div>
        </div>
      )}
      
      {/* 滚动位置指示器 */}
      <div className="absolute right-1.5 top-0 bottom-16 w-1 pointer-events-none">
        <div 
          className="absolute bg-blue-500 w-1 opacity-30 rounded transition-all duration-200"
          style={{
            top: '0%',
            height: `${scrollPosition}%`
          }}
        ></div>
      </div>
    </>
  );
}; 