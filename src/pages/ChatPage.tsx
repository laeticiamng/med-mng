import React from 'react';
import { ChatNavigation } from '@/components/navigation/ChatNavigation';

export const ChatPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <ChatNavigation />
      </div>
    </div>
  );
};