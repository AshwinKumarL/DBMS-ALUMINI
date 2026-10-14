import React, { useState } from 'react';
import { 
  Calendar, 
  ShieldCheck, 
  Bell, 
  User, 
  LogOut, 
  ChevronDown, 
  Sparkles,
  Check,
  Terminal,
  Table,
  GraduationCap,
  UserPlus,
  Briefcase,
  Database,
  Layers
} from 'lucide-react';

export default function Navbar({ 
  currentUser, 
  activeTab, 
  setActiveTab, 
  notifications, 
  unreadNotificationsCount, 
  unreadMessagesCount,
  onSwitchDemo, 
  onLogout,
  onOpenAuthModal,
  onMarkNotificationRead,
  onMarkAllNotificationsRead
}) {
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const demoPersonas = [
    {
      name: 'Dr. Arthur Pendleton',
      role: 'admin',
      label: 'DB Administrator (Full Access)',
      email: 'admin@alumni.edu',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      tag: 'System Admin'
    },
    {
      name: 'Sarah Chen',
      role: 'alumni',
      label: 'Alumni / Mentor Record (Google SWE)',
      email: 'sarah.chen@google.com',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
      tag: 'Verified Mentor'
    },
    {
      name: 'Alex Morgan',
      role: 'student',
      label: 'Student Record (Senior CS)',
      email: 'alex.morgan@student.edu',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
      tag: 'Student User'
    }
  ];

  const navItems = [
    { id: 'sql', label: 'SQL Console', icon: Terminal, highlight: true },
    { id: 'insert_student', label: 'Students Table', icon: GraduationCap },
    { id: 'insert_mentor', label: 'Mentors Table', icon: Briefcase },
    { id: 'insert_session', label: 'Sessions Table', icon: Calendar },
    { id: 'insert_skill', label: 'Skills Master Table', icon: Layers },
    ...(currentUser?.role === 'admin' ? [{ id: 'admin', label: 'Admin DB Panel', icon: ShieldCheck }] : [])
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(11, 15, 25, 0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0.65rem 1.5rem',
      marginBottom: '1.25rem'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        {/* Brand / Logo */}
        <div 
          onClick={() => setActiveTab('sql')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Database size={22} color="#FFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFF' }}>
                Alumni<span style={{ color: '#818CF8' }}>DBMS</span>
              </span>
              <span style={{
                fontSize: '0.62rem',
                textTransform: 'uppercase',
                padding: '0.12rem 0.45rem',
                borderRadius: '4px',
                background: 'rgba(99, 102, 241, 0.25)',
                color: '#A5B4FC',
                fontWeight: 700,
                letterSpacing: '0.05em'
              }}>
                SQL Relational Engine
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
              Database Management System & Relational Queries
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.55rem 0.95rem',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: isActive ? '#A5B4FC' : 'var(--text-muted)',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                <Icon size={17} color={isActive ? '#818CF8' : 'currentColor'} />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span style={{
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px',
                    background: '#EF4444',
                    color: '#FFF',
                    fontSize: '0.7rem',
                    fontWeight: 700
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Quick Switcher, Notifications, User Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Quick Demo Persona Switcher */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'rgba(30, 41, 59, 0.8)',
                borderColor: 'rgba(99, 102, 241, 0.3)'
              }}
              title="Instantly switch roles to test Student, Alumni, and Admin viewpoints"
            >
              <Sparkles size={15} color="#818CF8" />
              <span style={{ fontSize: '0.8rem', color: '#E2E8F0' }}>Demo Role:</span>
              <span style={{ 
                fontWeight: 700, 
                color: currentUser?.role === 'admin' ? '#FBBF24' : currentUser?.role === 'alumni' ? '#34D399' : '#93C5FD' 
              }}>
                {currentUser?.first_name || 'Switch'}
              </span>
              <ChevronDown size={14} color="#94A3B8" />
            </button>

            {showPersonaMenu && (
              <div 
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '320px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.75rem',
                  zIndex: 200,
                  animation: 'fadeIn 0.15s ease'
                }}
              >
                <div style={{ 
                  padding: '0.4rem 0.5rem 0.6rem', 
                  borderBottom: '1px solid var(--border-subtle)',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFF' }}>Switch Persona (1-Click)</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Test how the platform behaves for each role</div>
                </div>

                {demoPersonas.map((p) => {
                  const isCurrent = currentUser?.email === p.email;
                  return (
                    <div
                      key={p.email}
                      onClick={() => {
                        onSwitchDemo(p.email);
                        setShowPersonaMenu(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.55rem',
                        borderRadius: 'var(--radius-md)',
                        background: isCurrent ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isCurrent) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isCurrent) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <img 
                        src={p.avatar} 
                        alt={p.name} 
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFF' }}>{p.name}</span>
                          {isCurrent && <Check size={14} color="#818CF8" />}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                cursor: 'pointer'
              }}
              title="Notifications"
            >
              <Bell size={18} />
              {unreadNotificationsCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#EF4444',
                  color: '#FFF',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)'
                }}>
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '340px',
                  maxHeight: '420px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '0.75rem',
                  zIndex: 200,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.3rem 0.5rem 0.6rem',
                  borderBottom: '1px solid var(--border-subtle)'
                }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Notifications</span>
                  {unreadNotificationsCount > 0 && (
                    <button
                      onClick={onMarkAllNotificationsRead}
                      style={{ fontSize: '0.7rem', color: '#818CF8', background: 'none' }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div style={{ overflowY: 'auto', maxHeight: '320px', marginTop: '0.5rem' }}>
                  {notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (!n.is_read) onMarkNotificationRead(n.id);
                          if (n.link) {
                            const tab = n.link.replace('/', '');
                            if (tab) setActiveTab(tab);
                          }
                          setShowNotifMenu(false);
                        }}
                        style={{
                          padding: '0.6rem',
                          borderRadius: 'var(--radius-md)',
                          background: n.is_read ? 'transparent' : 'rgba(99, 102, 241, 0.08)',
                          marginBottom: '0.35rem',
                          cursor: 'pointer',
                          transition: 'background 0.15s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: n.is_read ? 'var(--text-main)' : '#FFF' }}>
                            {n.title}
                          </span>
                          {!n.is_read && (
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366F1' }} />
                          )}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Current User Pill */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <img
                src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={currentUser.first_name}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid rgba(99, 102, 241, 0.4)',
                  cursor: 'pointer'
                }}
                onClick={() => setActiveTab('profile')}
              />
              <div style={{ display: 'none', minWidth: 0, '@media (minWidth: 900px)': { display: 'block' } }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFF' }}>
                  {currentUser.first_name} {currentUser.last_name}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'capitalize' }}>
                  {currentUser.role}
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="btn btn-primary btn-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
