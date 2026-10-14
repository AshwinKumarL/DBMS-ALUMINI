const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

// Get all master skills
router.get('/skills', (req, res) => {
    try {
        const skills = db.query('SELECT * FROM skills ORDER BY category, name ASC');
        return res.json({ skills });
    } catch (err) {
        console.error('[Get Skills Error]', err);
        return res.status(500).json({ error: 'Failed to retrieve skills list.' });
    }
});

// Direct Skill Insert (DBMS)
router.post('/skills/insert', (req, res) => {
    try {
        const { name, category } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Skill name is required.' });
        }
        const skillName = name.trim();
        const skillCat = (category && category.trim()) || 'Technical';

        // Check if exists
        const existing = db.get('SELECT * FROM skills WHERE LOWER(name) = LOWER(?)', [skillName]);
        if (existing) {
            return res.status(400).json({ error: `Skill "${skillName}" already exists in the database.` });
        }

        const insert = db.run('INSERT INTO skills (name, category) VALUES (?, ?)', [skillName, skillCat]);
        const newSkill = db.get('SELECT * FROM skills WHERE id = ?', [Number(insert.lastInsertRowid)]);
        return res.status(201).json({
            success: true,
            message: `Skill #${newSkill.id} (${newSkill.name}) successfully inserted into skills table.`,
            skill: newSkill
        });
    } catch (err) {
        console.error('[Insert Skill Error]', err);
        return res.status(500).json({ error: 'Failed to insert skill: ' + err.message });
    }
});

// Direct Skill Delete (DBMS)
router.delete('/skills/:id', (req, res) => {
    try {
        const skillId = Number(req.params.id);
        const skill = db.get('SELECT * FROM skills WHERE id = ?', [skillId]);
        if (!skill) {
            return res.status(404).json({ error: 'Skill record not found.' });
        }
        db.run('DELETE FROM skills WHERE id = ?', [skillId]);
        return res.json({
            success: true,
            message: `Skill #${skillId} (${skill.name}) deleted successfully from database.`
        });
    } catch (err) {
        console.error('[Delete Skill Error]', err);
        return res.status(500).json({ error: 'Failed to delete skill: ' + err.message });
    }
});

// Get all student records
router.get('/students', (req, res) => {
    try {
        const students = db.query(`
            SELECT 
                u.id as user_id,
                u.first_name,
                u.last_name,
                u.email,
                u.avatar_url,
                u.headline,
                s.degree,
                s.field_of_study,
                s.institution,
                s.expected_graduation_year,
                s.gpa,
                s.career_interests,
                s.target_industries,
                s.linkedin_url,
                s.github_url
            FROM users u
            JOIN student_profiles s ON u.id = s.user_id
            WHERE u.is_active = 1
            ORDER BY s.expected_graduation_year ASC, u.first_name ASC
        `);
        return res.json({ students });
    } catch (err) {
        console.error('[Get Students Error]', err);
        return res.status(500).json({ error: 'Failed to retrieve students.' });
    }
});

// Insert a new Student record (DBMS Operation)
router.post('/students', (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            headline,
            degree,
            fieldOfStudy,
            institution,
            expectedGraduationYear,
            gpa,
            careerInterests,
            targetIndustries,
            linkedinUrl,
            githubUrl
        } = req.body;

        if (!firstName || !lastName || !email) {
            return res.status(400).json({ error: 'First name, last name, and email are required fields.' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existing = db.get('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
        if (existing) {
            return res.status(409).json({ error: 'A user with this email address already exists.' });
        }

        const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + ' ' + lastName)}&background=6366f1&color=fff&size=256`;
        const dummyHash = '$2a$10$wT8BfZfXz6R8B3i7G4I2CeH3Z8X6Y4W2U0S9Q8O7M6K5J4H3G2F1E';

        let insertedUserId;
        db.transaction((tx) => {
            const userResult = tx.run(
                `INSERT INTO users (email, password_hash, role, first_name, last_name, avatar_url, headline, is_active)
                 VALUES (?, ?, 'student', ?, ?, ?, ?, 1)`,
                [
                    normalizedEmail,
                    dummyHash,
                    firstName.trim(),
                    lastName.trim(),
                    defaultAvatar,
                    headline || `Student at ${institution || 'Apex University'}`
                ]
            );
            insertedUserId = Number(userResult.lastInsertRowid);

            tx.run(
                `INSERT INTO student_profiles (
                    user_id, degree, field_of_study, institution, expected_graduation_year,
                    gpa, career_interests, target_industries, linkedin_url, github_url
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    insertedUserId,
                    degree || 'B.S. in Computer Science',
                    fieldOfStudy || 'Computer Science',
                    institution || 'Apex University Institute of Technology',
                    expectedGraduationYear ? Number(expectedGraduationYear) : 2026,
                    gpa ? Number(gpa) : 3.80,
                    careerInterests || 'Software Engineering',
                    targetIndustries || 'Technology & Cloud',
                    linkedinUrl || null,
                    githubUrl || null
                ]
            );
        });

        const createdStudent = db.get(`
            SELECT u.id as user_id, u.first_name, u.last_name, u.email, u.headline,
                   s.degree, s.field_of_study, s.institution, s.expected_graduation_year, s.gpa,
                   s.career_interests, s.target_industries
            FROM users u
            JOIN student_profiles s ON u.id = s.user_id
            WHERE u.id = ?
        `, [insertedUserId]);

        return res.status(201).json({
            success: true,
            message: `Student record #${insertedUserId} (${firstName} ${lastName}) successfully inserted into SQL database.`,
            student: createdStudent
        });
    } catch (err) {
        console.error('[Insert Student Error]', err);
        return res.status(500).json({ error: err.message || 'Failed to insert student record.' });
    }
});

// Delete a Student record (DBMS Operation with CASCADE)
router.delete('/students/:id', (req, res) => {
    try {
        const userId = Number(req.params.id);
        const existing = db.get('SELECT id, first_name, last_name FROM users WHERE id = ? AND role = "student"', [userId]);
        if (!existing) {
            return res.status(404).json({ error: 'Student record not found.' });
        }

        db.run('DELETE FROM users WHERE id = ?', [userId]);

        return res.json({
            success: true,
            message: `Student record #${userId} (${existing.first_name} ${existing.last_name}) deleted from SQL database.`
        });
    } catch (err) {
        console.error('[Delete Student Error]', err);
        return res.status(500).json({ error: err.message || 'Failed to delete student record.' });
    }
});



// Get public profile of any user by ID
router.get('/profile/:id', (req, res) => {
    try {
        const userId = Number(req.params.id);
        const user = db.get(
            'SELECT id, role, first_name, last_name, avatar_url, headline, is_active, created_at FROM users WHERE id = ?',
            [userId]
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        let profile = null;
        if (user.role === 'student') {
            profile = db.get('SELECT * FROM student_profiles WHERE user_id = ?', [userId]);
        } else if (user.role === 'alumni') {
            profile = db.get('SELECT * FROM alumni_profiles WHERE user_id = ?', [userId]);
        }

        const skills = db.query(
            `SELECT s.id, s.name, s.category, us.proficiency_level
             FROM user_skills us
             JOIN skills s ON us.skill_id = s.id
             WHERE us.user_id = ?`,
            [userId]
        );

        // Feedback / rating summary if alumni
        let ratingSummary = null;
        let reviews = [];
        if (user.role === 'alumni') {
            ratingSummary = db.get(
                `SELECT COUNT(*) as review_count, AVG(rating) as avg_rating
                 FROM session_feedback
                 WHERE alumni_id = ? AND is_public = 1`,
                [userId]
            );

            reviews = db.query(
                `SELECT f.*, u.first_name as student_first_name, u.last_name as student_last_name, u.avatar_url as student_avatar
                 FROM session_feedback f
                 JOIN users u ON f.student_id = u.id
                 WHERE f.alumni_id = ? AND f.is_public = 1
                 ORDER BY f.created_at DESC LIMIT 10`,
                [userId]
            );
        }

        return res.json({
            user: {
                ...user,
                profile,
                skills,
                ratingSummary,
                reviews
            }
        });
    } catch (err) {
        console.error('[Get Profile Error]', err);
        return res.status(500).json({ error: 'Failed to retrieve user profile.' });
    }
});

// Update Student Profile
router.put('/profile/student', authenticate, (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Only student accounts can update student profile.' });
        }

        const {
            firstName,
            lastName,
            headline,
            degree,
            fieldOfStudy,
            institution,
            expectedGraduationYear,
            gpa,
            bio,
            careerInterests,
            targetIndustries,
            linkedinUrl,
            githubUrl,
            portfolioUrl
        } = req.body;

        db.transaction((tx) => {
            // Update user core info
            tx.run(
                'UPDATE users SET first_name = ?, last_name = ?, headline = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [firstName || req.user.first_name, lastName || req.user.last_name, headline ?? '', req.user.id]
            );

            // Update student specific profile
            tx.run(
                `UPDATE student_profiles SET
                    degree = ?,
                    field_of_study = ?,
                    institution = ?,
                    expected_graduation_year = ?,
                    gpa = ?,
                    bio = ?,
                    career_interests = ?,
                    target_industries = ?,
                    linkedin_url = ?,
                    github_url = ?,
                    portfolio_url = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?`,
                [
                    degree ?? '',
                    fieldOfStudy ?? '',
                    institution ?? 'Apex University Institute of Technology',
                    expectedGraduationYear ? Number(expectedGraduationYear) : 2026,
                    gpa ? Number(gpa) : null,
                    bio ?? '',
                    careerInterests ?? '',
                    targetIndustries ?? '',
                    linkedinUrl ?? '',
                    githubUrl ?? '',
                    portfolioUrl ?? '',
                    req.user.id
                ]
            );
        });

        return res.json({ message: 'Student profile updated successfully.' });
    } catch (err) {
        console.error('[Update Student Profile Error]', err);
        return res.status(500).json({ error: 'Failed to update student profile.' });
    }
});

// Update Alumni Profile
router.put('/profile/alumni', authenticate, (req, res) => {
    try {
        if (req.user.role !== 'alumni') {
            return res.status(403).json({ error: 'Only alumni accounts can update alumni profile.' });
        }

        const {
            firstName,
            lastName,
            headline,
            currentCompany,
            currentPosition,
            industry,
            degree,
            fieldOfStudy,
            graduationYear,
            yearsExperience,
            bio,
            linkedinUrl,
            githubUrl,
            personalWebsite,
            maxMentees,
            isAvailableForMentorship,
            mentorshipTopics
        } = req.body;

        db.transaction((tx) => {
            tx.run(
                'UPDATE users SET first_name = ?, last_name = ?, headline = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [firstName || req.user.first_name, lastName || req.user.last_name, headline ?? '', req.user.id]
            );

            tx.run(
                `UPDATE alumni_profiles SET
                    current_company = ?,
                    current_position = ?,
                    industry = ?,
                    degree = ?,
                    field_of_study = ?,
                    graduation_year = ?,
                    years_experience = ?,
                    bio = ?,
                    linkedin_url = ?,
                    github_url = ?,
                    personal_website = ?,
                    max_mentees = ?,
                    is_available_for_mentorship = ?,
                    mentorship_topics = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?`,
                [
                    currentCompany ?? '',
                    currentPosition ?? '',
                    industry ?? '',
                    degree ?? '',
                    fieldOfStudy ?? '',
                    graduationYear ? Number(graduationYear) : 2020,
                    yearsExperience ? Number(yearsExperience) : 0,
                    bio ?? '',
                    linkedinUrl ?? '',
                    githubUrl ?? '',
                    personalWebsite ?? '',
                    maxMentees ? Number(maxMentees) : 3,
                    isAvailableForMentorship ? 1 : 0,
                    mentorshipTopics ?? '',
                    req.user.id
                ]
            );
        });

        return res.json({ message: 'Alumni profile updated successfully.' });
    } catch (err) {
        console.error('[Update Alumni Profile Error]', err);
        return res.status(500).json({ error: 'Failed to update alumni profile.' });
    }
});

// Update User Skills
router.post('/skills', authenticate, (req, res) => {
    try {
        const { skills } = req.body; // Array of { name or skillId, proficiencyLevel }
        if (!Array.isArray(skills)) {
            return res.status(400).json({ error: 'Skills must be an array.' });
        }

        db.transaction((tx) => {
            // Remove existing user skills
            tx.run('DELETE FROM user_skills WHERE user_id = ?', [req.user.id]);

            for (const item of skills) {
                let skillId = item.id;
                if (!skillId && item.name) {
                    // Find or create skill
                    let existing = tx.get('SELECT id FROM skills WHERE name = ?', [item.name.trim()]);
                    if (existing) {
                        skillId = existing.id;
                    } else {
                        const insert = tx.run('INSERT INTO skills (name, category) VALUES (?, ?)', [
                            item.name.trim(),
                            item.category || 'General'
                        ]);
                        skillId = Number(insert.lastInsertRowid);
                    }
                }

                if (skillId) {
                    tx.run(
                        'INSERT INTO user_skills (user_id, skill_id, proficiency_level) VALUES (?, ?, ?)',
                        [req.user.id, skillId, item.proficiencyLevel || 'Intermediate']
                    );
                }
            }
        });

        const updatedSkills = db.query(
            `SELECT s.id, s.name, s.category, us.proficiency_level
             FROM user_skills us
             JOIN skills s ON us.skill_id = s.id
             WHERE us.user_id = ?`,
            [req.user.id]
        );

        return res.json({ message: 'Skills updated successfully.', skills: updatedSkills });
    } catch (err) {
        console.error('[Update Skills Error]', err);
        return res.status(500).json({ error: 'Failed to update user skills.' });
    }
});

module.exports = router;
