import React, { useState } from 'react';
import { useMessages } from '../hooks/useMessages';
import { useAuth } from '../hooks/useAuth';
import ChatBox from '../components/ChatBox';
import { Card, Badge } from '../components/index';
import './Messages.css';

export default function Messages() {
  const { conversations, unreadCount, setCurrentConversation } = useMessages();
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(null);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setCurrentConversation(conversation);
  };

  return (
    <div className="messages-page">
      <div className="messages-container">
        <div className="messages-sidebar">
          <div className="messages-header">
            <h2>Messages</h2>
            {unreadCount > 0 && (
              <Badge variant="danger">{unreadCount}</Badge>
            )}
          </div>

          <div className="conversations-list">
            {conversations.length === 0 ? (
              <p className="empty-state">No conversations yet</p>
            ) : (
              conversations.map((conv) => (
                <Card
                  key={conv.conversationId}
                  className={`conversation-card ${
                    selectedConversation?.conversationId === conv.conversationId
                      ? 'active'
                      : ''
                  }`}
                  onClick={() => handleSelectConversation(conv)}
                >
                  <div className="conversation-avatar">
                    <img
                      src={conv.participant.avatar || '/default-avatar.png'}
                      alt={conv.participant.name}
                    />
                  </div>
                  <div className="conversation-info">
                    <h4>{conv.participant.name}</h4>
                    <p className="conversation-preview">
                      {conv.lastMessage.substring(0, 50)}...
                    </p>
                    {conv.unreadCount > 0 && (
                      <Badge variant="primary" size="sm">
                        {conv.unreadCount}
                      </Badge>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="messages-main">
          {selectedConversation ? (
            <ChatBox
              userId={selectedConversation.participant._id}
              userName={selectedConversation.participant.name}
            />
          ) : (
            <div className="no-conversation">
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}