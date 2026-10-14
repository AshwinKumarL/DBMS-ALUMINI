import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Database, 
  ExternalLink, 
  Search, 
  Filter, 
  TrendingUp, 
  Star,
  Clock,
  Check
} from 'lucide-react';

export default function AdminPanel({ 
  metrics = null, 
  verifications = [], 
  users = [], 
  reports = [], 
  onVerifyAlumni,
  onToggleUserStatus,
  onResolveReport,
  onOpenProfileModal
}) {
  const [activeTab, setActiveTab] = useState('verifications'); // 'verifications', 'users', 'reports', 'health'
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredUsers = users.filter(u => {
    const matchSearch = !userSearch.trim() || `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const pendingVerifications = verifications.filter(v => v.verification_status === 'pending');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner & Stats Overview */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShieldCheck size={26} color="#FBBF24" />
              Administrative Command Center
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              Manage alumni verification credentials, moderate users, track mentorship metrics, and inspect system database integrity.
            </p>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
          <button
            onClick={() => setActiveTab('verifications')}
            style={{
              padding: '0.5rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              background: activeTab === 'verifications' ? 'var(--primary-gradient)' : 'transparent',
              color: activeTab === 'verifications' ? '#FFF' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            Alumni Verifications ({pendingVerifications.length} Pending)
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '0.5rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              background: activeTab === 'users' ? 'var(--primary-gradient)' : 'transparent',
              color: activeTab === 'users' ? '#FFF' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            User Management ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            style={{
              padding: '0.5rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              background: activeTab === 'reports' ? 'var(--primary-gradient)' : 'transparent',
              color: activeTab === 'reports' ? '#FFF' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            Moderation Reports ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('health')}
            style={{
              padding: '0.5rem 1.1rem',
              borderRadius: 'var(--radius-md)',
              background: activeTab === 'health' ? 'var(--primary-gradient)' : 'transparent',
              color: activeTab === 'health' ? '#FFF' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Database size={15} /> Database & Health
          </button>
        </div>
      </div>

      {/* TAB 1: ALUMNI VERIFICATIONS QUEUE */}
      {activeTab === 'verifications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#FFF' }}>
              Pending Alumni Credentials Review
            </h3>
            <span className="badge badge-pending">
              {pendingVerifications.length} Waiting Review
            </span>
          </div>

          {verifications.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <CheckCircle size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <p style={{ color: 'var(--text-muted)' }}>No alumni applications in queue.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
              {verifications.map(v => (
                <div key={v.user_id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <img
                          src={v.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={v.first_name}
                          style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#FFF' }}>
                            {v.first_name} {v.last_name}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#A5B4FC' }}>
                            {v.current_position}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            {v.current_company}
                          </div>
                        </div>
                      </div>

                      <span className={`badge ${
                        v.verification_status === 'verified' ? 'badge-verified' :
                        v.verification_status === 'pending' ? 'badge-pending' :
                        'badge-rejected'
                      }`}>
                        {v.verification_status.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div><strong>Education:</strong> {v.degree} ({v.field_of_study})</div>
                      <div><strong>Graduation Year:</strong> Class of {v.graduation_year}</div>
                      <div><strong>Experience:</strong> {v.years_experience} years in {v.industry}</div>
                      {v.linkedin_url && (
                        <div>
                          <strong>LinkedIn:</strong>{' '}
                          <a href={v.linkedin_url} target="_blank" rel="noreferrer" style={{ color: '#818CF8', textDecoration: 'underline' }}>
                            View Profile <ExternalLink size={12} style={{ display: 'inline' }} />
                          </a>
                        </div>
                      )}
                    </div>

                    {v.rejection_reason && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#F87171' }}>
                        <strong>Rejection Reason:</strong> {v.rejection_reason}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                    {v.verification_status !== 'verified' && (
                      <button
                        onClick={() => onVerifyAlumni(v.user_id, 'verify')}
                        className="btn btn-success btn-sm"
                        style={{ flex: 1 }}
                      >
                        <CheckCircle size={14} /> Approve & Verify
                      </button>
                    )}
                    {v.verification_status !== 'rejected' && (
                      <button
                        onClick={() => {
                          const reason = prompt('Please provide a reason for rejecting this verification:');
                          if (reason !== null) {
                            onVerifyAlumni(v.user_id, 'reject', reason);
                          }
                        }}
                        className="btn btn-danger btn-sm"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    )}
                    <button
                      onClick={() => onOpenProfileModal(v.user_id)}
                      className="btn btn-outline btn-sm"
                    >
                      Inspect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: '2.5rem', height: '40px' }}
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ minWidth: '150px' }}
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="alumni">Alumni</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>User</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Role</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Organization</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <img
                          src={u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={u.first_name}
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: '#FFF' }}>{u.first_name} {u.last_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textTransform: 'capitalize' }}>
                      <span className={`badge ${u.role === 'admin' ? 'badge-pending' : u.role === 'alumni' ? 'badge-verified' : 'badge-primary'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                      {u.organization || '—'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        color: u.is_active ? '#34D399' : '#F87171',
                        fontWeight: 600,
                        fontSize: '0.8rem'
                      }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: u.is_active ? '#10B981' : '#EF4444' }} />
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                          onClick={() => onOpenProfileModal(u.id)}
                          className="btn btn-outline btn-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => onToggleUserStatus(u.id, !u.is_active)}
                          className={`btn ${u.is_active ? 'btn-danger' : 'btn-success'} btn-sm`}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MODERATION REPORTS */}
      {activeTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#FFF' }}>
            Flagged Safety & Policy Reports
          </h3>

          {reports.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <CheckCircle size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <p style={{ color: 'var(--text-muted)' }}>No reports currently require moderation.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reports.map(r => (
                <div key={r.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <AlertTriangle size={18} color="#FBBF24" />
                      <span style={{ fontWeight: 700, color: '#FFF', fontSize: '0.95rem' }}>
                        Report against {r.reported_first_name} {r.reported_last_name} ({r.reported_role})
                      </span>
                    </div>
                    <span className={`badge ${r.status === 'pending' ? 'badge-pending' : 'badge-verified'}`}>
                      {r.status.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
                    <div><strong>Reason:</strong> {r.reason}</div>
                    <div style={{ marginTop: '0.35rem', color: 'var(--text-muted)' }}>
                      <strong>Details:</strong> "{r.details}"
                    </div>
                    <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      Reported by {r.reporter_first_name} ({r.reporter_email}) on {new Date(r.created_at).toLocaleString()}
                    </div>
                  </div>

                  {r.resolution_notes && (
                    <div style={{ fontSize: '0.8rem', color: '#34D399' }}>
                      <strong>Resolution Notes:</strong> {r.resolution_notes}
                    </div>
                  )}

                  {r.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                      <button
                        onClick={() => {
                          const notes = prompt('Enter resolution summary notes:');
                          if (notes) onResolveReport(r.id, 'resolved', notes);
                        }}
                        className="btn btn-success btn-sm"
                      >
                        <Check size={14} /> Resolve Report
                      </button>
                      <button
                        onClick={() => onResolveReport(r.id, 'dismissed', 'Reviewed and dismissed by admin.')}
                        className="btn btn-outline btn-sm"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SYSTEM HEALTH & SQL ENGINE */}
      {activeTab === 'health' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <Database size={22} color="#10B981" />
              <h2 style={{ fontSize: '1.3rem' }}>Relational SQL Database Engine Status</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Database Engine</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34D399', marginTop: '0.2rem' }}>
                  Node 24 Native SQLite
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Journal & Lock Mode</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#818CF8', marginTop: '0.2rem' }}>
                  WAL (Write-Ahead Logging)
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Foreign Key Constraints</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10B981', marginTop: '0.2rem' }}>
                  ON (ACID Enforced)
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Active Tables</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FBBF24', marginTop: '0.2rem' }}>
                  12 Normalized Tables
                </div>
              </div>
            </div>

            <h4 style={{ fontSize: '0.95rem', color: '#FFF', marginBottom: '0.5rem' }}>
              Schemas & Production Deployments
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              The application utilizes an isolated, relational schema with zero mock data. Complete migration DDLs are bundled in the repository:
            </p>
            <ul style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.75rem 1.5rem', lineHeight: 1.8 }}>
              <li><code>server/db/schema.sql</code> — SQLite normalized schema with indexes & foreign keys.</li>
              <li><code>server/db/postgres_schema.sql</code> — PostgreSQL 13+ production schema.</li>
              <li><code>server/db/mysql_schema.sql</code> — MySQL 8.0+ InnoDB production schema.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
