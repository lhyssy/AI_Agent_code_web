import React from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface TimeGroupProps {
  date: Date;
  children: React.ReactNode;
}

export const TimeGroup: React.FC<TimeGroupProps> = ({ date, children }) => (
  <div className="relative py-4">
    <div className="absolute inset-0 flex items-center">
      <div className="border-t border-gray-700 w-full" />
    </div>
    <div className="relative flex justify-center">
      <span className="px-2 text-xs text-gray-500 bg-gray-900">
        {format(date, 'yyyy年MM月dd日', { locale: zhCN })}
      </span>
    </div>
    {children}
  </div>
); 