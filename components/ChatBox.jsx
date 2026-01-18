'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useMessages, usePresence } from '@ably/chat/react';
import styles from './ChatBox.module.css';

export default function ChatBox({ clientId }) {
  const inputBox = useRef(null);
  const messageEndRef = useRef(null);

  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const messageTextIsEmpty = messageText.trim().length === 0;

  const { send: sendMessage } = useMessages({
    listener: (payload) => {
      const newMessage = payload.message;
      setMessages((prevMessages) => {
        if (prevMessages.some((m) => m.isSameAs(newMessage))) return prevMessages;
        const index = prevMessages.findIndex((m) => m.after(newMessage));
        const next = [...prevMessages];
        if (index === -1) next.push(newMessage);
        else next.splice(index, 0, newMessage);
        return next;
      });
    },
  });

  usePresence();

  const sendChatMessage = async (text) => {
    if (!sendMessage) return;
    try {
      await sendMessage({ text });
      setMessageText('');
      inputBox.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFormSubmission = (e) => {
    e.preventDefault();
    sendChatMessage(messageText);
  };

  const handleKeyPress = (e) => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    e.preventDefault();
    sendChatMessage(messageText);
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className={styles.chatHolder} data-testid="chat-root">
      <div className={styles.chatText} data-testid="message-list">
        {messages.map((message, index) => {
          const isMe = message.clientId === clientId;
          return (
            <div
              key={message.serial ?? index}
              className={`${styles.messageWrapper} ${isMe ? styles.me : styles.other}`}
              data-testid="message-item"
            >
              {!isMe && (
                <span className={styles.sender} data-testid="message-author">{message.clientId}</span>
              )}
              <span className={styles.bubble} data-author={isMe ? 'me' : 'other'} data-testid="message-text">
                {message.text}
              </span>
              {isMe && (
                <span className={styles.sender} data-testid="message-author">{message.clientId}</span>
              )}
            </div>
          );
        })}
        <div ref={messageEndRef} />
      </div>
      <form onSubmit={handleFormSubmission} className={styles.form}>
        <textarea
          ref={inputBox}
          value={messageText}
          placeholder="Type a message..."
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
          className={styles.textarea}
          data-testid="message-input"
        />
        <button type="submit" className={styles.button} disabled={messageTextIsEmpty} data-testid="send-button">
          Send
        </button>
      </form>
    </div>
  );
}
