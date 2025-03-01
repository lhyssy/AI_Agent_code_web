'use client';

import { ChatProvider } from './Chat/ChatContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChatProvider>
      {children}
    </ChatProvider>
  );
} 