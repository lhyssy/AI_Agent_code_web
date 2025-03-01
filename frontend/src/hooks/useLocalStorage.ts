import { useState, useEffect, useCallback } from 'react';

/**
 * 本地存储Hook - 管理localStorage数据
 * 
 * @param key 存储键名
 * @param initialValue 初始值
 * @param processAfterLoad 加载后处理函数，可用于格式化日期等
 */
export function useLocalStorage<T>(
  key: string, 
  initialValue: T,
  processAfterLoad?: (value: T) => T
) {
  // 从localStorage读取初始值或使用默认值
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      
      if (item) {
        const parsedValue = JSON.parse(item) as T;
        return processAfterLoad ? processAfterLoad(parsedValue) : parsedValue;
      }
      
      return initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue, processAfterLoad]);

  const [storedValue, setStoredValue] = useState<T>(initialValue);
  
  // 初始化时从localStorage加载数据
  useEffect(() => {
    setStoredValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // 保存到localStorage并更新state
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // 允许value是函数
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // 保存到state
      setStoredValue(valueToStore);
      
      // 保存到localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // 从localStorage移除数据
  const removeItem = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        setStoredValue(initialValue);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return {
    value: storedValue,
    setValue,
    removeItem,
    reload: () => setStoredValue(readValue())
  };
} 