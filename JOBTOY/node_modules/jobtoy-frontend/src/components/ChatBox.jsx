import React, { useState, useEffect, useRef } from 'react';
import { useMessages } from '../hooks/useMessages';
import { useAuth } from '../hooks/useAuth';
import './ChatBox.css';

export default function ChatBox({ userId, userName }) {
  const { messages, loading, fetchMessages, sendMessage } = useMessages();
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (userId) {
      fetchMessages(userId);
    }
  }, [userId, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    try {
      setSending(true);
      await sendMessage(userId, inputText.trim());
      setInputText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="chatbox-loading">
        <p>Loading conversation...</p>
      </div>
    );
  }

  return (
    <div className="chatbox">
      <div className="chatbox-header">
        <h3>{userName}</h3>
      </div>

      <div className="chatbox-messages">
        {messages.length === 0 ? (
          <div className="chatbox-empty">
            <p>No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOutgoing = msg.senderId === user?._id || msg.senderId?._id === user?._id;
            return (
              <div
                key={msg._id || msg.createdAt}
                className={`chatbox-message ${isOutgoing ? 'outgoing' : ''}`}
              >
                <div className="message-avatar">
                  <img
                    src={
                      isOutgoing
                        ? user?.avatar || '/default-avatar.png'
                        : '/default-avatar.png'
                    }
                    alt="avatar"
                  />
                </div>
                <div className="message-content">
                  <p className="message-text">{msg.content}</p>
                  <span className="message-time">
                    {msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Sending...'}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="chatbox-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={sending}
          className="input-field"
          style={{ marginBottom: 0 }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={sending || !inputText.trim()}
          style={{ padding: '0 1.5rem', whiteSpace: 'nowrap' }}
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
