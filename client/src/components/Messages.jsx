import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Search, 
  User, 
  CheckCircle, 
  Clock, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export default function Messages({ 
  conversations = [], 
  activeContactId, 
  messages = [], 
  currentContact = null,
  currentUser,
  onSelectContact, 
  onSendMessage,
  onOpenProfileModal
}) {
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeContactId) return;
    onSendMessage(activeContactId, inputText);
    setInputText('');
  };

  const filteredConversations = conversations.filter(c => {
    if (!searchTerm.trim()) return true;
    const full = `${c.contact.first_name} ${c.contact.last_name} ${c.contact.headline || ''}`.toLowerCase();
    return full.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="glass-card" style={{ padding: 0, overflow: 'hidden', height: 'calc(100vh - 160px)', minHeight: '560px', display: 'flex' }}>
      {/* Left Sidebar: Conversations List */}
      <div style={{
        width: '320px',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(15, 23, 42, 0.6)'
      }}>
        {/* Search header */}
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={20} color="#818CF8" /> Messages
          </h2>
          <div style={{ position: 'relative' }}>
            <Search size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.25rem', height: '36px', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        {/* Conversations Scrollable List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredConversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              No messages found. Start a conversation from the Explore or Network tab!
            </div>
          ) : (
            filteredConversations.map(c => {
              const isSelected = activeContactId === c.contact.id;
              return (
                <div
                  key={c.contact.id}
                  onClick={() => onSelectContact(c.contact.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    cursor: 'pointer',
                    background: isSelected ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
                    borderLeft: isSelected ? '3px solid #818CF8' : '3px solid transparent',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <img
                    src={c.contact.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={c.contact.first_name}
                    style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isSelected ? '#FFF' : '#E2E8F0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.contact.first_name} {c.contact.last_name}
                      </span>
                      {c.lastMessage && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                          {new Date(c.lastMessage.created_at).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                      <p style={{
                        fontSize: '0.75rem',
                        color: c.unreadCount > 0 ? '#FFF' : 'var(--text-dim)',
                        fontWeight: c.unreadCount > 0 ? 600 : 400,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '180px'
                      }}>
                        {c.lastMessage ? c.lastMessage.content : 'Started conversation'}
                      </p>
                      {c.unreadCount > 0 && (
                        <span style={{
                          padding: '0.1rem 0.4rem',
                          borderRadius: '9999px',
                          background: '#6366F1',
                          color: '#FFF',
                          fontSize: '0.65rem',
                          fontWeight: 800
                        }}>
                          {c.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Pane: Active Thread */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-card)' }}>
        {currentContact ? (
          <>
            {/* Thread Header */}
            <div style={{
              padding: '0.85rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(15, 23, 42, 0.4)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <img
                  src={currentContact.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={currentContact.first_name}
                  style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#FFF' }}>
                    {currentContact.first_name} {currentContact.last_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {currentContact.headline || `${currentContact.role === 'alumni' ? 'Alumni Mentor' : 'Apex Student'}`}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onOpenProfileModal(currentContact.id)}
                className="btn btn-outline btn-sm"
              >
                View Profile
              </button>
            </div>

            {/* Message History Bubble List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                  No messages yet. Send a greeting to begin your conversation!
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.sender_id === currentUser?.id;
                  return (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '75%',
                        alignSelf: isMe ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          background: isMe ? 'var(--primary-gradient)' : 'var(--bg-elevated)',
                          color: '#FFF',
                          fontSize: '0.9rem',
                          lineHeight: 1.45,
                          boxShadow: 'var(--shadow-sm)',
                          wordBreak: 'break-word'
                        }}
                      >
                        {m.content}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem', padding: '0 0.35rem' }}>
                        {new Date(m.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Bar */}
            <form onSubmit={handleSend} style={{
              padding: '1rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: '0.75rem',
              background: 'rgba(15, 23, 42, 0.4)'
            }}>
              <input
                type="text"
                placeholder={`Message ${currentContact.first_name}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                style={{ flex: 1, height: '44px' }}
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="btn btn-primary"
                style={{ opacity: inputText.trim() ? 1 : 0.5 }}
              >
                <Send size={16} /> Send
              </button>
            </form>
          </>
        ) : (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-dim)', padding: '2rem' }}>
            <MessageSquare size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              Select a Conversation
            </h3>
            <p style={{ fontSize: '0.85rem', maxWidth: '320px', margin: '0 auto' }}>
              Choose a contact from the left list or message an alumni mentor directly from their profile.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
