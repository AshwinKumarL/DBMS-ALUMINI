import React, { useState } from 'react';
import { 
  X, 
  Star, 
  Calendar, 
  Clock, 
  Video, 
  Send, 
  CheckCircle, 
  User, 
  Briefcase, 
  GraduationCap, 
  ExternalLink,
  Lock,
  Mail,
  UserCheck
} from 'lucide-react';

// 1. Request Mentorship Modal
export function RequestMentorshipModal({ mentor, onClose, onSubmit }) {
  const [topic, setTopic] = useState('');
  const [goals, setGoals] = useState('');
  const [preferredSchedule, setPreferredSchedule] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic || !message) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        alumniId: mentor.userId,
        topic,
        goals,
        preferredSchedule,
        message
      });
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to submit mentorship request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', color: '#FFF' }}>Request Mentorship</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Propose a mentorship engagement with {mentor.firstName} {mentor.lastName}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>
              Mentorship Topic / Focus Area *
            </label>
            <input
              type="text"
              placeholder="e.g. System Design Mock Interview, Resume Critique, Career Transition"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>
              Specific Learning Goals
            </label>
            <input
              type="text"
              placeholder="e.g. Preparing for upcoming technical interview; understanding cloud infra"
              value={goals}
              onChange={e => setGoals(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>
              Preferred Schedule / Times
            </label>
            <input
              type="text"
              placeholder="e.g. Tuesday or Thursday evenings (EST), weekends"
              value={preferredSchedule}
              onChange={e => setPreferredSchedule(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>
              Personal Introduction & Message *
            </label>
            <textarea
              rows={4}
              placeholder="Introduce yourself, why you admire this mentor's career, and what you hope to learn..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              <Send size={15} /> {isSubmitting ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 2. Schedule Session Modal
export function ScheduleSessionModal({ request, onClose, onSubmit }) {
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [meetingLink, setMeetingLink] = useState(`https://meet.google.com/alm-${Date.now().toString(36)}`);
  const [agenda, setAgenda] = useState(request?.goals || 'Review resume, practice mock coding/system interview, Q&A.');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!scheduledAt) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        requestId: request.id,
        studentId: request.student_id,
        alumniId: request.alumni_id,
        topic: request.topic,
        scheduledAt: scheduledAt.replace('T', ' ') + ':00',
        durationMinutes,
        meetingLink,
        agenda,
        notes
      });
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to schedule session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', color: '#FFF' }}>Schedule Mentorship Meeting</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Topic: <strong>{request?.topic}</strong>
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>
              Meeting Date & Time *
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={e => setScheduledAt(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>
                Duration
              </label>
              <select
                value={durationMinutes}
                onChange={e => setDurationMinutes(Number(e.target.value))}
                style={{ width: '100%' }}
              >
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>
                Location / Video Call
              </label>
              <input
                type="text"
                value="Virtual (Google Meet / Zoom)"
                disabled
                style={{ width: '100%', opacity: 0.7 }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>
              Meeting Video Link
            </label>
            <input
              type="url"
              value={meetingLink}
              onChange={e => setMeetingLink(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>
              Session Agenda
            </label>
            <textarea
              rows={3}
              value={agenda}
              onChange={e => setAgenda(e.target.value)}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              <Calendar size={15} /> {isSubmitting ? 'Scheduling...' : 'Confirm Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 3. Feedback and Rating Modal
export function FeedbackModal({ session, onClose, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedTags, setSelectedTags] = useState(['Actionable Advice', 'Deep Technical Knowledge']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableTags = [
    'Actionable Advice',
    'Deep Technical Knowledge',
    'Inspiring',
    'Great Listener',
    'Resume Tips',
    'System Design Clarity',
    'Interview Confidence'
  ];

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(session.id, {
        rating,
        feedbackText,
        tags: selectedTags.join(', ')
      });
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', color: '#FFF' }}>Session Feedback & Rating</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              How was your mentorship session on "{session?.topic}"?
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Star selector */}
          <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
              Overall Experience Rating
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{ background: 'none', cursor: 'pointer', padding: '0.25rem' }}
                >
                  <Star
                    size={32}
                    fill={(hoverRating || rating) >= star ? '#FBBF24' : 'none'}
                    color={(hoverRating || rating) >= star ? '#FBBF24' : 'var(--text-dim)'}
                  />
                </button>
              ))}
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FBBF24', marginTop: '0.4rem' }}>
              {rating === 5 ? '⭐ Extraordinary Guidance' : rating === 4 ? '⭐ Great Experience' : rating === 3 ? '⭐ Helpful' : 'Could Be Improved'}
            </div>
          </div>

          {/* Highlight Tags */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.5rem' }}>
              Select Highlight Tags
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {availableTags.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'var(--bg-elevated)',
                      color: isSelected ? '#A5B4FC' : 'var(--text-muted)',
                      border: isSelected ? '1px solid #818CF8' : '1px solid var(--border-subtle)'
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>
              Written Testimonial / Review
            </label>
            <textarea
              rows={4}
              placeholder="Share specific takeaways, advice you found most valuable, or why you would recommend this mentor..."
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              required
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}>
              <Star size={15} /> {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// 4. User Profile Deep-Dive Modal
export function UserProfileModal({ user, onClose, onStartMessage, onSendConnectionRequest, onOpenRequestModal, currentUserId }) {
  if (!user) return null;

  const isSelf = currentUserId === user.id;
  const isAlumni = user.role === 'alumni';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <img
              src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
              alt={user.first_name}
              style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.35rem', color: '#FFF' }}>
                  {user.first_name} {user.last_name}
                </h2>
                {isAlumni && user.profile?.verification_status === 'verified' && (
                  <CheckCircle size={18} color="#34D399" />
                )}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#A5B4FC' }}>
                {user.headline || (isAlumni ? `${user.profile?.current_position} @ ${user.profile?.current_company}` : 'Apex Student')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                {user.email}
              </div>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Bio */}
        {user.profile?.bio && (
          <div style={{ marginBottom: '1.25rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>
              About
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
              {user.profile.bio}
            </p>
          </div>
        )}

        {/* Education & Role Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
            <div style={{ color: 'var(--text-dim)' }}>Education</div>
            <div style={{ fontWeight: 600, color: '#FFF', marginTop: '0.1rem' }}>
              {user.profile?.degree}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              {user.profile?.field_of_study}
            </div>
          </div>

          {isAlumni ? (
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
              <div style={{ color: 'var(--text-dim)' }}>Experience & Company</div>
              <div style={{ fontWeight: 600, color: '#FFF', marginTop: '0.1rem' }}>
                {user.profile?.current_company}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                {user.profile?.years_experience} years in {user.profile?.industry}
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
              <div style={{ color: 'var(--text-dim)' }}>Graduation Target</div>
              <div style={{ fontWeight: 600, color: '#FFF', marginTop: '0.1rem' }}>
                Class of {user.profile?.expected_graduation_year}
              </div>
              {user.profile?.gpa && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  GPA: {user.profile.gpa}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Skills */}
        {user.skills && user.skills.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.4rem' }}>
              Skills & Expertise
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {user.skills.map(s => (
                <span key={s.id} style={{
                  fontSize: '0.75rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: '#FFF'
                }}>
                  {s.name} ({s.proficiency_level || 'Intermediate'})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Reviews if Alumni */}
        {isAlumni && user.reviews && user.reviews.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>
              Recent Mentorship Reviews
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '180px', overflowY: 'auto' }}>
              {user.reviews.map(rev => (
                <div key={rev.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 600, color: '#FFF' }}>{rev.student_first_name}</span>
                    <span style={{ color: '#FBBF24', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Star size={12} fill="#FBBF24" /> {rev.rating} / 5
                    </span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.75rem' }}>
                    "{rev.feedback_text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!isSelf && (
          <div style={{ display: 'flex', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            {isAlumni && (
              <button
                onClick={() => {
                  onClose();
                  onOpenRequestModal(user);
                }}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Request Mentorship
              </button>
            )}
            <button
              onClick={() => {
                onClose();
                onSendConnectionRequest(user.id);
              }}
              className="btn btn-secondary"
            >
              Connect
            </button>
            <button
              onClick={() => {
                onClose();
                onStartMessage(user.id);
              }}
              className="btn btn-secondary"
            >
              Message
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// 5. Auth Modal (Sign In / Register)
export function AuthModal({ onClose, onLogin, onRegister }) {
  const [tab, setTab] = useState('login'); // 'login', 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('student');
  const [currentCompany, setCurrentCompany] = useState('');
  const [currentPosition, setCurrentPosition] = useState('');
  const [degree, setDegree] = useState('B.S. in Computer Science');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (tab === 'login') {
        await onLogin({ email, password });
      } else {
        await onRegister({
          email,
          password,
          role,
          firstName,
          lastName,
          currentCompany,
          currentPosition,
          degree
        });
      }
      onClose();
    } catch (err) {
      alert(err.message || 'Authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', color: '#FFF' }}>
            {tab === 'login' ? 'Welcome to AlumLink' : 'Create an Account'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setTab('login')}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              background: tab === 'login' ? 'var(--primary-gradient)' : 'transparent',
              color: tab === 'login' ? '#FFF' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            style={{
              flex: 1,
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              background: tab === 'register' ? 'var(--primary-gradient)' : 'transparent',
              color: tab === 'register' ? '#FFF' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tab === 'register' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    required
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>I am a...</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    style={{
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-md)',
                      background: role === 'student' ? 'rgba(99, 102, 241, 0.25)' : 'var(--bg-elevated)',
                      border: role === 'student' ? '1px solid #818CF8' : '1px solid var(--border-subtle)',
                      color: role === 'student' ? '#FFF' : 'var(--text-muted)',
                      fontWeight: 600,
                      fontSize: '0.85rem'
                    }}
                  >
                    Current Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('alumni')}
                    style={{
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-md)',
                      background: role === 'alumni' ? 'rgba(99, 102, 241, 0.25)' : 'var(--bg-elevated)',
                      border: role === 'alumni' ? '1px solid #818CF8' : '1px solid var(--border-subtle)',
                      color: role === 'alumni' ? '#FFF' : 'var(--text-muted)',
                      fontWeight: 600,
                      fontSize: '0.85rem'
                    }}
                  >
                    Alumni / Mentor
                  </button>
                </div>
              </div>

              {role === 'alumni' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Company</label>
                    <input
                      type="text"
                      placeholder="e.g. Google"
                      value={currentCompany}
                      onChange={e => setCurrentCompany(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Position</label>
                    <input
                      type="text"
                      placeholder="e.g. SWE"
                      value={currentPosition}
                      onChange={e => setCurrentPosition(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Email Address</label>
            <input
              type="email"
              placeholder="you@domain.edu"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
          >
            {isSubmitting ? 'Please wait...' : (tab === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>
      </div>
    </div>
  );
}
