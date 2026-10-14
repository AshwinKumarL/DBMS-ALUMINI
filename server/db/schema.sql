-- ========================================================
-- Alumni–Student Mentorship and Networking Application
-- SQLite Relational Database Schema
-- ========================================================

PRAGMA foreign_keys = ON;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'alumni', 'admin')),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    avatar_url TEXT,
    headline TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Student Profiles Table
CREATE TABLE IF NOT EXISTS student_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    degree TEXT NOT NULL,
    field_of_study TEXT NOT NULL,
    institution TEXT NOT NULL DEFAULT 'Apex University Institute of Technology',
    expected_graduation_year INTEGER NOT NULL,
    gpa REAL,
    bio TEXT,
    career_interests TEXT, -- Comma-separated or descriptive keywords
    target_industries TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Alumni Profiles Table
CREATE TABLE IF NOT EXISTS alumni_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    current_company TEXT NOT NULL,
    current_position TEXT NOT NULL,
    industry TEXT NOT NULL,
    degree TEXT NOT NULL,
    field_of_study TEXT NOT NULL,
    graduation_year INTEGER NOT NULL,
    years_experience INTEGER NOT NULL DEFAULT 0,
    bio TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    personal_website TEXT,
    max_mentees INTEGER NOT NULL DEFAULT 3,
    is_available_for_mentorship INTEGER NOT NULL DEFAULT 1,
    mentorship_topics TEXT, -- e.g. "Resume Review, Mock Interviews, System Design"
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK(verification_status IN ('pending', 'verified', 'rejected')),
    verified_at DATETIME,
    verified_by INTEGER,
    rejection_reason TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Skills Master Table
CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL COLLATE NOCASE,
    category TEXT NOT NULL DEFAULT 'Technical',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. User Skills (Junction Table: Users <-> Skills)
CREATE TABLE IF NOT EXISTS user_skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    skill_id INTEGER NOT NULL,
    proficiency_level TEXT DEFAULT 'Intermediate' CHECK(proficiency_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    UNIQUE(user_id, skill_id)
);

-- 6. Mentorship Requests Table
CREATE TABLE IF NOT EXISTS mentorship_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    alumni_id INTEGER NOT NULL,
    topic TEXT NOT NULL,
    goals TEXT,
    preferred_schedule TEXT,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined', 'cancelled', 'completed')),
    response_note TEXT,
    responded_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (alumni_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Mentorship Sessions Table
CREATE TABLE IF NOT EXISTS mentorship_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    request_id INTEGER,
    student_id INTEGER NOT NULL,
    alumni_id INTEGER NOT NULL,
    topic TEXT NOT NULL,
    scheduled_at DATETIME NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 45,
    meeting_link TEXT,
    location_type TEXT NOT NULL DEFAULT 'virtual' CHECK(location_type IN ('virtual', 'in-person', 'phone')),
    agenda TEXT,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES mentorship_requests(id) ON DELETE SET NULL,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (alumni_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Session Feedback and Ratings Table
CREATE TABLE IF NOT EXISTS session_feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER UNIQUE NOT NULL,
    student_id INTEGER NOT NULL,
    alumni_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    tags TEXT, -- e.g. "Actionable, Inspiring, Technical Depth, Resume Tips"
    is_public INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES mentorship_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (alumni_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. Professional Connections Table
CREATE TABLE IF NOT EXISTS connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requester_id INTEGER NOT NULL,
    addressee_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'declined', 'blocked')),
    note TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (addressee_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(requester_id, addressee_id)
);

-- 10. Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    read_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 11. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('mentorship_request', 'mentorship_accepted', 'mentorship_declined', 'session_scheduled', 'session_completed', 'connection_request', 'connection_accepted', 'new_message', 'profile_verified', 'profile_rejected', 'system_alert')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 12. Moderation Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reporter_id INTEGER NOT NULL,
    reported_user_id INTEGER NOT NULL,
    reason TEXT NOT NULL CHECK(reason IN ('inappropriate_behavior', 'spam', 'harassment', 'unprofessional', 'fake_profile', 'other')),
    details TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    resolution_notes TEXT,
    resolved_by INTEGER,
    resolved_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_alumni_industry ON alumni_profiles(industry);
CREATE INDEX IF NOT EXISTS idx_alumni_company ON alumni_profiles(current_company);
CREATE INDEX IF NOT EXISTS idx_alumni_grad_year ON alumni_profiles(graduation_year);
CREATE INDEX IF NOT EXISTS idx_alumni_verification ON alumni_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill ON user_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_req_student ON mentorship_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_req_alumni ON mentorship_requests(alumni_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_req_status ON mentorship_requests(status);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled_at ON mentorship_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_connections_users ON connections(requester_id, addressee_id, status);
