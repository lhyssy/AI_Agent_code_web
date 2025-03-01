import React from 'react';
import { CaretUp, CaretDown, ArrowUp, ArrowDown, CaretRight, ArrowClockwise } from 'phosphor-react';

// 箭头图标组件
export const ArrowUpIcon = ({ className = '', ...props }: React.ComponentProps<typeof ArrowUp>) => {
  return <ArrowUp {...props} className={className} />;
};

export const ArrowDownIcon = ({ className = '', ...props }: React.ComponentProps<typeof ArrowDown>) => {
  return <ArrowDown {...props} className={className} />;
};

// 小箭头图标组件
export const CaretUpIcon = ({ className = '', ...props }: React.ComponentProps<typeof CaretUp>) => {
  return <CaretUp {...props} className={className} />;
};

export const CaretDownIcon = ({ className = '', ...props }: React.ComponentProps<typeof CaretDown>) => {
  return <CaretDown {...props} className={className} />;
};

export const CaretRightIcon = ({ className = '', ...props }: React.ComponentProps<typeof CaretRight>) => {
  return <CaretRight {...props} className={className} />;
};

// 刷新图标组件
export const RefreshIcon = ({ className = '', ...props }: React.ComponentProps<typeof ArrowClockwise>) => {
  return <ArrowClockwise {...props} className={className} />;
};

// 导出所有图标供统一使用
export {
  ArrowUp,
  ArrowDown,
  CaretUp,
  CaretDown,
  CaretRight,
  ArrowClockwise,
}; 