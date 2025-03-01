import React from 'react';

interface LoadingProps {
  type?: 'dots' | 'spinner';
  size?: 'small' | 'medium' | 'large';
}

export const Loading: React.FC<LoadingProps> = ({ type = 'dots', size = 'medium' }) => {
  const sizes = {
    small: 'w-1.5 h-1.5',
    medium: 'w-2 h-2',
    large: 'w-3 h-3'
  };

  if (type === 'dots') {
    return (
      <div className="flex justify-start">
        <div className="bg-gray-700 rounded-lg p-3 flex items-center space-x-2">
          <div className={`${sizes[size]} bg-gray-400 rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
          <div className={`${sizes[size]} bg-gray-400 rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
          <div className={`${sizes[size]} bg-gray-400 rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="bg-gray-700 rounded-lg p-3">
        <div className={`${sizes[size]} border-2 border-gray-400 border-t-transparent rounded-full animate-spin`} />
      </div>
    </div>
  );
}; 