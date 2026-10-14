import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  Plus, 
  Search,
  Video,
  Clock,
  User,
  GraduationCap,
  Briefcase
} from 'lucide-react';

export default function SessionInsertView({ onSessionInserted, students = [], mentors = [] }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    alumniId: '',
    topic: '',
    scheduledAt: '',
    durationMinutes: 45,
    locationType: 'virtual',
    meetingLink: '',
    status: 'scheduled',
    notes: ''
  });

  const [executing, setExecuting] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await api.getAllSessions();
      setSessions(res.sessions || []);
    } catch (err) {
      console.error('Failed to load all sessions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Pre-fill default student & mentor if available
  useEffect(() => {
    if (students.length > 0 && !formData.studentId) {
      setFormData(prev => ({ ...prev, studentId: students[0].user_id }));
    }
    if (mentors.length > 0 && !formData.alumniId) {
      setFormData(prev => ({ ...prev, alumniId: mentors[0].id || mentors[0].user_id }));
    }
    if (!formData.scheduledAt) {
      const tomorrow = new Date(Date.now() + 86400000);
      const formatted = tomorrow.toISOString().slice(0, 16);
      setFormData(prev => ({ ...prev, scheduledAt: formatted }));
    }
  }, [students, mentors]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentId || !formData.alumniId || !formData.topic.trim()) {
      alert('Please select a Student, a Mentor, and provide a Topic.');
      return;
    }

    setExecuting(true);
    setResultMessage(null);
    setErrorMessage(null);

    try {
      const res = await api.insertSession(formData);
      setResultMessage(res.message);
      // Reset form topic & notes
      setFormData(prev => ({
        ...prev,
        topic: '',
        notes: '',
        meetingLink: ''
      }));

      fetchSessions();
      if (onSessionInserted) onSessionInserted();
    } catch (err) {
      setErrorMessage(err.data?.error || err.message || 'Failed to insert session into database.');
    } finally {
      setExecuting(false);
    }
  };

  const handleDelete = async (sessionId, topic) => {
    if (!confirm(`Are you sure you want to delete Session #${sessionId} ("${topic}") from the database?`)) return;
    try {
      const res = await api.deleteSession(sessionId);
      alert(res.message);
      fetchSessions();
      if (onSessionInserted) onSessionInserted();
    } catch (err) {
      alert(err.message || 'Failed to delete session.');
    }
  };

  const filteredSessions = sessions.filter(s => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (s.topic && s.topic.toLowerCase().includes(term)) ||
      (s.student_name && s.student_name.toLowerCase().includes(term)) ||
      (s.alumni_name && s.alumni_name.toLowerCase().includes(term)) ||
      (s.status && s.status.toLowerCase().includes(term)) ||
      (s.location_type && s.location_type.toLowerCase().includes(term))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1300px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Calendar size={26} color="#38BDF8" />
            Sessions Insert & Table Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Insert and manage mentorship session relational records in <code>mentorship_sessions</code>.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="badge badge-primary" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
            {sessions.length} Total Sessions
          </span>
        </div>
      </div>

      {/* Insert Form Card */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#FFF', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={20} color="#38BDF8" /> New Mentorship Session Entry Form
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Student (Foreign Key: student_id) *</label>
              <select
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                required
                style={{ width: '100%', height: '42px' }}
              >
                <option value="">-- Select Student --</option>
                {students.map(s => (
                  <option key={s.user_id} value={s.user_id}>
                    #{s.user_id}: {s.first_name} {s.last_name} ({s.field_of_study})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Mentor / Alumni (Foreign Key: alumni_id) *</label>
              <select
                name="alumniId"
                value={formData.alumniId}
                onChange={handleInputChange}
                required
                style={{ width: '100%', height: '42px' }}
              >
                <option value="">-- Select Mentor --</option>
                {mentors.map(m => (
                  <option key={m.id || m.user_id} value={m.id || m.user_id}>
                    #{m.id || m.user_id}: {m.first_name} {m.last_name} ({m.current_company || 'Alumni'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Session Topic *</label>
              <input
                type="text"
                name="topic"
                placeholder="e.g. Distributed Systems Architecture Review"
                value={formData.topic}
                onChange={handleInputChange}
                required
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Scheduled Date & Time *</label>
              <input
                type="datetime-local"
                name="scheduledAt"
                value={formData.scheduledAt}
                onChange={handleInputChange}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Duration (Minutes)</label>
              <select
                name="durationMinutes"
                value={formData.durationMinutes}
                onChange={handleInputChange}
                style={{ width: '100%', height: '42px' }}
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Location / Mode</label>
              <select
                name="locationType"
                value={formData.locationType}
                onChange={handleInputChange}
                style={{ width: '100%', height: '42px' }}
              >
                <option value="virtual">Virtual (Video Meet)</option>
                <option value="in-person">In-Person (Campus Hub)</option>
                <option value="phone">Phone Call</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Session Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                style={{ width: '100%', height: '42px' }}
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Meeting Link / Venue Details</label>
              <input
                type="text"
                name="meetingLink"
                placeholder="e.g. https://meet.google.com/abc-xyz-123 or Lab Hall 204"
                value={formData.meetingLink}
                onChange={handleInputChange}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Agenda & Notes</label>
              <input
                type="text"
                name="notes"
                placeholder="e.g. Discuss microservice failover & rate limiters"
                value={formData.notes}
                onChange={handleInputChange}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              type="submit"
              disabled={executing}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.75rem', background: 'linear-gradient(135deg, #0284C7, #0369A1)' }}
            >
              <Plus size={16} /> {executing ? 'Inserting Session...' : 'Insert Session Record'}
            </button>
          </div>
        </form>

        {resultMessage && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34D399', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={16} /> {resultMessage}
          </div>
        )}

        {errorMessage && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#F87171', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} /> {errorMessage}
          </div>
        )}
      </div>

      {/* Existing Sessions Data Table */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} color="#38BDF8" /> Mentorship Session Records
            </h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
              Current rows in <code>mentorship_sessions</code> table
            </p>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '2rem', height: '36px', fontSize: '0.85rem' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.02)' }}>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>ID</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Topic</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Student</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Mentor / Company</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Scheduled At</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Duration</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                    No session records found matching "{searchTerm}".
                  </td>
                </tr>
              ) : (
                filteredSessions.map(s => (
                  <tr 
                    key={s.id}
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-dim)' }}>#{s.id}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#FFF' }}>
                      {s.topic}
                      {s.meeting_link && (
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#38BDF8', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.meeting_link}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#CBD5E1' }}>
                      <span style={{ fontWeight: 600 }}>{s.student_name || `Student #${s.student_id}`}</span>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)' }}>{s.student_email}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#CBD5E1' }}>
                      <span style={{ fontWeight: 600 }}>{s.alumni_name || `Mentor #${s.alumni_id}`}</span>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#93C5FD' }}>@{s.alumni_company || 'Alumni'}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#93C5FD' }}>{s.scheduled_at}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#34D399', fontWeight: 600 }}>
                      {s.duration_minutes} min
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`badge ${s.status === 'completed' ? 'badge-success' : s.status === 'scheduled' ? 'badge-primary' : 'badge-danger'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(s.id, s.topic)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#F87171', borderColor: 'rgba(239, 68, 68, 0.3)', padding: '0.3rem 0.6rem' }}
                        title="Delete Session from Database"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
