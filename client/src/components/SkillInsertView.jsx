import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Layers, 
  CheckCircle, 
  AlertCircle, 
  Trash2, 
  Plus, 
  Search,
  Tag,
  Code
} from 'lucide-react';

export default function SkillInsertView({ onSkillInserted }) {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Technical'
  });

  const [executing, setExecuting] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await api.getSkills();
      setSkills(res.skills || []);
    } catch (err) {
      console.error('Failed to load skills', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter a Skill Name.');
      return;
    }

    setExecuting(true);
    setResultMessage(null);
    setErrorMessage(null);

    try {
      const res = await api.insertSkill(formData);
      setResultMessage(res.message);
      // Reset form
      setFormData({
        name: '',
        category: 'Technical'
      });

      fetchSkills();
      if (onSkillInserted) onSkillInserted();
    } catch (err) {
      setErrorMessage(err.data?.error || err.message || 'Failed to insert skill into database.');
    } finally {
      setExecuting(false);
    }
  };

  const handleDelete = async (skillId, skillName) => {
    if (!confirm(`Are you sure you want to delete Skill #${skillId} ("${skillName}") from the database?`)) return;
    try {
      const res = await api.deleteSkill(skillId);
      alert(res.message);
      fetchSkills();
      if (onSkillInserted) onSkillInserted();
    } catch (err) {
      alert(err.message || 'Failed to delete skill.');
    }
  };

  const filteredSkills = skills.filter(s => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (s.name && s.name.toLowerCase().includes(term)) ||
      (s.category && s.category.toLowerCase().includes(term))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1300px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Layers size={26} color="#A78BFA" />
            Skills Master Insert & Table Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Insert and manage master domain competencies and technical skills in <code>skills</code> table.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="badge badge-primary" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>
            {skills.length} Master Skills
          </span>
        </div>
      </div>

      {/* Insert Form Card */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#FFF', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Tag size={20} color="#A78BFA" /> New Skill Entry Form
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Skill Name (Unique constraint) *</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Distributed Database Systems, Rust, GraphQL"
                value={formData.name}
                onChange={handleInputChange}
                required
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.25rem' }}>Domain Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                style={{ width: '100%', height: '42px' }}
              >
                <option value="Technical">Technical</option>
                <option value="DevOps">DevOps & Infrastructure</option>
                <option value="Cloud">Cloud Architecture</option>
                <option value="Data & AI">Data Science & AI</option>
                <option value="Product">Product Management</option>
                <option value="Finance">Finance & Fintech</option>
                <option value="Management">Management & Leadership</option>
                <option value="Healthcare">Healthcare & BioTech</option>
                <option value="Mentorship">Mentorship & Career Strategy</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button
              type="submit"
              disabled={executing}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.75rem', background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}
            >
              <Plus size={16} /> {executing ? 'Inserting Skill...' : 'Insert Skill Record'}
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

      {/* Existing Skills Data Table */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Code size={20} color="#A78BFA" /> Master Skills Database Records
            </h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
              Current rows in <code>skills</code> table
            </p>
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search skills..."
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
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Skill Name</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Domain Category</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>Created At</th>
                <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSkills.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                    No skill records found matching "{searchTerm}".
                  </td>
                </tr>
              ) : (
                filteredSkills.map(sk => (
                  <tr 
                    key={sk.id}
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-dim)' }}>#{sk.id}</td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#FFF' }}>
                      {sk.name}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <span className="badge badge-primary" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#C4B5FD', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                        {sk.category}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--text-dim)' }}>{sk.created_at || 'System Default'}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDelete(sk.id, sk.name)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#F87171', borderColor: 'rgba(239, 68, 68, 0.3)', padding: '0.3rem 0.6rem' }}
                        title="Delete Skill from Database"
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
