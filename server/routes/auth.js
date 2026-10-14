const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { generateToken, authenticate } = require('../middleware/auth');

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const {
            email,
            password,
            role,
            firstName,
            lastName,
            headline,
            // Student specific fields
            degree,
            fieldOfStudy,
            institution,
            expectedGraduationYear,
            careerInterests,
            // Alumni specific fields
            currentCompany,
            currentPosition,
            industry,
            graduationYear,
            yearsExperience,
            mentorshipTopics
        } = req.body;

        if (!email || !password || !role || !firstName || !lastName) {
            return res.status(400).json({ error: 'Email, password, role, first name, and last name are required.' });
        }

        if (!['student', 'alumni'].includes(role)) {
            return res.status(400).json({ error: 'Role must be either "student" or "alumni".' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
        }

        // Check if email already exists
        const existing = db.get('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
        if (existing) {
            return res.status(409).json({ error: 'An account with this email address already exists.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const normalizedEmail = email.trim().toLowerCase();

        const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + ' ' + lastName)}&background=4f46e5&color=fff&size=256`;

        let newUserId;
        db.transaction((tx) => {
            const userResult = tx.run(
                `INSERT INTO users (email, password_hash, role, first_name, last_name, avatar_url, headline, is_active)
                 VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
                [normalizedEmail, passwordHash, role, firstName.trim(), lastName.trim(), defaultAvatar, headline || '']
            );
            newUserId = Number(userResult.lastInsertRowid);

            if (role === 'student') {
                tx.run(
                    `INSERT INTO student_profiles (
                        user_id, degree, field_of_study, institution, expected_graduation_year, career_interests
                    ) VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        newUserId,
                        degree || 'B.S. in Computer Science',
                        fieldOfStudy || 'Computer Science',
                        institution || 'Apex University Institute of Technology',
                        expectedGraduationYear ? Number(expectedGraduationYear) : 2026,
                        careerInterests || 'Software Engineering'
                    ]
                );
            } else if (role === 'alumni') {
                tx.run(
                    `INSERT INTO alumni_profiles (
                        user_id, current_company, current_position, industry, degree, field_of_study,
                        graduation_year, years_experience, mentorship_topics, verification_status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
                    [
                        newUserId,
                        currentCompany || 'Independent Professional',
                        currentPosition || 'Specialist',
                        industry || 'Technology & Cloud',
                        degree || 'B.S. in Computer Science',
                        fieldOfStudy || 'Computer Science',
                        graduationYear ? Number(graduationYear) : 2020,
                        yearsExperience ? Number(yearsExperience) : 3,
                        mentorshipTopics || 'Career Guidance, Industry Insights'
                    ]
                );

                // Create admin notification about pending alumni verification
                const admins = db.query("SELECT id FROM users WHERE role = 'admin'");
                for (const admin of admins) {
                    tx.run(
                        `INSERT INTO notifications (user_id, type, title, message, link)
                         VALUES (?, 'profile_verified', 'New Alumni Registration', ?, '/admin')`,
                        [admin.id, `${firstName} ${lastName} (${currentCompany || 'Alumni'}) registered and needs verification.`]
                    );
                }
            }
        });

        const newUser = db.get('SELECT id, email, role, first_name, last_name, avatar_url, headline FROM users WHERE id = ?', [newUserId]);
        const token = generateToken(newUser);

        return res.status(201).json({
            message: 'Registration successful!',
            token,
            user: newUser
        });
    } catch (err) {
        console.error('[Auth Register Error]', err);
        return res.status(500).json({ error: 'Internal server error while registering user.' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = db.get('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        if (!user.is_active) {
            return res.status(403).json({ error: 'Your account is currently deactivated. Please contact an administrator.' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        delete user.password_hash;
        const token = generateToken(user);

        return res.json({
            message: 'Login successful!',
            token,
            user
        });
    } catch (err) {
        console.error('[Auth Login Error]', err);
        return res.status(500).json({ error: 'Internal server error during login.' });
    }
});

// Get current authenticated user details
router.get('/me', authenticate, (req, res) => {
    try {
        const userId = req.user.id;
        let profile = null;
        let verificationStatus = null;

        if (req.user.role === 'student') {
            profile = db.get('SELECT * FROM student_profiles WHERE user_id = ?', [userId]);
        } else if (req.user.role === 'alumni') {
            profile = db.get('SELECT * FROM alumni_profiles WHERE user_id = ?', [userId]);
            if (profile) {
                verificationStatus = profile.verification_status;
            }
        }

        // Get user skills
        const skills = db.query(
            `SELECT s.id, s.name, s.category, us.proficiency_level
             FROM user_skills us
             JOIN skills s ON us.skill_id = s.id
             WHERE us.user_id = ?`,
            [userId]
        );

        // Get unread notification count
        const unreadNotifs = db.get(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
            [userId]
        );

        // Get unread messages count
        const unreadMsgs = db.get(
            'SELECT COUNT(*) as count FROM messages WHERE recipient_id = ? AND is_read = 0',
            [userId]
        );

        return res.json({
            user: {
                ...req.user,
                verificationStatus,
                profile,
                skills,
                unreadNotificationsCount: unreadNotifs ? unreadNotifs.count : 0,
                unreadMessagesCount: unreadMsgs ? unreadMsgs.count : 0
            }
        });
    } catch (err) {
        console.error('[Auth Me Error]', err);
        return res.status(500).json({ error: 'Failed to retrieve user profile.' });
    }
});

// Demo Persona Quick-Switch
// Enables 1-click role and user testing
router.post('/demo-login', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Demo email is required.' });
        }

        const user = db.get('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
        if (!user) {
            return res.status(404).json({ error: `Demo user ${email} not found.` });
        }

        delete user.password_hash;
        const token = generateToken(user);

        return res.json({
            message: `Switched to demo persona: ${user.first_name} ${user.last_name} (${user.role})`,
            token,
            user
        });
    } catch (err) {
        console.error('[Demo Login Error]', err);
        return res.status(500).json({ error: 'Failed to switch demo persona.' });
    }
});

module.exports = router;
