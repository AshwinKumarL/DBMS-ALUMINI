import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Video, 
  Star, 
  MessageSquare, 
  User, 
  Sparkles, 
  PlusCircle, 
  AlertCircle,
  FileText
} from 'lucide-react';

export default function MentorshipHub({ 
  requests = [], 
  sessions = [], 
  currentUser,
  onRespondRequest,
  onCancelRequest,
  onOpenScheduleModal,
  onCompleteSession,
  onOpenFeedbackModal,
  onOpenProfileModal,
  onStartMessage,
  setActiveTab
}) {
  const [activeSubTab, setActiveSubTab] = useState('requests'); // 'requests', 'sessions', 'matching'
  const [requestStatusFilter, setRequestStatusFilter] = useState('all');
  const [sessionFilter, setSessionFilter] = useState('all'); // 'all', 'scheduled', 'completed'

  const isStudent = currentUser?.role === 'student';
  const isAlumni = currentUser?.role === 'alumni';

  const filteredRequests = requests.filter(r => {
    if (requestStatusFilter === 'all') return true;
    return r.status === requestStatusFilter;
  });

  const filteredSessions = sessions.filter(s => {
    if (sessionFilter === 'all') return true;
    return s.status === sessionFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header and Main Tab Switcher */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Calendar size={26} color="#818CF8" />
              Mentorship Hub
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              Track mentorship proposals, host 1-on-1 career guidance sessions, and leave mutual feedback.
            </p>
          </div>

          {isStudent && (
            <button
              onClick={() => setActiveTab('explore')}
              className="btn btn-primary"
            >
              <PlusCircle size={16} />
              New Mentorship Request
            </button>
          )}
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <button
            onClick={() => setActiveSubTab('requests')}
            style={{
              padding: '0.5rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              background: activeSubTab === 'requests' ? 'var(--primary-gradient)' : 'transparent',
              color: activeSubTab === 'requests' ? '#FFF' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            Mentorship Requests ({requests.length})
          </button>
          <button
            onClick={() => setActiveSubTab('sessions')}
            style={{
              padding: '0.5rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              background: activeSubTab === 'sessions' ? 'var(--primary-gradient)' : 'transparent',
              color: activeSubTab === 'sessions' ? '#FFF' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            Sessions ({sessions.length})
          </button>
          <button
            onClick={() => setActiveSubTab('matching')}
            style={{
              padding: '0.5rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              background: activeSubTab === 'matching' ? 'var(--primary-gradient)' : 'transparent',
              color: activeSubTab === 'matching' ? '#FFF' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Sparkles size={15} /> Matchmaking Insights
          </button>
        </div>
      </div>

      {/* TAB 1: MENTORSHIP REQUESTS */}
      {activeSubTab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Status Filter Chips */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['all', 'pending', 'accepted', 'completed', 'declined'].map(st => (
              <button
                key={st}
                onClick={() => setRequestStatusFilter(st)}
                style={{
                  padding: '0.35rem 0.8rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  background: requestStatusFilter === st ? 'rgba(99, 102, 241, 0.25)' : 'var(--bg-elevated)',
                  color: requestStatusFilter === st ? '#A5B4FC' : 'var(--text-muted)',
                  border: requestStatusFilter === st ? '1px solid rgba(99, 102, 241, 0.5)' : '1px solid var(--border-subtle)'
                }}
              >
                {st}
              </button>
            ))}
          </div>

          {filteredRequests.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <FileText size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>No Requests Found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                There are no mentorship requests matching the "{requestStatusFilter}" status.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredRequests.map(req => {
                const partnerName = isStudent ? `${req.alumni_first_name} ${req.alumni_last_name}` : `${req.student_first_name} ${req.student_last_name}`;
                const partnerAvatar = isStudent ? req.alumni_avatar : req.student_avatar;
                const partnerId = isStudent ? req.alumni_id : req.student_id;
                const partnerSub = isStudent 
                  ? `${req.alumni_position} @ ${req.alumni_company}`
                  : `${req.student_degree} • Class of ${req.student_grad_year}`;

                return (
                  <div key={req.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.85rem' }}>
                        <img 
                          src={partnerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} 
                          alt={partnerName}
                          style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFF' }}>
                              {partnerName}
                            </h3>
                            <button
                              onClick={() => onOpenProfileModal(partnerId)}
                              style={{ fontSize: '0.75rem', color: '#818CF8', background: 'none' }}
                            >
                              View Profile
                            </button>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{partnerSub}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.1rem' }}>
                            Submitted {new Date(req.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`badge ${
                          req.status === 'accepted' ? 'badge-verified' :
                          req.status === 'pending' ? 'badge-pending' :
                          req.status === 'completed' ? 'badge-primary' :
                          'badge-rejected'
                        }`}>
                          {req.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Topic & Details Box */}
                    <div style={{ background: 'rgba(0, 0, 0, 0.25)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#E0E7FF', marginBottom: '0.4rem' }}>
                        🎯 Mentorship Topic: {req.topic}
                      </div>

                      {req.goals && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                          <strong>Learning Goals:</strong> {req.goals}
                        </div>
                      )}

                      {req.preferred_schedule && (
                        <div style={{ fontSize: '0.8rem', color: '#93C5FD', marginBottom: '0.5rem' }}>
                          📅 <strong>Preferred Availability:</strong> {req.preferred_schedule}
                        </div>
                      )}

                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        "{req.message}"
                      </div>

                      {req.response_note && (
                        <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.85rem', color: '#34D399' }}>
                          <strong>Mentor Response:</strong> "{req.response_note}"
                        </div>
                      )}
                    </div>

                    {/* Actions Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
                      {/* Message Partner */}
                      <button
                        onClick={() => onStartMessage(partnerId)}
                        className="btn btn-secondary btn-sm"
                      >
                        <MessageSquare size={14} /> Send Message
                      </button>

                      {/* Alumni Actions on Pending Request */}
                      {isAlumni && req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onRespondRequest(req.id, 'accept')}
                            className="btn btn-success btn-sm"
                          >
                            <CheckCircle size={14} /> Accept Request
                          </button>
                          <button
                            onClick={() => {
                              const note = prompt('Optional rejection feedback for student:');
                              onRespondRequest(req.id, 'decline', note);
                            }}
                            className="btn btn-danger btn-sm"
                          >
                            <XCircle size={14} /> Decline
                          </button>
                        </>
                      )}

                      {/* Student Cancel Pending Request */}
                      {isStudent && req.status === 'pending' && (
                        <button
                          onClick={() => onCancelRequest(req.id)}
                          className="btn btn-danger btn-sm"
                        >
                          Cancel Request
                        </button>
                      )}

                      {/* Schedule Meeting if Accepted */}
                      {req.status === 'accepted' && (
                        <button
                          onClick={() => onOpenScheduleModal(req)}
                          className="btn btn-primary btn-sm"
                        >
                          <Calendar size={14} /> Schedule Meeting Session
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MENTORSHIP SESSIONS */}
      {activeSubTab === 'sessions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setSessionFilter('all')}
              style={{
                padding: '0.35rem 0.8rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: sessionFilter === 'all' ? 'rgba(99, 102, 241, 0.25)' : 'var(--bg-elevated)',
                color: sessionFilter === 'all' ? '#A5B4FC' : 'var(--text-muted)'
              }}
            >
              All Sessions
            </button>
            <button
              onClick={() => setSessionFilter('scheduled')}
              style={{
                padding: '0.35rem 0.8rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: sessionFilter === 'scheduled' ? 'rgba(99, 102, 241, 0.25)' : 'var(--bg-elevated)',
                color: sessionFilter === 'scheduled' ? '#A5B4FC' : 'var(--text-muted)'
              }}
            >
              Scheduled / Upcoming
            </button>
            <button
              onClick={() => setSessionFilter('completed')}
              style={{
                padding: '0.35rem 0.8rem',
                borderRadius: '9999px',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: sessionFilter === 'completed' ? 'rgba(99, 102, 241, 0.25)' : 'var(--bg-elevated)',
                color: sessionFilter === 'completed' ? '#A5B4FC' : 'var(--text-muted)'
              }}
            >
              Completed History
            </button>
          </div>

          {filteredSessions.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <Calendar size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>No Sessions Found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                There are no mentorship sessions under this filter.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.25rem' }}>
              {filteredSessions.map(session => {
                const partnerName = isStudent ? `${session.alumni_first_name} ${session.alumni_last_name}` : `${session.student_first_name} ${session.student_last_name}`;
                const partnerAvatar = isStudent ? session.alumni_avatar : session.student_avatar;
                const partnerId = isStudent ? session.alumni_id : session.student_id;

                return (
                  <div key={session.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={partnerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={partnerName}
                            style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#FFF' }}>{partnerName}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                              {isStudent ? session.alumni_position + ' @ ' + session.alumni_company : 'Apex Student'}
                            </div>
                          </div>
                        </div>

                        <span className={`badge ${session.status === 'scheduled' ? 'badge-primary' : 'badge-verified'}`}>
                          {session.status.toUpperCase()}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '1rem', color: '#FFF', marginBottom: '0.5rem' }}>
                        {session.topic}
                      </h4>

                      <div style={{ fontSize: '0.8rem', color: '#A5B4FC', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                        <Clock size={14} />
                        {new Date(session.scheduled_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(session.scheduled_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} ({session.duration_minutes} mins)
                      </div>

                      {session.agenda && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.75rem', borderRadius: '6px', marginBottom: '0.75rem' }}>
                          <strong>Agenda:</strong> {session.agenda}
                        </div>
                      )}

                      {/* If completed and feedback exists */}
                      {session.feedback_rating && (
                        <div style={{ background: 'rgba(251, 191, 36, 0.08)', border: '1px solid rgba(251, 191, 36, 0.25)', borderRadius: '6px', padding: '0.6rem 0.75rem', marginBottom: '0.75rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#FBBF24', fontSize: '0.85rem', fontWeight: 700 }}>
                            <Star size={14} fill="#FBBF24" />
                            {session.feedback_rating} / 5 Stars
                          </div>
                          {session.feedback_text && (
                            <p style={{ fontSize: '0.75rem', color: '#E2E8F0', marginTop: '0.25rem', fontStyle: 'italic' }}>
                              "{session.feedback_text}"
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Session Actions Bottom */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                      {session.status === 'scheduled' && (
                        <>
                          <a
                            href={session.meeting_link || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-primary btn-sm"
                            style={{ flex: 1, background: 'linear-gradient(135deg, #10B981, #059669)' }}
                          >
                            <Video size={14} /> Join Meeting
                          </a>

                          <button
                            onClick={() => onCompleteSession(session.id)}
                            className="btn btn-outline btn-sm"
                            title="Mark as completed after meeting finishes"
                          >
                            Mark Completed
                          </button>
                        </>
                      )}

                      {session.status === 'completed' && isStudent && !session.feedback_rating && (
                        <button
                          onClick={() => onOpenFeedbackModal(session)}
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1, background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
                        >
                          <Star size={14} /> Leave Rating & Feedback
                        </button>
                      )}

                      <button
                        onClick={() => onStartMessage(partnerId)}
                        className="btn btn-secondary btn-sm"
                      >
                        <MessageSquare size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MATCHMAKING INSIGHTS */}
      {activeSubTab === 'matching' && (
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <Sparkles size={24} color="#818CF8" />
            <h2 style={{ fontSize: '1.4rem' }}>How Mentorship Matching Works</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem', maxWidth: '750px' }}>
            AlumLink utilizes a normalized relational SQL database query model combined with an intelligent relevance scoring algorithm. When calculating your mentor compatibility index:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: '#818CF8', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.4rem' }}>
                1. Industry Alignment
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                Matches your target industries with alumni employer domains (e.g. Technology & Cloud, FinTech, AI).
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: '#34D399', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.4rem' }}>
                2. Technical Skills Matrix
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                Cross-references user skills junction table (<code style={{ color: '#A5B4FC' }}>user_skills</code>) to identify technical overlap and mentorship areas.
              </p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ color: '#FBBF24', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.4rem' }}>
                3. Career Goals & Topics
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                Parses student career interests with alumni mentorship topics (e.g. Mock Interviews, Resume Teardowns).
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('explore')}
            className="btn btn-primary"
          >
            Explore Matched Alumni
          </button>
        </div>
      )}
    </div>
  );
}
