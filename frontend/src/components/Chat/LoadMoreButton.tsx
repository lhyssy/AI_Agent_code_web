import React from 'react';
import { CaretUp } from 'phosphor-react';

interface LoadMoreButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({ onClick, isLoading }) => {
  return (
    <div className="sticky top-0 py-2 z-10 flex justify-center">
      <button
        onClick={onClick}
        disabled={isLoading}
        className="bg-gray-800 hover:bg-gray-700 text-blue-400 rounded-full px-4 py-1 text-sm flex items-center space-x-1 disabled:opacity-50 transition-all duration-200"
      >
        {isLoading ? (
          <>
            <div className="animate-spin h-3 w-3 mr-2 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span>加载中...</span>
          </>
        ) : (
          <>
            <CaretUp size={14} />
            <span>加载更多</span>
          </>
        )}
      </button>
    </div>
  );
}; 