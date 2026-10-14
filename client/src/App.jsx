import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ExploreAlumni from './components/ExploreAlumni';
import MentorshipHub from './components/MentorshipHub';
import Networking from './components/Networking';
import Messages from './components/Messages';
import AdminPanel from './components/AdminPanel';
import Profile from './components/Profile';
import SqlConsoleView from './components/SqlConsoleView';
import AlumniTableView from './components/AlumniTableView';
import StudentsTableView from './components/StudentsTableView';
import StudentInsertView from './components/StudentInsertView';
import MentorInsertView from './components/MentorInsertView';
import SessionInsertView from './components/SessionInsertView';
import SkillInsertView from './components/SkillInsertView';
import { 
  RequestMentorshipModal, 
  ScheduleSessionModal, 
  FeedbackModal, 
  UserProfileModal, 
  AuthModal 
} from './components/Modals';
import { api } from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('sql');
  const [loading, setLoading] = useState(true);
  const [customSqlToRun, setCustomSqlToRun] = useState('');

  // Data states
  const [alumniList, setAlumniList] = useState([]);
  const [studentsList, setStudentsList] = useState([]);
  const [filterOptions, setFilterOptions] = useState({});
  const [recommendations, setRecommendations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [connectionsData, setConnectionsData] = useState({ accepted: [], incoming: [], outgoing: [] });
  const [conversations, setConversations] = useState([]);
  const [activeContactId, setActiveContactId] = useState(null);
  const [currentContact, setCurrentContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [masterSkills, setMasterSkills] = useState([]);

  // Admin Data states
  const [adminMetrics, setAdminMetrics] = useState(null);
  const [adminVerifications, setAdminVerifications] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminReports, setAdminReports] = useState([]);

  // Modals
  const [requestModalMentor, setRequestModalMentor] = useState(null);
  const [scheduleModalRequest, setScheduleModalRequest] = useState(null);
  const [feedbackModalSession, setFeedbackModalSession] = useState(null);
  const [profileModalUser, setProfileModalUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Initialize application and authenticate user (defaults to Demo Student: Alex Morgan)
  const initializeAuth = useCallback(async () => {
    try {
      let token = localStorage.getItem('alumlink_token');
      if (!token) {
        // Automatic login as Demo Student Alex Morgan for instant live evaluation
        const demoRes = await api.demoLogin('alex.morgan@student.edu');
        localStorage.setItem('alumlink_token', demoRes.token);
      }

      const meRes = await api.getMe();
      setCurrentUser(meRes.user);
    } catch (err) {
      console.warn('Initial session fetch failed. Fallback demo login...', err);
      try {
        const demoRes = await api.demoLogin('alex.morgan@student.edu');
        localStorage.setItem('alumlink_token', demoRes.token);
        const meRes = await api.getMe();
        setCurrentUser(meRes.user);
      } catch (e) {
        console.error('Demo fallback failed', e);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all domain data
  const loadPlatformData = useCallback(async () => {
    try {
      const [alumniRes, studentsRes, requestsRes, sessionsRes, connectionsRes, notifsRes, skillsRes] = await Promise.all([
        api.getAlumni(),
        api.getStudents().catch(() => ({ students: [] })),
        api.getRequests().catch(() => ({ requests: [] })),
        api.getSessions().catch(() => ({ sessions: [] })),
        api.getConnections().catch(() => ({ accepted: [], incoming: [], outgoing: [] })),
        api.getNotifications().catch(() => ({ notifications: [], unreadCount: 0 })),
        api.getSkills().catch(() => ({ skills: [] }))
      ]);

      setAlumniList(alumniRes.alumni || []);
      setStudentsList(studentsRes.students || []);
      setFilterOptions(alumniRes.filterOptions || {});
      setRequests(requestsRes.requests || []);
      setSessions(sessionsRes.sessions || []);
      setConnectionsData(connectionsRes);
      setNotifications(notifsRes.notifications || []);
      setUnreadNotificationsCount(notifsRes.unreadCount || 0);
      setMasterSkills(skillsRes.skills || []);

      // If student, load AI recommendations
      if (currentUser?.role === 'student') {
        const recRes = await api.getRecommendations().catch(() => ({ recommendations: [] }));
        setRecommendations(recRes.recommendations || []);
      }

      // If admin, load admin metrics and verifications
      if (currentUser?.role === 'admin') {
        const [mRes, vRes, uRes, rRes] = await Promise.all([
          api.getMetrics().catch(() => ({ metrics: null })),
          api.getVerifications().catch(() => ({ verifications: [] })),
          api.getAdminUsers().catch(() => ({ users: [] })),
          api.getReports().catch(() => ({ reports: [] }))
        ]);
        setAdminMetrics(mRes.metrics);
        setAdminVerifications(vRes.verifications || []);
        setAdminUsers(uRes.users || []);
        setAdminReports(rRes.reports || []);
      }

      // Conversations
      const convRes = await api.getConversations().catch(() => ({ conversations: [] }));
      setConversations(convRes.conversations || []);
      const totalUnreadMsgs = (convRes.conversations || []).reduce((acc, c) => acc + (c.unreadCount || 0), 0);
      setUnreadMessagesCount(totalUnreadMsgs);
    } catch (err) {
      console.error('[Load Platform Data Error]', err);
    }
  }, [currentUser]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (currentUser) {
      loadPlatformData();
    }
  }, [currentUser, loadPlatformData]);

  // Load chat messages when an active contact is selected
  useEffect(() => {
    if (activeContactId && currentUser) {
      api.getMessages(activeContactId)
        .then(res => {
          setCurrentContact(res.contact);
          setMessages(res.messages || []);
        })
        .catch(err => console.error('Failed to load messages', err));
    }
  }, [activeContactId, currentUser]);

  // 1-Click Persona Switcher
  const handleSwitchDemo = async (email) => {
    try {
      setLoading(true);
      const res = await api.demoLogin(email);
      localStorage.setItem('alumlink_token', res.token);
      const meRes = await api.getMe();
      setCurrentUser(meRes.user);

      // Default redirect based on role
      if (meRes.user.role === 'admin') {
        setActiveTab('admin');
      } else {
        setActiveTab('dashboard');
      }
    } catch (err) {
      alert('Failed to switch persona.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('alumlink_token');
    setCurrentUser(null);
    setAuthModalOpen(true);
  };

  const handleSearchAlumni = async (params) => {
    try {
      const res = await api.getAlumni(params);
      setAlumniList(res.alumni || []);
      if (res.filterOptions) {
        setFilterOptions(res.filterOptions);
      }
    } catch (err) {
      console.error('Alumni search error', err);
    }
  };

  const handleOpenProfileModal = async (userId) => {
    try {
      const res = await api.getProfile(userId);
      setProfileModalUser(res.user);
    } catch (err) {
      alert('Failed to load user profile.');
    }
  };

  const handleSendConnectionRequest = async (targetUserId) => {
    try {
      await api.sendConnectionRequest(targetUserId);
      alert('Connection request sent!');
      loadPlatformData();
    } catch (err) {
      alert(err.message || 'Could not send connection request.');
    }
  };

  const handleStartMessage = (contactId) => {
    setActiveContactId(contactId);
    setActiveTab('messages');
  };

  const handleSendMessage = async (recipientId, content) => {
    try {
      const res = await api.sendMessage(recipientId, content);
      setMessages(prev => [...prev, res.data]);
      // Refresh conversations sidebar
      const convRes = await api.getConversations();
      setConversations(convRes.conversations || []);
    } catch (err) {
      alert('Failed to send message.');
    }
  };

  const handleRespondRequest = async (requestId, action, responseNote) => {
    try {
      await api.respondRequest(requestId, action, responseNote);
      alert(`Mentorship request ${action === 'accept' ? 'accepted' : 'declined'}!`);
      loadPlatformData();
    } catch (err) {
      alert(err.message || 'Failed to update request.');
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!confirm('Are you sure you want to cancel this mentorship request?')) return;
    try {
      await api.cancelRequest(requestId);
      alert('Mentorship request cancelled.');
      loadPlatformData();
    } catch (err) {
      alert(err.message || 'Failed to cancel request.');
    }
  };

  const handleScheduleSession = async (sessionData) => {
    await api.scheduleSession(sessionData);
    alert('Session successfully scheduled!');
    loadPlatformData();
  };

  const handleCompleteSession = async (sessionId) => {
    if (!confirm('Mark this mentorship session as completed?')) return;
    try {
      await api.completeSession(sessionId);
      alert('Session marked as completed.');
      loadPlatformData();
    } catch (err) {
      alert('Failed to mark session completed.');
    }
  };

  const handleSubmitFeedback = async (sessionId, feedback) => {
    await api.submitFeedback(sessionId, feedback);
    alert('Thank you for rating your mentorship session!');
    loadPlatformData();
  };

  const handleRespondConnection = async (connectionId, action) => {
    try {
      await api.respondConnection(connectionId, action);
      loadPlatformData();
    } catch (err) {
      alert(err.message || 'Failed to update connection.');
    }
  };

  const handleRemoveConnection = async (connectionId) => {
    try {
      await api.removeConnection(connectionId);
      loadPlatformData();
    } catch (err) {
      alert('Failed to remove connection.');
    }
  };

  const handleVerifyAlumni = async (userId, action, reason) => {
    try {
      await api.verifyAlumni(userId, action, reason);
      alert(`Alumni marked as ${action === 'verify' ? 'verified' : 'rejected'}.`);
      loadPlatformData();
    } catch (err) {
      alert('Failed to update verification status.');
    }
  };

  const handleToggleUserStatus = async (userId, isActive) => {
    try {
      await api.toggleUserStatus(userId, isActive);
      loadPlatformData();
    } catch (err) {
      alert('Failed to update user status.');
    }
  };

  const handleResolveReport = async (reportId, resolution, resolutionNotes) => {
    try {
      await api.resolveReport(reportId, resolution, resolutionNotes);
      loadPlatformData();
    } catch (err) {
      alert('Failed to resolve report.');
    }
  };

  const handleMarkNotificationRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadNotificationsCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      // ignore
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadNotificationsCount(0);
    } catch (e) {
      // ignore
    }
  };

  if (loading && !currentUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: '#FFF' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', animation: 'spin 1.5s linear infinite' }}>🎓</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Connecting to Relational SQL Database...</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: '0.35rem' }}>Loading AlumLink Mentorship Network</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
        unreadNotificationsCount={unreadNotificationsCount}
        unreadMessagesCount={unreadMessagesCount}
        onSwitchDemo={handleSwitchDemo}
        onLogout={handleLogout}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
      />

      {/* Main Content Area */}
      <main className="app-container" style={{ flex: 1 }}>
        {activeTab === 'sql' && (
          <SqlConsoleView initialQuery={customSqlToRun} />
        )}

        {activeTab === 'insert_student' && (
          <StudentInsertView 
            students={studentsList}
            onStudentInserted={() => {
              loadPlatformData();
            }}
          />
        )}

        {activeTab === 'insert_mentor' && (
          <MentorInsertView 
            mentors={alumniList}
            onMentorInserted={() => {
              loadPlatformData();
            }}
          />
        )}

        {activeTab === 'insert_session' && (
          <SessionInsertView 
            students={studentsList}
            mentors={alumniList}
            onSessionInserted={() => {
              loadPlatformData();
            }}
          />
        )}

        {activeTab === 'insert_skill' && (
          <SkillInsertView 
            onSkillInserted={() => {
              loadPlatformData();
            }}
          />
        )}

        {activeTab === 'alumni_table' && (
          <AlumniTableView
            alumniList={alumniList}
            onOpenProfileModal={handleOpenProfileModal}
            onOpenRequestModal={mentor => setRequestModalMentor(mentor)}
            onStartMessage={handleStartMessage}
            onExecuteCustomQuery={(q) => {
              setCustomSqlToRun(q);
              setActiveTab('sql');
            }}
          />
        )}

        {activeTab === 'students_table' && (
          <StudentsTableView
            students={studentsList}
            onOpenProfileModal={handleOpenProfileModal}
            onStartMessage={handleStartMessage}
            onExecuteCustomQuery={(q) => {
              setCustomSqlToRun(q);
              setActiveTab('sql');
            }}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            currentUser={currentUser}
            sessions={sessions}
            requests={requests}
            recommendations={recommendations}
            connections={connectionsData.accepted || []}
            adminMetrics={adminMetrics}
            setActiveTab={setActiveTab}
            onOpenRequestModal={mentor => setRequestModalMentor(mentor)}
            onOpenScheduleModal={req => setScheduleModalRequest(req)}
            onRespondRequest={handleRespondRequest}
            onOpenFeedbackModal={session => setFeedbackModalSession(session)}
            onOpenProfileModal={handleOpenProfileModal}
          />
        )}

        {activeTab === 'explore' && (
          <ExploreAlumni
            alumniList={alumniList}
            filterOptions={filterOptions}
            currentUser={currentUser}
            onSearch={handleSearchAlumni}
            onOpenRequestModal={mentor => setRequestModalMentor(mentor)}
            onOpenProfileModal={handleOpenProfileModal}
            onSendConnectionRequest={handleSendConnectionRequest}
            onStartMessage={handleStartMessage}
          />
        )}

        {activeTab === 'mentorship' && (
          <MentorshipHub
            requests={requests}
            sessions={sessions}
            currentUser={currentUser}
            onRespondRequest={handleRespondRequest}
            onCancelRequest={handleCancelRequest}
            onOpenScheduleModal={req => setScheduleModalRequest(req)}
            onCompleteSession={handleCompleteSession}
            onOpenFeedbackModal={session => setFeedbackModalSession(session)}
            onOpenProfileModal={handleOpenProfileModal}
            onStartMessage={handleStartMessage}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'network' && (
          <Networking
            connectionsData={connectionsData}
            currentUser={currentUser}
            onRespondConnection={handleRespondConnection}
            onRemoveConnection={handleRemoveConnection}
            onStartMessage={handleStartMessage}
            onOpenProfileModal={handleOpenProfileModal}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'messages' && (
          <Messages
            conversations={conversations}
            activeContactId={activeContactId}
            messages={messages}
            currentContact={currentContact}
            currentUser={currentUser}
            onSelectContact={contactId => setActiveContactId(contactId)}
            onSendMessage={handleSendMessage}
            onOpenProfileModal={handleOpenProfileModal}
          />
        )}

        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <AdminPanel
            metrics={adminMetrics}
            verifications={adminVerifications}
            users={adminUsers}
            reports={adminReports}
            onVerifyAlumni={handleVerifyAlumni}
            onToggleUserStatus={handleToggleUserStatus}
            onResolveReport={handleResolveReport}
            onOpenProfileModal={handleOpenProfileModal}
          />
        )}

        {activeTab === 'profile' && (
          <Profile
            currentUser={currentUser}
            masterSkills={masterSkills}
            onUpdateStudentProfile={async (data) => {
              await api.updateStudentProfile(data);
              const meRes = await api.getMe();
              setCurrentUser(meRes.user);
            }}
            onUpdateAlumniProfile={async (data) => {
              await api.updateAlumniProfile(data);
              const meRes = await api.getMe();
              setCurrentUser(meRes.user);
            }}
            onUpdateSkills={async (skills) => {
              await api.updateSkills(skills);
              const meRes = await api.getMe();
              setCurrentUser(meRes.user);
            }}
          />
        )}
      </main>

      {/* Modals Layer */}
      {requestModalMentor && (
        <RequestMentorshipModal
          mentor={requestModalMentor}
          onClose={() => setRequestModalMentor(null)}
          onSubmit={async (data) => {
            await api.createRequest(data);
            alert('Mentorship request successfully submitted!');
            loadPlatformData();
          }}
        />
      )}

      {scheduleModalRequest && (
        <ScheduleSessionModal
          request={scheduleModalRequest}
          onClose={() => setScheduleModalRequest(null)}
          onSubmit={handleScheduleSession}
        />
      )}

      {feedbackModalSession && (
        <FeedbackModal
          session={feedbackModalSession}
          onClose={() => setFeedbackModalSession(null)}
          onSubmit={handleSubmitFeedback}
        />
      )}

      {profileModalUser && (
        <UserProfileModal
          user={profileModalUser}
          currentUserId={currentUser?.id}
          onClose={() => setProfileModalUser(null)}
          onStartMessage={handleStartMessage}
          onSendConnectionRequest={handleSendConnectionRequest}
          onOpenRequestModal={mentor => setRequestModalMentor(mentor)}
        />
      )}

      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          onLogin={async (credentials) => {
            const res = await api.login(credentials);
            localStorage.setItem('alumlink_token', res.token);
            const meRes = await api.getMe();
            setCurrentUser(meRes.user);
          }}
          onRegister={async (data) => {
            const res = await api.register(data);
            localStorage.setItem('alumlink_token', res.token);
            const meRes = await api.getMe();
            setCurrentUser(meRes.user);
          }}
        />
      )}
    </div>
  );
}
