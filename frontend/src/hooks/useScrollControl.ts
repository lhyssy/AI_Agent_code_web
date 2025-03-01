import { useCallback, useRef, useState, useEffect } from 'react';

interface ScrollControlProps {
  autoScrollThreshold?: number;
  topScrollThreshold?: number;
}

export const useScrollControl = ({ 
  autoScrollThreshold = 50, 
  topScrollThreshold = 50 
}: ScrollControlProps = {}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  
  const scrollToTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
      setAutoScroll(true);
    }
  }, []);
  
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const atTop = scrollTop < topScrollThreshold;
    const atBottom = scrollHeight - scrollTop - clientHeight < autoScrollThreshold;
    
    const newScrollPosition = scrollHeight <= clientHeight 
      ? 100 
      : (scrollTop / (scrollHeight - clientHeight)) * 100;
    setScrollPosition(Math.min(newScrollPosition, 100));
    
    setShowScrollUp(!atTop);
    setShowScrollDown(!atBottom);
    
    if (atBottom) {
      setAutoScroll(true);
    } else {
      setAutoScroll(false);
    }
  }, [autoScrollThreshold, topScrollThreshold]);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);
  
  return {
    containerRef,
    endRef,
    showScrollUp,
    showScrollDown,
    autoScroll,
    scrollPosition,
    scrollToTop,
    scrollToBottom,
    handleScroll
  };
}; 