import React, { useState, useEffect } from 'react';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle, 
  ShieldCheck, 
  ExternalLink,
  Sparkles
} from 'lucide-react';

export default function Profile({ 
  currentUser, 
  masterSkills = [],
  onUpdateStudentProfile, 
  onUpdateAlumniProfile, 
  onUpdateSkills 
}) {
  const isStudent = currentUser?.role === 'student';
  const isAlumni = currentUser?.role === 'alumni';

  // Core & Profile Form State
  const [formData, setFormData] = useState({
    firstName: currentUser?.first_name || '',
    lastName: currentUser?.last_name || '',
    headline: currentUser?.headline || '',
    // Student fields
    degree: currentUser?.profile?.degree || '',
    fieldOfStudy: currentUser?.profile?.field_of_study || '',
    institution: currentUser?.profile?.institution || 'Apex University Institute of Technology',
    expectedGraduationYear: currentUser?.profile?.expected_graduation_year || 2026,
    gpa: currentUser?.profile?.gpa || '',
    bio: currentUser?.profile?.bio || '',
    careerInterests: currentUser?.profile?.career_interests || '',
    targetIndustries: currentUser?.profile?.target_industries || '',
    linkedinUrl: currentUser?.profile?.linkedin_url || '',
    githubUrl: currentUser?.profile?.github_url || '',
    portfolioUrl: currentUser?.profile?.portfolio_url || '',
    // Alumni fields
    currentCompany: currentUser?.profile?.current_company || '',
    currentPosition: currentUser?.profile?.current_position || '',
    industry: currentUser?.profile?.industry || '',
    graduationYear: currentUser?.profile?.graduation_year || 2020,
    yearsExperience: currentUser?.profile?.years_experience || 0,
    maxMentees: currentUser?.profile?.max_mentees || 3,
    isAvailableForMentorship: currentUser?.profile?.is_available_for_mentorship ?? true,
    mentorshipTopics: currentUser?.profile?.mentorship_topics || '',
    personalWebsite: currentUser?.profile?.personal_website || ''
  });

  // Skills State
  const [skills, setSkills] = useState(currentUser?.skills || []);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Intermediate');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser?.profile) {
      setFormData(prev => ({
        ...prev,
        firstName: currentUser.first_name || '',
        lastName: currentUser.last_name || '',
        headline: currentUser.headline || '',
        ...currentUser.profile
      }));
    }
    if (currentUser?.skills) {
      setSkills(currentUser.skills);
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const existing = skills.find(s => s.name.toLowerCase() === newSkillName.trim().toLowerCase());
    if (existing) {
      alert('Skill already added.');
      return;
    }
    setSkills(prev => [...prev, { name: newSkillName.trim(), proficiency_level: newSkillLevel }]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (index) => {
    setSkills(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      if (isStudent) {
        await onUpdateStudentProfile(formData);
      } else if (isAlumni) {
        await onUpdateAlumniProfile(formData);
      }

      await onUpdateSkills(skills);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save profile changes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '960px', margin: '0 auto' }}>
      {/* Profile Header Card */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <img
            src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
            alt={currentUser?.first_name}
            style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(99, 102, 241, 0.5)' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFF' }}>
                {currentUser?.first_name} {currentUser?.last_name}
              </h1>
              {isAlumni && (
                <span className={`badge ${currentUser?.verificationStatus === 'verified' ? 'badge-verified' : 'badge-pending'}`}>
                  {currentUser?.verificationStatus === 'verified' ? 'Verified Mentor' : 'Pending Verification'}
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#A5B4FC', marginTop: '0.2rem' }}>
              {currentUser?.headline || `${isAlumni ? 'Alumni' : 'Student'} Profile`}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.1rem' }}>
              {currentUser?.email}
            </div>
          </div>
        </div>

        {saveSuccess && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34D399', fontSize: '0.9rem', fontWeight: 600 }}>
            <CheckCircle size={18} /> Profile changes saved!
          </div>
        )}
      </div>

      {/* Main Edit Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Basic Personal Info */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', color: '#FFF' }}>
            Basic Information
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>Headline</label>
            <input
              type="text"
              name="headline"
              placeholder="e.g. Senior CS Student @ Apex | Cloud Systems Enthusiast"
              value={formData.headline}
              onChange={handleInputChange}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>Bio / Overview</label>
            <textarea
              name="bio"
              rows={4}
              placeholder="Tell others about your background, career aspirations, and mentorship interests..."
              value={formData.bio}
              onChange={handleInputChange}
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>
        </div>

        {/* Role Specific Section: Student */}
        {isStudent && (
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', color: '#FFF' }}>
              Academic & Career Interests
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>Degree</label>
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
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>Field of Study</label>
                <input
                  type="text"
                  name="fieldOfStudy"
                  placeholder="e.g. Software Engineering"
                  value={formData.fieldOfStudy}
                  onChange={handleInputChange}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>Expected Graduation</label>
                <input
                  type="number"
                  name="expectedGraduationYear"
                  value={formData.expectedGraduationYear}
                  onChange={handleInputChange}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>Cumulative GPA</label>
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>Career Interests</label>
                <input
                  type="text"
                  name="careerInterests"
                  placeholder="e.g. Distributed Systems, Cloud Architecture, DevOps"
                  value={formData.careerInterests}
                  onChange={handleInputChange}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>Target Industries</label>
                <input
                  type="text"
                  name="targetIndustries"
                  placeholder="e.g. Technology & Cloud, FinTech, AI"
                  value={formData.targetIndustries}
                  onChange={handleInputChange}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>LinkedIn URL</label>
                <input
                  type="url"
                  name="linkedinUrl"
                  placeholder="https://linkedin.com/in/..."
                  value={formData.linkedinUrl}
                  onChange={handleInputChange}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>GitHub URL</label>
                <input
                  type="url"
                  name="githubUrl"
                  placeholder="https://github.com/..."
                  value={formData.githubUrl}
                  onChange={handleInputChange}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Role Specific Section: Alumni */}
        {isAlumni && (
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', color: '#FFF' }}>
              Professional Experience & Mentorship Preferences
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>Current Company / Organization</label>
                <input
                  type="text"
                  name="currentCompany"
                  placeholder="e.g. Google, Stripe, Goldman Sachs"
                  value={formData.currentCompany}
                  onChange={handleInputChange}
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>Job Title / Position</label>
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
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>Industry Domain</label>
                <input
                  type="text"
                  name="industry"
                  placeholder="e.g. Technology & Cloud"
                  value={formData.industry}
                  onChange={handleInputChange}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>Years of Experience</label>
                <input
                  type="number"
                  name="yearsExperience"
                  value={formData.yearsExperience}
                  onChange={handleInputChange}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>Apex Graduation Year</label>
                <input
                  type="number"
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleInputChange}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>Max Active Mentees</label>
                <input
                  type="number"
                  name="maxMentees"
                  value={formData.maxMentees}
                  onChange={handleInputChange}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>Mentorship Topics</label>
              <input
                type="text"
                name="mentorshipTopics"
                placeholder="e.g. System Design, Mock Interviews, Resume Review, Breaking into Big Tech"
                value={formData.mentorshipTopics}
                onChange={handleInputChange}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  name="isAvailableForMentorship"
                  checked={Boolean(formData.isAvailableForMentorship)}
                  onChange={handleInputChange}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                />
                <span style={{ color: '#FFF', fontWeight: 600 }}>Currently accepting new student mentorship requests</span>
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>LinkedIn URL</label>
                <input
                  type="url"
                  name="linkedinUrl"
                  placeholder="https://linkedin.com/in/..."
                  value={formData.linkedinUrl}
                  onChange={handleInputChange}
                  style={{ width: '100%' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.35rem' }}>Personal Website</label>
                <input
                  type="url"
                  name="personalWebsite"
                  placeholder="https://..."
                  value={formData.personalWebsite}
                  onChange={handleInputChange}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Skills Management Section */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#FFF' }}>
            Technical & Professional Skills
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Skills are used by our AI matching index to recommend compatible mentors and mentees.
          </p>

          {/* Current Skills Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {skills.map((s, index) => (
              <div
                key={index}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: '#FFF',
                  fontSize: '0.85rem'
                }}
              >
                <span>{s.name}</span>
                <span style={{ fontSize: '0.7rem', color: '#A5B4FC', background: 'rgba(0,0,0,0.3)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                  {s.proficiency_level || 'Intermediate'}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(index)}
                  style={{ background: 'none', color: '#F87171', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title="Remove skill"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* Add Skill Form */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Add skill (e.g. Distributed Systems, React, Python)..."
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              style={{ flex: 1, minWidth: '200px' }}
            />
            <select
              value={newSkillLevel}
              onChange={(e) => setNewSkillLevel(e.target.value)}
              style={{ minWidth: '140px' }}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
            <button
              type="button"
              onClick={handleAddSkill}
              className="btn btn-secondary"
            >
              <Plus size={16} /> Add Skill
            </button>
          </div>
        </div>

        {/* Submit Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-primary"
            style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}
          >
            <Save size={18} /> {isSaving ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
