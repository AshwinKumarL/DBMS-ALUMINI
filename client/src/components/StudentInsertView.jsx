import React, { useState } from 'react';
import { api } from '../services/api';
import { 
  UserPlus, 
  CheckCircle, 
  AlertCircle, 
  GraduationCap, 
  Trash2, 
  Plus, 
  Search,
  BookOpen
} from 'lucide-react';

export default function StudentInsertView({ onStudentInserted, students = [] }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    degree: 'B.S. in Computer Science',
    fieldOfStudy: 'Computer Science',
    institution: 'Apex University Institute of Technology',
    expectedGraduationYear: 2026,
    gpa: '3.85',
    careerInterests: 'Distributed Systems, Cloud Architecture',
    targetIndustries: 'Technology & Cloud',
    headline: ''
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
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      alert('Please fill in First Name, Last Name, and Email.');
      return;
    }

    setExecuting(true);
    setResultMessage(null);
    setErrorMessage(null);

    try {
      const res = await api.insertStudent(formData);
      setResultMessage(res.message);
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        degree: 'B.S. in Computer Science',
        fieldOfStudy: 'Computer Science',
        institution: 'Apex University Institute of Technology',
        expectedGraduationYear: 2026,
        gpa: '3.85',
        careerInterests: '',
        targetIndustries: '',
        headline: ''
      });

      if (onStudentInserted) onStudentInserted();
    } catch (err) {
      setErrorMessage(err.data?.error || err.message || 'Failed to insert student into database.');
    } finally {
      setExecuting(false);
    }
  };

  const handleDelete = async (userId, name) => {
    if (!confirm(`Are you sure you want to delete Student #${userId} (${name}) from the database?`)) return;
    try {
      const res = await api.deleteStudent(userId);
      alert(res.message);
      if (onStudentInserted) onStudentInserted();
    } catch (err) {
      alert(err.message || 'Failed to delete student.');
    }
  };

  const filteredStudents = students.filter(s => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const fullName = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
    return (
      fullName.includes(term) ||
      (s.email && s.email.toLowerCase().includes(term)) ||
      (s.field_of_study && s.field_of_study.toLowerCase().includes(term)) ||
      (s.degree && s.degree.toLowerCase().includes(term))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1300px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <UserPlus size={26} color="#818CF8" />
            Students Insert & Table Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Insert and manage student relational records in <code>users</code> and <code>student_profiles</code>.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="badge badge-primary" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
            {students.length} Total Students
          </span>
        </div>
      </div>

      {/* Insert Form Card */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#FFF', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GraduationCap size={20} color="#818CF8" /> New Student Entry Form
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>First Name *</label>
              <input
                type="text"
                name="firstName"
                placeholder="e.g. Liam"
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
                placeholder="e.g. Vance"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Email Address *</label>
              <input
                type="email"
                name="email"
                placeholder="e.g. liam.vance@student.edu"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Major / Field of Study *</label>
              <input
                type="text"
                name="fieldOfStudy"
                placeholder="e.g. Computer Science"
                value={formData.fieldOfStudy}
                onChange={handleInputChange}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Degree Program</label>
              <input
                type="text"
                name="degree"
                placeholder="e.g. B.S. in Computer Science"
                value={formData.degree}
                onChange={handleInputChange}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Expected Graduation Year</label>
              <input
                type="number"
                name="expectedGraduationYear"
                value={formData.expectedGraduationYear}
                onChange={handleInputChange}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Cumulative GPA</label>
              <input
                type="number"
                step="0.01"
                name="gpa"
                placeholder="e.g. 3.85"
                value={formData.gpa}
                onChange={handleInputChange}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Career Interests</label>
              <input
                type="text"
                name="careerInterests"
                placeholder="e.g. Distributed Systems, Cloud Architecture, AI"
                value={formData.careerInterests}
                onChange={handleInputChange}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Target Industries</label>
              <input
                type="text"
                name="targetIndustries"
                placeholder="e.g. Technology & Cloud, FinTech"
                value={formData.targetIndustries}
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
              style={{ padding: '0.75rem 1.75rem', background: 'linear-gradient(135deg, #6366F1, #4F46E5)' }}
            >
              <Plus size={16} /> {executing ? 'Inserting Student...' : 'Insert Student Record'}
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

      {/* Existing Records Data Table */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="#818CF8" /> Student Database Records
            </h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
              Current rows in <code>student_profiles</code> table
            </p>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search students..."
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
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Student Name</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Email</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Major / Degree</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Grad Year</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>GPA</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Career Interests</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                    No student records found matching "{searchTerm}".
                  </td>
                </tr>
              ) : (
                filteredStudents.map(s => (
                  <tr 
                    key={s.user_id}
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-dim)' }}>#{s.user_id}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#FFF' }}>
                      {s.first_name} {s.last_name}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>{s.email}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#CBD5E1' }}>
                      {s.field_of_study}
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)' }}>{s.degree}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: '#93C5FD' }}>{s.expected_graduation_year || '-'}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span style={{ color: '#34D399', fontWeight: 700 }}>{s.gpa ? Number(s.gpa).toFixed(2) : '-'}</span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.career_interests || '-'}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(s.user_id, `${s.first_name} ${s.last_name}`)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#F87171', borderColor: 'rgba(239, 68, 68, 0.3)', padding: '0.3rem 0.6rem' }}
                        title="Delete Student from Database"
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
