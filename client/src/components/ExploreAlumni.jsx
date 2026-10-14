import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  Star, 
  Briefcase, 
  GraduationCap, 
  MessageSquare, 
  UserPlus, 
  Sparkles, 
  SlidersHorizontal,
  ExternalLink,
  ChevronDown,
  Check
} from 'lucide-react';

export default function ExploreAlumni({ 
  alumniList = [], 
  filterOptions = {}, 
  currentUser,
  onSearch,
  onOpenRequestModal,
  onOpenProfileModal,
  onSendConnectionRequest,
  onStartMessage
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('match');

  const handleFilterChange = (updates = {}) => {
    const params = {
      q: updates.searchTerm !== undefined ? updates.searchTerm : searchTerm,
      industry: updates.selectedIndustry !== undefined ? updates.selectedIndustry : selectedIndustry,
      company: updates.selectedCompany !== undefined ? updates.selectedCompany : selectedCompany,
      skill: updates.selectedSkill !== undefined ? updates.selectedSkill : selectedSkill,
      availability: (updates.availableOnly !== undefined ? updates.availableOnly : availableOnly) ? 'available' : 'all',
      verifiedOnly: (updates.verifiedOnly !== undefined ? updates.verifiedOnly : verifiedOnly) ? 'true' : 'false',
      sortBy: updates.sortBy !== undefined ? updates.sortBy : sortBy
    };
    onSearch(params);
  };

  const industries = filterOptions.industries || [];
  const companies = filterOptions.companies || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Title & Filter Bar */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sparkles size={24} color="#818CF8" />
              Explore Alumni Mentors
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              Discover industry veterans, request 1-on-1 mentorship sessions, and build lifelong professional connections.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                handleFilterChange({ sortBy: e.target.value });
              }}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}
            >
              <option value="match">Best Match Score</option>
              <option value="rating">Highest Rated ⭐</option>
              <option value="experience">Years of Experience</option>
              <option value="graduationYear">Graduation Year</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <Search 
            size={18} 
            color="var(--text-dim)" 
            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} 
          />
          <input
            type="text"
            placeholder="Search by name, position, company, technical domain, or mentorship topic..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              handleFilterChange({ searchTerm: e.target.value });
            }}
            style={{
              width: '100%',
              paddingLeft: '2.75rem',
              paddingRight: '1rem',
              height: '46px',
              fontSize: '0.95rem'
            }}
          />
        </div>

        {/* Filter Controls Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
          {/* Industry Filter */}
          <div style={{ minWidth: '180px', flex: 1 }}>
            <select
              value={selectedIndustry}
              onChange={(e) => {
                setSelectedIndustry(e.target.value);
                handleFilterChange({ selectedIndustry: e.target.value });
              }}
              style={{ width: '100%' }}
            >
              <option value="all">All Industries</option>
              {industries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          {/* Company Filter */}
          <div style={{ minWidth: '160px', flex: 1 }}>
            <select
              value={selectedCompany}
              onChange={(e) => {
                setSelectedCompany(e.target.value);
                handleFilterChange({ selectedCompany: e.target.value });
              }}
              style={{ width: '100%' }}
            >
              <option value="all">All Organizations</option>
              {companies.map(comp => (
                <option key={comp} value={comp}>{comp}</option>
              ))}
            </select>
          </div>

          {/* Skill Filter */}
          <div style={{ minWidth: '160px', flex: 1 }}>
            <select
              value={selectedSkill}
              onChange={(e) => {
                setSelectedSkill(e.target.value);
                handleFilterChange({ selectedSkill: e.target.value });
              }}
              style={{ width: '100%' }}
            >
              <option value="all">All Technical Skills</option>
              <option value="System Design">System Design</option>
              <option value="Python">Python</option>
              <option value="Machine Learning">Machine Learning</option>
              <option value="Product Management">Product Management</option>
              <option value="AWS Cloud">AWS Cloud</option>
              <option value="SQL">SQL & Database Design</option>
              <option value="Financial Modeling">Financial Modeling</option>
            </select>
          </div>

          {/* Available Only Checkbox */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => {
                setAvailableOnly(e.target.checked);
                handleFilterChange({ availableOnly: e.target.checked });
              }}
              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
            />
            <span style={{ color: 'var(--text-muted)' }}>Available Only</span>
          </label>

          {/* Verified Only Checkbox */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', cursor: 'pointer', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => {
                setVerifiedOnly(e.target.checked);
                handleFilterChange({ verifiedOnly: e.target.checked });
              }}
              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
            />
            <span style={{ color: 'var(--text-muted)' }}>Verified Mentors Only</span>
          </label>
        </div>
      </div>

      {/* Directory Count Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.25rem' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Showing <strong>{alumniList.length}</strong> alumni mentors
        </span>
      </div>

      {/* Alumni Cards Grid */}
      {alumniList.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
          <Search size={42} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Alumni Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
            No mentors match your current search and filter combination. Try clearing your filters or using broader search terms.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedIndustry('all');
              setSelectedCompany('all');
              setSelectedSkill('all');
              setAvailableOnly(false);
              setVerifiedOnly(false);
              handleFilterChange({
                searchTerm: '',
                selectedIndustry: 'all',
                selectedCompany: 'all',
                selectedSkill: 'all',
                availableOnly: false,
                verifiedOnly: false
              });
            }}
            className="btn btn-secondary btn-sm"
            style={{ marginTop: '1.25rem' }}
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '1.5rem'
        }}>
          {alumniList.map(alumni => {
            const isSelf = currentUser?.id === alumni.userId;
            const isStudent = currentUser?.role === 'student';

            return (
              <div 
                key={alumni.userId}
                className="glass-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Top Bar: Avatar, Info, Badges */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.85rem' }}>
                      <img
                        src={alumni.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={alumni.firstName}
                        style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }}
                      />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF' }}>
                            {alumni.firstName} {alumni.lastName}
                          </h3>
                          {alumni.verificationStatus === 'verified' && (
                            <span title="Verified Alumni Mentor">
                              <CheckCircle size={16} color="#34D399" />
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#A5B4FC', marginTop: '0.1rem' }}>
                          {alumni.currentPosition}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.1rem' }}>
                          {alumni.currentCompany}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                      {alumni.matchScore && isStudent && (
                        <span className="badge badge-match" title="AI Match Compatibility Index">
                          {alumni.matchScore}% Match
                        </span>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: '#FBBF24', fontWeight: 700 }}>
                        <Star size={13} fill="#FBBF24" />
                        <span>{alumni.avgRating || 5.0}</span>
                        <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>({alumni.reviewCount || 0})</span>
                      </div>
                    </div>
                  </div>

                  {/* Academic & Professional Meta */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.75rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    background: 'rgba(0,0,0,0.2)',
                    padding: '0.6rem 0.8rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '0.9rem'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <GraduationCap size={14} color="#818CF8" />
                      Class of {alumni.graduationYear} ({alumni.fieldOfStudy})
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Briefcase size={14} color="#14B8A6" />
                      {alumni.yearsExperience} yrs exp • {alumni.industry}
                    </span>
                  </div>

                  {/* Bio snippet */}
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: '0.9rem' }}>
                    {alumni.bio ? (alumni.bio.length > 150 ? alumni.bio.substring(0, 147) + '...' : alumni.bio) : 'Experienced industry professional eager to guide students.'}
                  </p>

                  {/* Mentorship Focus Topics */}
                  {alumni.mentorshipTopics && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.25rem' }}>
                        Mentorship Topics
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#E2E8F0', fontStyle: 'italic' }}>
                        "{alumni.mentorshipTopics}"
                      </div>
                    </div>
                  )}

                  {/* Skills Pills */}
                  {alumni.skills && alumni.skills.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
                      {alumni.skills.slice(0, 4).map(skill => (
                        <span 
                          key={skill.id}
                          style={{
                            fontSize: '0.7rem',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '4px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-subtle)'
                          }}
                        >
                          {skill.name}
                        </span>
                      ))}
                      {alumni.skills.length > 4 && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', alignSelf: 'center' }}>
                          +{alumni.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Actions Bottom Bar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.9rem'
                }}>
                  {isStudent && !isSelf && (
                    <button
                      onClick={() => onOpenRequestModal(alumni)}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                    >
                      Request Mentorship
                    </button>
                  )}

                  {!isSelf && (
                    <button
                      onClick={() => onSendConnectionRequest(alumni.userId)}
                      className="btn btn-secondary btn-sm"
                      title="Connect professionally"
                    >
                      <UserPlus size={14} />
                      Connect
                    </button>
                  )}

                  {!isSelf && (
                    <button
                      onClick={() => onStartMessage(alumni.userId)}
                      className="btn btn-secondary btn-sm"
                      title="Send a direct message"
                    >
                      <MessageSquare size={14} />
                    </button>
                  )}

                  <button
                    onClick={() => onOpenProfileModal(alumni.userId)}
                    className="btn btn-outline btn-sm"
                  >
                    View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
