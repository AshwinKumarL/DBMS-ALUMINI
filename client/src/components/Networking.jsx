import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Search, 
  MessageSquare, 
  UserMinus, 
  CheckCircle, 
  XCircle,
  ExternalLink
} from 'lucide-react';

export default function Networking({ 
  connectionsData = { accepted: [], incoming: [], outgoing: [] },
  currentUser,
  onRespondConnection,
  onRemoveConnection,
  onStartMessage,
  onOpenProfileModal,
  setActiveTab
}) {
  const [activeSubTab, setActiveSubTab] = useState('accepted'); // 'accepted', 'incoming', 'outgoing'
  const [searchTerm, setSearchTerm] = useState('');

  const { accepted = [], incoming = [], outgoing = [] } = connectionsData;

  const filteredAccepted = accepted.filter(c => {
    if (!searchTerm.trim()) return true;
    const full = `${c.first_name} ${c.last_name} ${c.organization || ''} ${c.position_or_degree || ''}`.toLowerCase();
    return full.includes(searchTerm.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Sub-tabs */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Users size={26} color="#818CF8" />
              Professional Network
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              Connect with alumni, industry peers, and fellow students to exchange opportunities and advice.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('explore')}
            className="btn btn-primary"
          >
            Find New People
          </button>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <button
            onClick={() => setActiveSubTab('accepted')}
            style={{
              padding: '0.5rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              background: activeSubTab === 'accepted' ? 'var(--primary-gradient)' : 'transparent',
              color: activeSubTab === 'accepted' ? '#FFF' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            Connected Network ({accepted.length})
          </button>
          <button
            onClick={() => setActiveSubTab('incoming')}
            style={{
              padding: '0.5rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              background: activeSubTab === 'incoming' ? 'var(--primary-gradient)' : 'transparent',
              color: activeSubTab === 'incoming' ? '#FFF' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.9rem',
              position: 'relative'
            }}
          >
            Received Invites ({incoming.length})
            {incoming.length > 0 && (
              <span style={{
                marginLeft: '0.4rem',
                padding: '0.1rem 0.45rem',
                borderRadius: '9999px',
                background: '#F59E0B',
                color: '#000',
                fontSize: '0.7rem',
                fontWeight: 800
              }}>
                {incoming.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('outgoing')}
            style={{
              padding: '0.5rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              background: activeSubTab === 'outgoing' ? 'var(--primary-gradient)' : 'transparent',
              color: activeSubTab === 'outgoing' ? '#FFF' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            Sent Requests ({outgoing.length})
          </button>
        </div>
      </div>

      {/* TAB 1: ACCEPTED CONNECTIONS */}
      {activeSubTab === 'accepted' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search 
              size={18} 
              color="var(--text-dim)" 
              style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} 
            />
            <input
              type="text"
              placeholder="Search your connected contacts by name, organization, or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.75rem', height: '44px' }}
            />
          </div>

          {filteredAccepted.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Users size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>No Connections Yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Start expanding your professional network by sending connection requests from the Explore tab!
              </p>
              <button 
                onClick={() => setActiveTab('explore')} 
                className="btn btn-primary btn-sm"
                style={{ marginTop: '1rem' }}
              >
                Browse Alumni Directory
              </button>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.25rem'
            }}>
              {filteredAccepted.map(contact => (
                <div 
                  key={contact.connection_id}
                  className="glass-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.85rem' }}>
                    <img
                      src={contact.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={contact.first_name}
                      style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#FFF' }}>
                        {contact.first_name} {contact.last_name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#A5B4FC' }}>
                        {contact.position_or_degree || 'Apex Member'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {contact.organization || (contact.role === 'alumni' ? 'Alumni' : 'Apex University')}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                    <button
                      onClick={() => onStartMessage(contact.user_id)}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                    >
                      <MessageSquare size={14} /> Message
                    </button>
                    <button
                      onClick={() => onOpenProfileModal(contact.user_id)}
                      className="btn btn-secondary btn-sm"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove connection with ${contact.first_name}?`)) {
                          onRemoveConnection(contact.connection_id);
                        }
                      }}
                      className="btn btn-outline btn-sm"
                      title="Remove Connection"
                    >
                      <UserMinus size={14} color="#EF4444" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INCOMING INVITATIONS */}
      {activeSubTab === 'incoming' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {incoming.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <UserCheck size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>No Pending Invitations</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                You have addressed all incoming connection requests.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
              {incoming.map(req => (
                <div key={req.connection_id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.85rem' }}>
                    <img
                      src={req.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={req.first_name}
                      style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#FFF' }}>
                        {req.first_name} {req.last_name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#A5B4FC' }}>
                        {req.position_or_degree}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {req.organization}
                      </div>
                    </div>
                  </div>

                  {req.note && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', background: 'rgba(0,0,0,0.2)', padding: '0.6rem 0.75rem', borderRadius: '6px', fontStyle: 'italic' }}>
                      "{req.note}"
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => onRespondConnection(req.connection_id, 'accept')}
                      className="btn btn-success btn-sm"
                      style={{ flex: 1 }}
                    >
                      <CheckCircle size={14} /> Accept
                    </button>
                    <button
                      onClick={() => onRespondConnection(req.connection_id, 'decline')}
                      className="btn btn-danger btn-sm"
                      style={{ flex: 1 }}
                    >
                      <XCircle size={14} /> Ignore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: OUTGOING REQUESTS */}
      {activeSubTab === 'outgoing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {outgoing.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <Clock size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>No Sent Requests Pending</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                You don't have any sent invitations waiting for response.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {outgoing.map(req => (
                <div key={req.connection_id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={req.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={req.first_name}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFF' }}>
                          {req.first_name} {req.last_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          Sent {new Date(req.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <span className="badge badge-pending">PENDING</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                    <button
                      onClick={() => onRemoveConnection(req.connection_id)}
                      className="btn btn-outline btn-sm"
                    >
                      Withdraw Invitation
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
