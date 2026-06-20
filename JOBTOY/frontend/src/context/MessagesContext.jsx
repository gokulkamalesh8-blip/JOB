import React, { createContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

export const MessagesContext = createContext();

export const MessagesProvider = ({ children }) => {
  const { token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const config = { headers: { Authorization: `Bearer ${token}` } };

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await axios.get('/api/messages/conversations', config);
      setConversations(res.data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  }, [token]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(
    async (userId) => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/messages/${userId}`, config);
        setMessages(res.data.messages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Send message
  const sendMessage = useCallback(
    async (recipientId, content, jobId = null) => {
      try {
        const res = await axios.post(
          '/api/messages/send',
          { recipientId, content, jobId },
          config
        );

        setMessages((prev) => [...prev, res.data.data]);
        return res.data.data;
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    },
    [token]
  );

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await axios.get('/api/messages/unread/count', config);
      setUnreadCount(res.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [token]);

  // Initialize on mount
  useEffect(() => {
    if (token) {
      fetchConversations();
      fetchUnreadCount();

      // Poll for unread count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [token, fetchConversations, fetchUnreadCount]);

  const value = {
    conversations,
    currentConversation,
    messages,
    unreadCount,
    loading,
    setCurrentConversation,
    fetchConversations,
    fetchMessages,
    sendMessage,
    fetchUnreadCount,
  };

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  );
};