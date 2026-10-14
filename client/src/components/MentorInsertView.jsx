import React, { useState } from 'react';
import { api } from '../services/api';
import { 
  Briefcase, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  Plus, 
  Search,
  Building,
  ShieldCheck,
  Star
} from 'lucide-react';

export default function MentorInsertView({ onMentorInserted, mentors = [] }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentCompany: '',
    currentPosition: '',
    industry: 'Technology & Cloud',
    degree: 'B.S. in Computer Science',
    fieldOfStudy: 'Computer Science',
    graduationYear: 2019,
    yearsExperience: 5,
    mentorshipTopics: 'System Design, Career Navigation, Mock Coding Interviews',
    bio: '',
    verificationStatus: 'verified'
  });

  const [executing, setExecuting] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.currentCompany.trim()) {
      alert('Please fill in First Name, Last Name, Email, and Current Company.');
      return;
    }

    setExecuting(true);
    setResultMessage(null);
    setErrorMessage(null);

    try {
      const res = await api.insertMentor(formData);
      setResultMessage(res.message);
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        currentCompany: '',
        currentPosition: '',
        industry: 'Technology & Cloud',
        degree: 'B.S. in Computer Science',
        fieldOfStudy: 'Computer Science',
        graduationYear: 2019,
        yearsExperience: 5,
        mentorshipTopics: '',
        bio: '',
        verificationStatus: 'verified'
      });

      if (onMentorInserted) onMentorInserted();
    } catch (err) {
      setErrorMessage(err.data?.error || err.message || 'Failed to insert mentor into database.');
    } finally {
      setExecuting(false);
    }
  };

  const handleDelete = async (userId, name) => {
    if (!confirm(`Are you sure you want to delete Mentor #${userId} (${name}) from the database?`)) return;
    try {
      const res = await api.deleteMentor(userId);
      alert(res.message);
      if (onMentorInserted) onMentorInserted();
    } catch (err) {
      alert(err.message || 'Failed to delete mentor.');
    }
  };

  const filteredMentors = mentors.filter(m => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const fullName = `${m.first_name || ''} ${m.last_name || ''}`.toLowerCase();
    return (
      fullName.includes(term) ||
      (m.email && m.email.toLowerCase().includes(term)) ||
      (m.current_company && m.current_company.toLowerCase().includes(term)) ||
      (m.current_position && m.current_position.toLowerCase().includes(term)) ||
      (m.industry && m.industry.toLowerCase().includes(term))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1300px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Briefcase size={26} color="#818CF8" />
            Mentor / Alumni Insert & Table Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Insert and manage alumni mentor relational records in <code>users</code> and <code>alumni_profiles</code>.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="badge badge-primary" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
            {mentors.length} Total Mentors
          </span>
        </div>
      </div>

      {/* Insert Form Card */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#FFF', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building size={20} color="#818CF8" /> New Mentor Entry Form
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>First Name *</label>
              <input
                type="text"
                name="firstName"
                placeholder="e.g. Jane"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Last Name *</label>
              <input
                type="text"
                name="lastName"
                placeholder="e.g. Smith"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Professional Email *</label>
              <input
                type="email"
                name="email"
                placeholder="e.g. jane.smith@google.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Current Company *</label>
              <input
                type="text"
                name="currentCompany"
                placeholder="e.g. Google Cloud"
                value={formData.currentCompany}
                onChange={handleInputChange}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Current Position *</label>
              <input
                type="text"
                name="currentPosition"
                placeholder="e.g. Staff Software Engineer"
                value={formData.currentPosition}
                onChange={handleInputChange}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Industry Domain</label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                style={{ width: '100%', height: '42px' }}
              >
                <option value="Technology & Cloud">Technology & Cloud</option>
                <option value="Finance & FinTech">Finance & FinTech</option>
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="Product & Design">Product & Design</option>
                <option value="Healthcare & BioTech">Healthcare & BioTech</option>
                <option value="Consulting & Strategy">Consulting & Strategy</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Graduation Year</label>
              <input
                type="number"
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleInputChange}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Years of Experience</label>
              <input
                type="number"
                name="yearsExperience"
                value={formData.yearsExperience}
                onChange={handleInputChange}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Verification Status</label>
              <select
                name="verificationStatus"
                value={formData.verificationStatus}
                onChange={handleInputChange}
                style={{ width: '100%', height: '42px' }}
              >
                <option value="verified">Verified Mentor</option>
                <option value="pending">Pending Verification</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Mentorship Topics / Expertise</label>
            <input
              type="text"
              name="mentorshipTopics"
              placeholder="e.g. System Design, Mock Interviews, Cloud Migration, Staff Career Paths"
              value={formData.mentorshipTopics}
              onChange={handleInputChange}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              type="submit"
              disabled={executing}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.75rem', background: 'linear-gradient(135deg, #10B981, #059669)' }}
            >
              <Plus size={16} /> {executing ? 'Inserting Mentor...' : 'Insert Mentor Record'}
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

      {/* Existing Mentors Data Table */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={20} color="#34D399" /> Mentor Database Records
            </h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
              Current rows in <code>alumni_profiles</code> table
            </p>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search mentors..."
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
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Mentor Name</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Company & Position</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Industry</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Grad Year</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Experience</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMentors.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                    No mentor records found matching "{searchTerm}".
                  </td>
                </tr>
              ) : (
                filteredMentors.map(m => (
                  <tr 
                    key={m.id || m.user_id}
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-dim)' }}>#{m.id || m.user_id}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#FFF' }}>
                      {m.first_name} {m.last_name}
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)' }}>{m.email}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#CBD5E1' }}>
                      <span style={{ fontWeight: 600, color: '#FFF' }}>{m.current_position || 'Engineer'}</span>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#93C5FD' }}>@{m.current_company}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{m.industry}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#93C5FD' }}>{m.graduation_year || '-'}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#34D399', fontWeight: 600 }}>
                      {m.years_experience} yrs
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className={`badge ${m.verification_status === 'verified' ? 'badge-success' : 'badge-warning'}`}>
                        {m.verification_status || 'verified'}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(m.id || m.user_id, `${m.first_name} ${m.last_name}`)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#F87171', borderColor: 'rgba(239, 68, 68, 0.3)', padding: '0.3rem 0.6rem' }}
                        title="Delete Mentor from Database"
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
