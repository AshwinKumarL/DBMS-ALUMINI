import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle, 
  Star, 
  Download, 
  Plus, 
  Briefcase, 
  GraduationCap, 
  ExternalLink,
  Table
} from 'lucide-react';

export default function AlumniTableView({ 
  alumniList = [], 
  onOpenProfileModal,
  onOpenRequestModal,
  onStartMessage,
  onExecuteCustomQuery
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');

  const filtered = alumniList.filter(a => {
    const term = searchTerm.toLowerCase();
    const matchSearch = !term || 
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(term) ||
      (a.currentCompany || '').toLowerCase().includes(term) ||
      (a.currentPosition || '').toLowerCase().includes(term) ||
      (a.industry || '').toLowerCase().includes(term);
    
    const matchIndustry = industryFilter === 'all' || a.industry === industryFilter;
    const matchVerification = verificationFilter === 'all' || a.verificationStatus === verificationFilter;

    return matchSearch && matchIndustry && matchVerification;
  });

  const exportCsv = () => {
    if (filtered.length === 0) return;
    const headers = ['User ID', 'First Name', 'Last Name', 'Company', 'Position', 'Industry', 'Grad Year', 'Experience Yrs', 'Status', 'Rating'];
    const rows = filtered.map(a => [
      a.userId,
      `"${a.firstName}"`,
      `"${a.lastName}"`,
      `"${a.currentCompany}"`,
      `"${a.currentPosition}"`,
      `"${a.industry}"`,
      a.graduationYear,
      a.yearsExperience,
      a.verificationStatus,
      a.avgRating
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alumni_directory_extract_${Date.now()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const industries = Array.from(new Set(alumniList.map(a => a.industry).filter(Boolean)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header bar */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Table size={24} color="#818CF8" />
              Alumni Records Table (`alumni_profiles` & `users`)
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              Relational table view with multi-column filtering, SQL extraction, and CSV export.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => onExecuteCustomQuery("SELECT * FROM alumni_profiles JOIN users ON alumni_profiles.user_id = users.id;")}
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
              placeholder="Search by name, company, position, or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.5rem', height: '38px', fontSize: '0.85rem' }}
            />
          </div>

          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            style={{ minWidth: '180px', height: '38px' }}
          >
            <option value="all">All Industries</option>
            {industries.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>

          <select
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
            style={{ minWidth: '160px', height: '38px' }}
          >
            <option value="all">All Statuses</option>
            <option value="verified">Verified Mentors Only</option>
            <option value="pending">Pending Verification</option>
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
                <th style={{ padding: '0.75rem 1rem', color: '#A5B4FC' }}>Alumni Name</th>
                <th style={{ padding: '0.75rem 1rem', color: '#A5B4FC' }}>Company</th>
                <th style={{ padding: '0.75rem 1rem', color: '#A5B4FC' }}>Current Position</th>
                <th style={{ padding: '0.75rem 1rem', color: '#A5B4FC' }}>Industry</th>
                <th style={{ padding: '0.75rem 1rem', color: '#A5B4FC' }}>Grad Year</th>
                <th style={{ padding: '0.75rem 1rem', color: '#A5B4FC' }}>Exp</th>
                <th style={{ padding: '0.75rem 1rem', color: '#A5B4FC' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', color: '#A5B4FC' }}>Rating</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#A5B4FC' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr 
                  key={a.userId} 
                  style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                    #{a.userId}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <img
                        src={a.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={a.firstName}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          {a.firstName} {a.lastName}
                          {a.verificationStatus === 'verified' && <CheckCircle size={14} color="#34D399" />}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{a.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#FFF' }}>
                    {a.currentCompany}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#A5B4FC' }}>
                    {a.currentPosition}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                    {a.industry}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                    {a.graduationYear}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                    {a.yearsExperience} yrs
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className={`badge ${a.verificationStatus === 'verified' ? 'badge-verified' : 'badge-pending'}`}>
                      {a.verificationStatus}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#FBBF24', fontWeight: 700 }}>
                      <Star size={13} fill="#FBBF24" /> {a.avgRating || 5.0}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                      <button
                        onClick={() => onOpenProfileModal(a.userId)}
                        className="btn btn-outline btn-sm"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => onOpenRequestModal(a)}
                        className="btn btn-primary btn-sm"
                      >
                        Request
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
