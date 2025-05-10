'use client';

import { useRef, useMemo } from 'react';
import * as Ably from 'ably';
import { ChatClient } from '@ably/chat';
import { ChatClientProvider, ChatRoomProvider } from '@ably/chat/react';
import ChatBox from './ChatBox.jsx';
import OnlineUsers from './OnlineUsers.jsx';
import styles from './Chat.module.css';

const roomOptions = {
  history: { limit: 50 },
  presence: {},
};

function generateClientId() {
  const stored = sessionStorage.getItem('chat-client-id');
  if (stored) return stored;
  const id = `user-${Math.random().toString(36).slice(2, 7)}`;
  sessionStorage.setItem('chat-client-id', id);
  return id;
}

export default function Chat() {
  const clientId = useRef(generateClientId()).current;

  const { realtimeClient, chatClient } = useMemo(() => {
    const realtimeClient = new Ably.Realtime({
      authUrl: `/api?clientId=${clientId}`,
    });
    const chatClient = new ChatClient(realtimeClient);
    return { realtimeClient, chatClient };
  }, [clientId]);

  return (
    <ChatClientProvider client={chatClient}>
      <ChatRoomProvider id="chat-demo" options={roomOptions}>
        <div className={styles.layout}>
          <ChatBox clientId={clientId} />
          <OnlineUsers />
        </div>
      </ChatRoomProvider>
    </ChatClientProvider>
  );
}
