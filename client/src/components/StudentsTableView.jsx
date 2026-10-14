import React, { useState } from 'react';
import { 
  GraduationCap, 
  Search, 
  Download, 
  Table, 
  ExternalLink,
  MessageSquare,
  Sparkles
} from 'lucide-react';

export default function StudentsTableView({ 
  students = [], 
  onOpenProfileModal,
  onStartMessage,
  onExecuteCustomQuery
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [majorFilter, setMajorFilter] = useState('all');

  const filtered = students.filter(s => {
    const term = searchTerm.toLowerCase();
    const matchSearch = !term ||
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(term) ||
      (s.field_of_study || '').toLowerCase().includes(term) ||
      (s.career_interests || '').toLowerCase().includes(term) ||
      (s.target_industries || '').toLowerCase().includes(term);

    const matchMajor = majorFilter === 'all' || s.field_of_study === majorFilter;
    return matchSearch && matchMajor;
  });

  const exportCsv = () => {
    if (filtered.length === 0) return;
    const headers = ['User ID', 'Name', 'Email', 'Degree', 'Major', 'Expected Grad', 'GPA', 'Interests', 'Target Industries'];
    const rows = filtered.map(s => [
      s.user_id,
      `"${s.first_name} ${s.last_name}"`,
      `"${s.email}"`,
      `"${s.degree}"`,
      `"${s.field_of_study}"`,
      s.expected_graduation_year,
      s.gpa || 'N/A',
      `"${s.career_interests || ''}"`,
      `"${s.target_industries || ''}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `student_directory_extract_${Date.now()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const majors = Array.from(new Set(students.map(s => s.field_of_study).filter(Boolean)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header bar */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <GraduationCap size={24} color="#818CF8" />
              Student Records Table (`student_profiles` & `users`)
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              Relational table view of all undergraduate and graduate student scholars, majors, GPAs, and career interests.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => onExecuteCustomQuery("SELECT * FROM student_profiles JOIN users ON student_profiles.user_id = users.id;")}
              className="btn btn-outline btn-sm"
            >
              Run Raw SQL Query
            </button>
            <button
              onClick={exportCsv}
              className="btn btn-primary btn-sm"
            >
              <Download size={14} /> Export CSV ({filtered.length})
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by student name, major, career interests, or target industries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.5rem', height: '38px', fontSize: '0.85rem' }}
            />
          </div>

          <select
            value={majorFilter}
            onChange={(e) => setMajorFilter(e.target.value)}
            style={{ minWidth: '200px', height: '38px' }}
          >
            <option value="all">All Fields of Study</option>
            {majors.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabular Records Grid */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', maxHeight: '560px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--border-subtle)', position: 'sticky', top: 0, zIndex: 10 }}>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-dim)' }}>ID</th>
                <th style={{ padding: '0.75rem 1rem', color: '#A5B4FC' }}>Student Name</th>
                <th style={{ padding: '0.75rem 1rem', color: '#A5B4FC' }}>Field of Study</th>
                <th style={{ padding: '0.75rem 1rem', color: '#A5B4FC' }}>Degree</th>
                <th style={{ padding: '0.75rem 1rem', color: '#A5B4FC' }}>Expected Grad</th>
                <th style={{ padding: '0.75rem 1rem', color: '#A5B4FC' }}>GPA</th>
                <th style={{ padding: '0.75rem 1rem', color: '#A5B4FC' }}>Career Interests</th>
                <th style={{ padding: '0.75rem 1rem', color: '#A5B4FC' }}>Target Industries</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#A5B4FC' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr 
                  key={s.user_id} 
                  style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                    #{s.user_id}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <img
                        src={s.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={s.first_name}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: '#FFF' }}>
                          {s.first_name} {s.last_name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#FFF' }}>
                    {s.field_of_study}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                    {s.degree}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                    Class of {s.expected_graduation_year}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ fontWeight: 700, color: '#34D399' }}>
                      {s.gpa ? s.gpa.toFixed(2) : '3.80'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#E2E8F0', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.career_interests || 'Software Engineering'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-dim)', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.target_industries || 'Technology & Cloud'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                      <button
                        onClick={() => onOpenProfileModal(s.user_id)}
                        className="btn btn-outline btn-sm"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => onStartMessage(s.user_id)}
                        className="btn btn-primary btn-sm"
                      >
                        <MessageSquare size={13} /> Message
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
