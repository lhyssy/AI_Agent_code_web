'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Plus, Archive, Trash } from 'phosphor-react';
import { CaretDownIcon, CaretRightIcon } from '@/components/Icons';
import { useChatContext } from './ChatContext';

export const SessionList: React.FC = () => {
  const {
    sessions,
    currentSession,
    createSession,
    switchSession,
    archiveSession,
    deleteSession
  } = useChatContext();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const activeSessions = sessions.filter(s => !s.archived);
  const archivedSessions = sessions.filter(s => s.archived);

  const renderSession = (session: typeof sessions[0]) => (
    <div
      key={session.id}
      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
        currentSession?.id === session.id
          ? 'bg-purple-600 text-white'
          : 'hover:bg-gray-700 text-gray-300'
      }`}
      onClick={() => switchSession(session.id)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center">
          <h3 className="text-sm font-medium truncate">{session.title}</h3>
          {session.unreadCount > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
              {session.unreadCount}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {format(session.updatedAt, 'MM/dd HH:mm', { locale: zhCN })}
        </p>
      </div>

      <div className="flex items-center ml-2">
        {!session.archived ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              archiveSession(session.id);
            }}
            className="p-1 text-gray-400 hover:text-gray-200"
          >
            <Archive size={16} />
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteSession(session.id);
            }}
            className="p-1 text-gray-400 hover:text-red-500"
          >
            <Trash size={16} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className={`bg-gray-900 border-r border-gray-700 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* 折叠按钮 */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute right-0 top-2 p-2 text-gray-400 hover:text-gray-200"
      >
        {isCollapsed ? <CaretRightIcon size={20} /> : <CaretDownIcon size={20} />}
      </button>

      {/* 新建会话按钮 */}
      <button
        onClick={createSession}
        className={`m-4 p-2 bg-purple-600 text-white rounded-lg flex items-center justify-center hover:bg-purple-700 transition-colors ${
          isCollapsed ? 'mx-2' : ''
        }`}
      >
        <Plus size={20} className={isCollapsed ? '' : 'mr-2'} />
        {!isCollapsed && '新建会话'}
      </button>

      {/* 活动会话列表 */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {activeSessions.map(renderSession)}
          </div>

          {/* 已归档会话 */}
          {archivedSessions.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowArchived(!showArchived)}
                className="flex items-center text-xs font-medium text-gray-400 px-3 mb-2 hover:text-gray-200"
              >
                {showArchived ? <CaretDownIcon size={12} /> : <CaretRightIcon size={12} />}
                <span className="ml-1">已归档会话 ({archivedSessions.length})</span>
              </button>
              {showArchived && (
                <div className="space-y-1">
                  {archivedSessions.map(renderSession)}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 