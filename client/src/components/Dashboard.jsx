import React from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  Award, 
  CheckCircle, 
  ArrowRight, 
  Video, 
  Star, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle,
  MessageSquare,
  TrendingUp,
  FileText
} from 'lucide-react';

export default function Dashboard({ 
  currentUser, 
  sessions = [], 
  requests = [], 
  recommendations = [], 
  connections = [], 
  adminMetrics = null,
  setActiveTab,
  onOpenRequestModal,
  onOpenScheduleModal,
  onRespondRequest,
  onOpenFeedbackModal,
  onOpenProfileModal
}) {
  const isStudent = currentUser?.role === 'student';
  const isAlumni = currentUser?.role === 'alumni';
  const isAdmin = currentUser?.role === 'admin';

  // Compute metrics
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const acceptedRequests = requests.filter(r => r.status === 'accepted');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Welcome Banner */}
      <div 
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem 2.5rem',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '680px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <span className={`badge ${isAlumni ? 'badge-verified' : isAdmin ? 'badge-pending' : 'badge-primary'}`}>
                {isAlumni ? (
                  currentUser?.verificationStatus === 'verified' ? '🎓 Verified Alumni Mentor' : '⏳ Pending Verification'
                ) : isAdmin ? (
                  '🛡️ Administrator'
                ) : (
                  '📚 Current Student'
                )}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>•</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Apex University Alumni Network
              </span>
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.6rem', color: '#FFF' }}>
              Welcome back, {currentUser?.first_name}!
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              {isStudent && "Connect with industry leaders from Google, Stripe, Goldman Sachs, and more. Explore recommended mentors, schedule 1-on-1 mock interviews, and grow your professional network."}
              {isAlumni && "Empower the next generation of Apex scholars. Review student mentorship requests, host 1-on-1 guidance sessions, and stay connected with our global alumni network."}
              {isAdmin && "Central command center for alumni verification, user access control, mentorship session oversight, and community health analytics."}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {isStudent && (
              <>
                <button 
                  onClick={() => setActiveTab('explore')}
                  className="btn btn-primary"
                >
                  <Sparkles size={16} />
                  Find a Mentor
                </button>
                <button 
                  onClick={() => setActiveTab('mentorship')}
                  className="btn btn-secondary"
                >
                  <Calendar size={16} />
                  My Mentorships
                </button>
              </>
            )}
            {isAlumni && (
              <>
                <button 
                  onClick={() => setActiveTab('mentorship')}
                  className="btn btn-primary"
                >
                  <Calendar size={16} />
                  Manage Requests ({pendingRequests.length})
                </button>
                <button 
                  onClick={() => setActiveTab('network')}
                  className="btn btn-secondary"
                >
                  <Users size={16} />
                  View Network
                </button>
              </>
            )}
            {isAdmin && (
              <>
                <button 
                  onClick={() => setActiveTab('admin')}
                  className="btn btn-primary"
                >
                  <ShieldCheck size={16} />
                  Open Admin Console
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        {isStudent && (
          <>
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8' }}>
                <Calendar size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF' }}>{upcomingSessions.length}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Upcoming Sessions</div>
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
                <CheckCircle size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF' }}>{acceptedRequests.length}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Mentors</div>
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24' }}>
                <Clock size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF' }}>{pendingRequests.length}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pending Requests</div>
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(139, 92, 246, 0.15)', color: '#C4B5FD' }}>
                <Users size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF' }}>{connections.length}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Professional Network</div>
              </div>
            </div>
          </>
        )}

        {isAlumni && (
          <>
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24' }}>
                <Clock size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF' }}>{pendingRequests.length}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Requests Awaiting Reply</div>
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8' }}>
                <Calendar size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF' }}>{upcomingSessions.length}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Scheduled Sessions</div>
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
                <Award size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF' }}>{completedSessions.length}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sessions Completed</div>
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(251, 191, 36, 0.15)', color: '#FBBF24' }}>
                <Star size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF' }}>5.0 ⭐</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mentorship Rating</div>
              </div>
            </div>
          </>
        )}

        {isAdmin && adminMetrics && (
          <>
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(99, 102, 241, 0.15)', color: '#818CF8' }}>
                <Users size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF' }}>{adminMetrics.totalUsers}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Platform Users</div>
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', color: '#34D399' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF' }}>{adminMetrics.verificationRate}%</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Alumni Verified Rate</div>
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24' }}>
                <AlertCircle size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF' }}>{adminMetrics.pendingAlumniCount}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verifications Pending</div>
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(139, 92, 246, 0.15)', color: '#C4B5FD' }}>
                <TrendingUp size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF' }}>{adminMetrics.totalSessions}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sessions Conducted</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Grid: Upcoming Sessions & Pending Requests */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Upcoming Sessions Box */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Video size={18} color="#818CF8" />
              <h3 style={{ fontSize: '1.15rem' }}>Upcoming Mentorship Sessions</h3>
            </div>
            <button 
              onClick={() => setActiveTab('mentorship')} 
              style={{ fontSize: '0.8rem', color: '#818CF8', background: 'none' }}
            >
              View all
            </button>
          </div>

          {upcomingSessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-dim)' }}>
              <Calendar size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No upcoming sessions scheduled right now.</p>
              {isStudent && (
                <button 
                  onClick={() => setActiveTab('explore')} 
                  className="btn btn-outline btn-sm"
                  style={{ marginTop: '1rem' }}
                >
                  Browse Alumni Mentors
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {upcomingSessions.slice(0, 3).map(session => {
                const partnerName = isStudent ? `${session.alumni_first_name} ${session.alumni_last_name}` : `${session.student_first_name} ${session.student_last_name}`;
                const partnerAvatar = isStudent ? session.alumni_avatar : session.student_avatar;
                const partnerRole = isStudent ? session.alumni_position + ' @ ' + session.alumni_company : 'CS Student';

                return (
                  <div 
                    key={session.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img 
                          src={partnerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} 
                          alt={partnerName}
                          style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#FFF' }}>{partnerName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{partnerRole}</div>
                        </div>
                      </div>
                      <span className="badge badge-primary">
                        <Clock size={12} />
                        {new Date(session.scheduled_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {new Date(session.scheduled_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>
                      📌 {session.topic}
                    </div>

                    {session.agenda && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                        <strong>Agenda:</strong> {session.agenda.substring(0, 100)}...
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
                      <a 
                        href={session.meeting_link || '#'} 
                        target="_blank" 
                        rel="noreferrer"
                        className="btn btn-primary btn-sm"
                        style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
                      >
                        <Video size={14} />
                        Join Google Meet / Zoom
                      </a>

                      <button 
                        onClick={() => setActiveTab('mentorship')}
                        className="btn btn-outline btn-sm"
                      >
                        Session Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Requests & Approvals Box */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="#FBBF24" />
              <h3 style={{ fontSize: '1.15rem' }}>
                {isAlumni ? 'Pending Mentorship Requests' : 'My Requests Status'}
              </h3>
            </div>
            <button 
              onClick={() => setActiveTab('mentorship')} 
              style={{ fontSize: '0.8rem', color: '#818CF8', background: 'none' }}
            >
              View all
            </button>
          </div>

          {requests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-dim)' }}>
              <FileText size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No mentorship requests active right now.</p>
              {isStudent && (
                <button 
                  onClick={() => setActiveTab('explore')} 
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '1rem' }}
                >
                  Send a Request
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {requests.slice(0, 3).map(req => {
                const partnerName = isStudent ? `${req.alumni_first_name} ${req.alumni_last_name}` : `${req.student_first_name} ${req.student_last_name}`;
                const partnerAvatar = isStudent ? req.alumni_avatar : req.student_avatar;
                const partnerDetail = isStudent ? req.alumni_position + ' @ ' + req.alumni_company : req.student_field_of_study;

                return (
                  <div 
                    key={req.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.6rem'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <img 
                          src={partnerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} 
                          alt={partnerName}
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#FFF' }}>{partnerName}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{partnerDetail}</div>
                        </div>
                      </div>

                      <span className={`badge ${
                        req.status === 'accepted' ? 'badge-verified' :
                        req.status === 'pending' ? 'badge-pending' :
                        'badge-rejected'
                      }`}>
                        {req.status.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600 }}>
                      {req.topic}
                    </div>

                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      "{req.message?.substring(0, 110)}..."
                    </p>

                    {isAlumni && req.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <button
                          onClick={() => onRespondRequest(req.id, 'accept')}
                          className="btn btn-success btn-sm"
                          style={{ flex: 1 }}
                        >
                          <CheckCircle size={14} /> Accept Request
                        </button>
                        <button
                          onClick={() => onRespondRequest(req.id, 'decline')}
                          className="btn btn-danger btn-sm"
                        >
                          Decline
                        </button>
                      </div>
                    )}

                    {isStudent && req.status === 'accepted' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                        <button
                          onClick={() => onOpenScheduleModal(req)}
                          className="btn btn-primary btn-sm"
                        >
                          <Calendar size={14} /> Schedule Meeting
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recommended Mentors Carousel / Grid (for Students) */}
      {isStudent && recommendations.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sparkles size={20} color="#818CF8" />
              <h2 style={{ fontSize: '1.35rem' }}>Recommended Mentors for You</h2>
              <span className="badge badge-match">Curated by AI Match Index</span>
            </div>
            <button 
              onClick={() => setActiveTab('explore')}
              className="btn btn-outline btn-sm"
            >
              Browse All Mentors <ArrowRight size={14} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.25rem'
          }}>
            {recommendations.slice(0, 3).map(mentor => (
              <div 
                key={mentor.userId} 
                className="glass-card" 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between',
                  gap: '1rem',
                  position: 'relative'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <img
                        src={mentor.avatarUrl}
                        alt={mentor.firstName}
                        style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#FFF' }}>
                            {mentor.firstName} {mentor.lastName}
                          </span>
                          {mentor.verificationStatus === 'verified' && (
                            <CheckCircle size={15} color="#34D399" />
                          )}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#A5B4FC', fontWeight: 500 }}>
                          {mentor.currentPosition}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          {mentor.currentCompany} • Class of {mentor.graduationYear}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span className="badge badge-match" style={{ fontWeight: 800 }}>
                        {mentor.matchScore}% Match
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                    {mentor.bio?.substring(0, 120)}...
                  </p>

                  {/* Skills pills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
                    {mentor.skills?.slice(0, 3).map(s => (
                      <span key={s.id} style={{
                        fontSize: '0.7rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: 'var(--text-muted)'
                      }}>
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                  <button
                    onClick={() => onOpenRequestModal(mentor)}
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                  >
                    Request Mentorship
                  </button>
                  <button
                    onClick={() => onOpenProfileModal(mentor.userId)}
                    className="btn btn-secondary btn-sm"
                  >
                    Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
