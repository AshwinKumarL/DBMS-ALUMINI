import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Play, 
  Database, 
  Table, 
  Key, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  Layers, 
  Download, 
  RefreshCw,
  AlertCircle,
  FileCode,
  Copy,
  Terminal
} from 'lucide-react';

const PRESET_QUERIES = [
  {
    title: '1. Extract All Alumni with Credentials & Rating',
    desc: 'Extracts full alumni directory with current company, position, graduation year, experience, and average session rating',
    query: `SELECT 
    u.id AS alumni_id,
    u.first_name || ' ' || u.last_name AS alumni_name,
    u.email,
    a.current_company,
    a.current_position,
    a.industry,
    a.graduation_year,
    a.years_experience,
    a.verification_status,
    ROUND(COALESCE(AVG(f.rating), 5.0), 2) AS avg_rating,
    COUNT(DISTINCT f.id) AS total_reviews,
    COUNT(DISTINCT ms.id) AS total_sessions_conducted
FROM users u
JOIN alumni_profiles a ON u.id = a.user_id
LEFT JOIN mentorship_sessions ms ON u.id = ms.alumni_id
LEFT JOIN session_feedback f ON u.id = f.alumni_id
WHERE u.is_active = 1
GROUP BY u.id
ORDER BY a.years_experience DESC, avg_rating DESC;`
  },
  {
    title: '2. Extract All Students with Major, GPA & Interests',
    desc: 'Extracts student cohort details, academic standing, target industries, and career interests',
    query: `SELECT 
    u.id AS student_id,
    u.first_name || ' ' || u.last_name AS student_name,
    u.email,
    s.degree,
    s.field_of_study,
    s.expected_graduation_year,
    s.gpa,
    s.career_interests,
    s.target_industries,
    (SELECT COUNT(*) FROM mentorship_requests mr WHERE mr.student_id = u.id) AS requests_submitted,
    (SELECT COUNT(*) FROM mentorship_sessions ms WHERE ms.student_id = u.id AND ms.status = 'completed') AS sessions_completed
FROM users u
JOIN student_profiles s ON u.id = s.user_id
WHERE u.is_active = 1
ORDER BY s.gpa DESC, s.expected_graduation_year ASC;`
  },
  {
    title: '3. Multi-Table JOIN: Mentorship Sessions Ledger',
    desc: 'Relational 4-way join connecting Sessions, Student details, Alumni mentor details, and Post-Session Ratings',
    query: `SELECT 
    ms.id AS session_id,
    ms.topic AS session_topic,
    ms.scheduled_at,
    ms.duration_minutes,
    ms.status AS session_status,
    stu.first_name || ' ' || stu.last_name AS student_name,
    sp.field_of_study AS student_major,
    alm.first_name || ' ' || alm.last_name AS alumni_name,
    ap.current_company AS alumni_company,
    ap.current_position AS alumni_role,
    fb.rating AS student_rating,
    fb.feedback_text AS testimonial
FROM mentorship_sessions ms
JOIN users stu ON ms.student_id = stu.id
JOIN student_profiles sp ON stu.id = sp.user_id
JOIN users alm ON ms.alumni_id = alm.id
JOIN alumni_profiles ap ON alm.id = ap.user_id
LEFT JOIN session_feedback fb ON ms.id = fb.session_id
ORDER BY ms.scheduled_at DESC;`
  },
  {
    title: '4. Skill Match Matrix (Alumni & Students Intersect)',
    desc: 'Identifies shared technical competencies between current students and alumni mentors using the user_skills junction table',
    query: `SELECT 
    sk.name AS skill_name,
    sk.category,
    stu_u.first_name || ' ' || stu_u.last_name AS student_name,
    stu_sk.proficiency_level AS student_proficiency,
    alm_u.first_name || ' ' || alm_u.last_name AS alumni_mentor,
    alm_sk.proficiency_level AS mentor_proficiency,
    alm_prof.current_company
FROM user_skills stu_sk
JOIN skills sk ON stu_sk.skill_id = sk.id
JOIN users stu_u ON stu_sk.user_id = stu_u.id AND stu_u.role = 'student'
JOIN user_skills alm_sk ON sk.id = alm_sk.skill_id
JOIN users alm_u ON alm_sk.user_id = alm_u.id AND alm_u.role = 'alumni'
JOIN alumni_profiles alm_prof ON alm_u.id = alm_prof.user_id
WHERE alm_prof.is_available_for_mentorship = 1
ORDER BY sk.name ASC, alm_prof.years_experience DESC;`
  },
  {
    title: '5. Alumni Verification & Safety Moderation Audit',
    desc: 'Audits alumni credentials, verification timestamps, verifier admin identity, and any flagged moderation reports',
    query: `SELECT 
    u.id AS user_id,
    u.first_name || ' ' || u.last_name AS alumni_name,
    ap.current_company,
    ap.current_position,
    ap.verification_status,
    ap.verified_at,
    admin.first_name || ' ' || admin.last_name AS verified_by_admin,
    COALESCE(rep.report_count, 0) AS moderation_flags
FROM alumni_profiles ap
JOIN users u ON ap.user_id = u.id
LEFT JOIN users admin ON ap.verified_by = admin.id
LEFT JOIN (
    SELECT reported_user_id, COUNT(*) AS report_count
    FROM reports
    GROUP BY reported_user_id
) rep ON u.id = rep.reported_user_id
ORDER BY ap.verification_status ASC, u.created_at DESC;`
  },
  {
    title: '6. Schema Metadata & Relational Catalog',
    desc: 'Introspects all normalized tables, views, and DDL definitions from SQLite data dictionary',
    query: `SELECT 
    name AS table_name,
    type,
    sql AS ddl_definition
FROM sqlite_master 
WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%'
ORDER BY type, name;`
  }
];

export default function SqlConsoleView({ initialQuery = '' }) {
  const [activeTab, setActiveTab] = useState('console'); // 'console' or 'schema'
  const [query, setQuery] = useState(initialQuery || PRESET_QUERIES[0].query);
  const [result, setResult] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [schemaTables, setSchemaTables] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');

  const fetchSchema = async () => {
    try {
      const res = await api.getSchema();
      setSchemaTables(res.schema || []);
    } catch (err) {
      console.error('Failed to fetch schema:', err);
    }
  };

  useEffect(() => {
    fetchSchema();
    if (initialQuery) {
      setQuery(initialQuery);
      handleExecute(initialQuery);
    } else {
      // Run default query on load
      handleExecute(PRESET_QUERIES[0].query);
    }
  }, [initialQuery]);

  const handleExecute = async (queryText = query) => {
    if (!queryText.trim()) return;
    setExecuting(true);
    setStatusMessage('');
    try {
      const res = await api.executeSql(queryText);
      setResult(res);
      setStatusMessage(`Query executed successfully in ${res.executionTimeMs} (${res.rowCount || res.changes || 0} rows/changes)`);
    } catch (err) {
      setResult({
        success: false,
        error: err.data?.error || err.message,
        executionTimeMs: err.data?.executionTimeMs || '0.00 ms'
      });
      setStatusMessage(`Error: ${err.data?.error || err.message}`);
    } finally {
      setExecuting(false);
    }
  };

  const exportCsv = () => {
    if (!result?.data || result.data.length === 0) return;
    const headers = Object.keys(result.data[0]);
    const csvRows = [
      headers.join(','),
      ...result.data.map(row => 
        headers.map(h => {
          const val = row[h];
          if (val === null || val === undefined) return '""';
          return `"${String(val).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `query_extract_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Terminal size={26} color="#818CF8" />
              Relational DBMS & SQL Workbench
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              Execute ad-hoc SQL queries, extract alumni and student datasets, analyze foreign key joins, and inspect database schemas.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('console')}
              style={{
                padding: '0.5rem 1.1rem',
                borderRadius: 'var(--radius-md)',
                background: activeTab === 'console' ? 'var(--primary-gradient)' : 'var(--bg-elevated)',
                color: activeTab === 'console' ? '#FFF' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Terminal size={15} /> SQL Console
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              style={{
                padding: '0.5rem 1.1rem',
                borderRadius: 'var(--radius-md)',
                background: activeTab === 'schema' ? 'var(--primary-gradient)' : 'var(--bg-elevated)',
                color: activeTab === 'schema' ? '#FFF' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Database size={15} /> Schema & ER Explorer ({schemaTables.length} Tables)
            </button>
          </div>
        </div>

        {/* Tab 1: Console View */}
        {activeTab === 'console' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Preset Query Carousel */}
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <BookOpen size={14} color="#818CF8" /> Pre-built DBMS Queries (Click to load)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0.65rem' }}>
                {PRESET_QUERIES.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setQuery(preset.query);
                      handleExecute(preset.query);
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.5)';
                      e.currentTarget.style.background = 'rgba(99, 102, 241, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#FFF' }}>
                      {preset.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {preset.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SQL Query Editor */}
            <div style={{ position: 'relative' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(15, 23, 42, 0.8)',
                padding: '0.5rem 1rem',
                borderTopLeftRadius: 'var(--radius-md)',
                borderTopRightRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                borderBottom: 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                  <FileCode size={15} color="#818CF8" />
                  <span style={{ fontWeight: 600, color: '#E2E8F0' }}>SQL Query Editor (SQLite / Relational SQL)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(query);
                      alert('Query copied to clipboard!');
                    }}
                    className="btn btn-outline btn-sm"
                  >
                    <Copy size={13} /> Copy
                  </button>
                  <button
                    onClick={() => handleExecute(query)}
                    disabled={executing}
                    className="btn btn-primary btn-sm"
                    style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
                  >
                    <Play size={14} /> {executing ? 'Executing...' : 'Run Query (Ctrl+Enter)'}
                  </button>
                </div>
              </div>

              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleExecute(query);
                  }
                }}
                rows={8}
                style={{
                  width: '100%',
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  padding: '1rem',
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                  background: '#0D1117',
                  border: '1px solid var(--border-subtle)',
                  color: '#58A6FF'
                }}
              />
            </div>

            {/* Execution Diagnostic Status Bar */}
            {result && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: result.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: result.success ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  {result.success ? (
                    <CheckCircle size={16} color="#34D399" />
                  ) : (
                    <AlertCircle size={16} color="#F87171" />
                  )}
                  <span style={{ color: result.success ? '#34D399' : '#F87171', fontWeight: 600 }}>
                    {result.success ? `Executed in ${result.executionTimeMs}` : `SQL Execution Error`}
                  </span>
                  {result.success && result.rowCount !== undefined && (
                    <span style={{ color: 'var(--text-muted)' }}>
                      • {result.rowCount} row(s) returned
                    </span>
                  )}
                  {result.success && result.changes !== undefined && (
                    <span style={{ color: 'var(--text-muted)' }}>
                      • {result.changes} row(s) affected
                    </span>
                  )}
                </div>

                {result.success && result.data && result.data.length > 0 && (
                  <button
                    onClick={exportCsv}
                    className="btn btn-outline btn-sm"
                  >
                    <Download size={14} /> Export CSV
                  </button>
                )}
              </div>
            )}

            {/* Error Message Box */}
            {result && !result.success && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                color: '#F87171',
                fontSize: '0.85rem',
                fontFamily: 'monospace'
              }}>
                {result.error}
              </div>
            )}

            {/* Tabular Output Grid */}
            {result && result.success && result.data && result.data.length > 0 && (
              <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto', maxHeight: '480px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid var(--border-subtle)', position: 'sticky', top: 0, zIndex: 10 }}>
                        <th style={{ padding: '0.75rem 1rem', width: '50px', color: 'var(--text-dim)' }}>#</th>
                        {Object.keys(result.data[0]).map(col => (
                          <th key={col} style={{ padding: '0.75rem 1rem', color: '#A5B4FC', fontWeight: 600, whiteSpace: 'nowrap' }}>
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.data.map((row, rIdx) => (
                        <tr 
                          key={rIdx} 
                          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '0.65rem 1rem', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                            {rIdx + 1}
                          </td>
                          {Object.keys(result.data[0]).map(col => {
                            const val = row[col];
                            return (
                              <td key={col} style={{ padding: '0.65rem 1rem', color: '#FFF', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {val === null || val === undefined ? (
                                  <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>NULL</span>
                                ) : typeof val === 'boolean' ? (
                                  val ? 'TRUE' : 'FALSE'
                                ) : (
                                  String(val)
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Schema & ER Explorer */}
        {activeTab === 'schema' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
              {schemaTables.map(tbl => (
                <div 
                  key={tbl.name} 
                  className="glass-card" 
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Table size={18} color="#818CF8" />
                      <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#FFF' }}>{tbl.name}</span>
                    </div>
                    <span className="badge badge-primary">
                      {tbl.rowCount} rows
                    </span>
                  </div>

                  {/* Columns list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '220px', overflowY: 'auto' }}>
                    {tbl.columns.map(c => (
                      <div 
                        key={c.cid} 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.8rem',
                          padding: '0.3rem 0.5rem',
                          background: 'rgba(255, 255, 255, 0.02)',
                          borderRadius: '4px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {c.isPk && <Key size={13} color="#FBBF24" title="Primary Key" />}
                          <span style={{ fontWeight: c.isPk ? 700 : 500, color: c.isPk ? '#FBBF24' : '#FFF' }}>
                            {c.name}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{c.type}</span>
                          {c.notNull && <span style={{ color: '#EF4444', fontSize: '0.7rem' }}>NOT NULL</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Foreign Keys */}
                  {tbl.foreignKeys && tbl.foreignKeys.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>
                        Foreign Keys
                      </div>
                      {tbl.foreignKeys.map((fk, idx) => (
                        <div key={idx} style={{ fontSize: '0.75rem', color: '#34D399' }}>
                          ↳ <code>{fk.from}</code> references <code>{fk.table}({fk.to})</code>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Query shortcut */}
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => {
                        setQuery(`SELECT * FROM "${tbl.name}" LIMIT 25;`);
                        setActiveTab('console');
                        handleExecute(`SELECT * FROM "${tbl.name}" LIMIT 25;`);
                      }}
                      className="btn btn-outline btn-sm"
                    >
                      <Terminal size={13} /> SELECT * FROM {tbl.name}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
