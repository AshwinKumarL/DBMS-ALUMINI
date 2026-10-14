const express = require('express');
const router = express.Router();
const db = require('../db');
const { optionalAuth, authenticate } = require('../middleware/auth');

// Helper to compute match score between a student and an alumni
function calculateMatchScore(studentProfile, studentSkills, alumni, alumniSkills) {
    if (!studentProfile) return 50; // default baseline

    let score = 30; // base score

    // 1. Industry alignment (up to 25 points)
    const targetIndustries = (studentProfile.target_industries || '').toLowerCase();
    const alumniIndustry = (alumni.industry || '').toLowerCase();
    if (targetIndustries && alumniIndustry && targetIndustries.includes(alumniIndustry)) {
        score += 25;
    } else if (targetIndustries && alumniIndustry) {
        const words = alumniIndustry.split(/[\s,&]+/);
        for (const w of words) {
            if (w.length > 2 && targetIndustries.includes(w)) {
                score += 15;
                break;
            }
        }
    }

    // 2. Skill match (up to 30 points)
    const studentSkillNames = new Set(studentSkills.map(s => s.name.toLowerCase()));
    const alumniSkillNames = alumniSkills.map(s => s.name.toLowerCase());
    let sharedCount = 0;
    for (const sName of alumniSkillNames) {
        if (studentSkillNames.has(sName)) {
            sharedCount++;
        }
    }
    score += Math.min(30, sharedCount * 10);

    // 3. Career interest keywords alignment with mentorship topics & title (up to 15 points)
    const interests = (studentProfile.career_interests || '').toLowerCase();
    const topics = ((alumni.mentorship_topics || '') + ' ' + (alumni.current_position || '')).toLowerCase();
    if (interests && topics) {
        const interestWords = interests.split(/[\s,]+/);
        let interestMatches = 0;
        for (const word of interestWords) {
            if (word.length > 3 && topics.includes(word)) {
                interestMatches++;
            }
        }
        score += Math.min(15, interestMatches * 5);
    }

    // Verified badge bonus
    if (alumni.verification_status === 'verified') {
        score += 5;
    }

    return Math.min(99, Math.max(20, Math.round(score)));
}

// Search and filter alumni directory
router.get('/', optionalAuth, (req, res) => {
    try {
        const {
            q,
            industry,
            skill,
            company,
            gradYearMin,
            gradYearMax,
            availability,
            verifiedOnly,
            sortBy
        } = req.query;

        let query = `
            SELECT
                u.id as user_id,
                u.first_name,
                u.last_name,
                u.email,
                u.avatar_url,
                u.headline,
                a.current_company,
                a.current_position,
                a.industry,
                a.degree,
                a.field_of_study,
                a.graduation_year,
                a.years_experience,
                a.bio,
                a.linkedin_url,
                a.github_url,
                a.personal_website,
                a.max_mentees,
                a.is_available_for_mentorship,
                a.mentorship_topics,
                a.verification_status,
                (SELECT COUNT(*) FROM session_feedback f WHERE f.alumni_id = u.id AND f.is_public = 1) as review_count,
                (SELECT AVG(rating) FROM session_feedback f WHERE f.alumni_id = u.id AND f.is_public = 1) as avg_rating,
                (SELECT COUNT(*) FROM mentorship_requests mr WHERE mr.alumni_id = u.id AND mr.status = 'accepted') as active_mentees_count
            FROM users u
            JOIN alumni_profiles a ON u.id = a.user_id
            WHERE u.is_active = 1
        `;

        const params = [];

        // Text search across name, company, position, bio, topics
        if (q && q.trim()) {
            const searchTerm = `%${q.trim()}%`;
            query += ` AND (
                u.first_name LIKE ? OR
                u.last_name LIKE ? OR
                (u.first_name || ' ' || u.last_name) LIKE ? OR
                a.current_company LIKE ? OR
                a.current_position LIKE ? OR
                a.industry LIKE ? OR
                a.bio LIKE ? OR
                a.mentorship_topics LIKE ?
            )`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }

        if (industry && industry !== 'all') {
            query += ' AND a.industry LIKE ?';
            params.push(`%${industry}%`);
        }

        if (company && company !== 'all') {
            query += ' AND a.current_company LIKE ?';
            params.push(`%${company}%`);
        }

        if (gradYearMin) {
            query += ' AND a.graduation_year >= ?';
            params.push(Number(gradYearMin));
        }

        if (gradYearMax) {
            query += ' AND a.graduation_year <= ?';
            params.push(Number(gradYearMax));
        }

        if (availability === 'available') {
            query += ' AND a.is_available_for_mentorship = 1';
        }

        if (verifiedOnly === 'true' || verifiedOnly === '1') {
            query += " AND a.verification_status = 'verified'";
        }

        // Skill filtering via subquery
        if (skill && skill !== 'all') {
            query += ` AND u.id IN (
                SELECT us.user_id FROM user_skills us
                JOIN skills s ON us.skill_id = s.id
                WHERE s.name LIKE ?
            )`;
            params.push(`%${skill}%`);
        }

        const alumniRows = db.query(query, params);

        // Fetch skills for all returned alumni
        const alumniIds = alumniRows.map(r => r.user_id);
        const userSkillsMap = {};

        if (alumniIds.length > 0) {
            const placeholders = alumniIds.map(() => '?').join(',');
            const skillsRows = db.query(
                `SELECT us.user_id, s.id, s.name, s.category, us.proficiency_level
                 FROM user_skills us
                 JOIN skills s ON us.skill_id = s.id
                 WHERE us.user_id IN (${placeholders})`,
                alumniIds
            );

            for (const row of skillsRows) {
                if (!userSkillsMap[row.user_id]) {
                    userSkillsMap[row.user_id] = [];
                }
                userSkillsMap[row.user_id].push({
                    id: row.id,
                    name: row.name,
                    category: row.category,
                    proficiencyLevel: row.proficiency_level
                });
            }
        }

        // Check if requesting user is a student to calculate personalized match score
        let studentProfile = null;
        let studentSkills = [];
        if (req.user && req.user.role === 'student') {
            studentProfile = db.get('SELECT * FROM student_profiles WHERE user_id = ?', [req.user.id]);
            studentSkills = db.query(
                `SELECT s.name, s.category, us.proficiency_level
                 FROM user_skills us
                 JOIN skills s ON us.skill_id = s.id
                 WHERE us.user_id = ?`,
                [req.user.id]
            );
        }

        const formattedAlumni = alumniRows.map(alumni => {
            const skills = userSkillsMap[alumni.user_id] || [];
            const matchScore = calculateMatchScore(studentProfile, studentSkills, alumni, skills);

            return {
                userId: alumni.user_id,
                firstName: alumni.first_name,
                lastName: alumni.last_name,
                email: alumni.email,
                avatarUrl: alumni.avatar_url,
                headline: alumni.headline,
                currentCompany: alumni.current_company,
                currentPosition: alumni.current_position,
                industry: alumni.industry,
                degree: alumni.degree,
                fieldOfStudy: alumni.field_of_study,
                graduationYear: alumni.graduation_year,
                yearsExperience: alumni.years_experience,
                bio: alumni.bio,
                linkedinUrl: alumni.linkedin_url,
                githubUrl: alumni.github_url,
                personalWebsite: alumni.personal_website,
                maxMentees: alumni.max_mentees,
                activeMenteesCount: alumni.active_mentees_count,
                isAvailableForMentorship: Boolean(alumni.is_available_for_mentorship && alumni.active_mentees_count < alumni.max_mentees),
                mentorshipTopics: alumni.mentorship_topics,
                verificationStatus: alumni.verification_status,
                reviewCount: alumni.review_count || 0,
                avgRating: alumni.avg_rating ? Number(Number(alumni.avg_rating).toFixed(1)) : 5.0,
                skills,
                matchScore
            };
        });

        // Sorting
        if (sortBy === 'rating') {
            formattedAlumni.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
        } else if (sortBy === 'experience') {
            formattedAlumni.sort((a, b) => b.yearsExperience - a.yearsExperience);
        } else if (sortBy === 'graduationYear') {
            formattedAlumni.sort((a, b) => b.graduationYear - a.graduationYear);
        } else {
            // Default: sort by match score descending, then verification
            formattedAlumni.sort((a, b) => {
                if (b.matchScore !== a.matchScore) {
                    return b.matchScore - a.matchScore;
                }
                return (b.verificationStatus === 'verified' ? 1 : 0) - (a.verificationStatus === 'verified' ? 1 : 0);
            });
        }

        // Extract metadata for filter dropdowns
        const industries = db.query("SELECT DISTINCT industry FROM alumni_profiles WHERE industry IS NOT NULL AND industry != '' ORDER BY industry");
        const companies = db.query("SELECT DISTINCT current_company FROM alumni_profiles WHERE current_company IS NOT NULL AND current_company != '' ORDER BY current_company");


        return res.json({
            count: formattedAlumni.length,
            alumni: formattedAlumni,
            filterOptions: {
                industries: industries.map(r => r.industry),
                companies: companies.map(r => r.current_company)
            }
        });
    } catch (err) {
        console.error('[Search Alumni Error]', err);
        return res.status(500).json({ error: 'Failed to search alumni directory.' });
    }
});

// Recommended mentors for student
router.get('/recommendations', authenticate, (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ error: 'Recommendations are curated for students.' });
        }

        const studentProfile = db.get('SELECT * FROM student_profiles WHERE user_id = ?', [req.user.id]);
        const studentSkills = db.query(
            `SELECT s.name, s.category FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = ?`,
            [req.user.id]
        );

        const alumniRows = db.query(`
            SELECT
                u.id as user_id,
                u.first_name,
                u.last_name,
                u.avatar_url,
                u.headline,
                a.current_company,
                a.current_position,
                a.industry,
                a.graduation_year,
                a.years_experience,
                a.bio,
                a.mentorship_topics,
                a.verification_status,
                (SELECT AVG(rating) FROM session_feedback f WHERE f.alumni_id = u.id) as avg_rating,
                (SELECT COUNT(*) FROM session_feedback f WHERE f.alumni_id = u.id) as review_count
            FROM users u
            JOIN alumni_profiles a ON u.id = a.user_id
            WHERE u.is_active = 1 AND a.is_available_for_mentorship = 1
        `);

        const recommended = [];
        for (const alumni of alumniRows) {
            const skills = db.query(
                `SELECT s.id, s.name, s.category FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = ?`,
                [alumni.user_id]
            );

            const matchScore = calculateMatchScore(studentProfile, studentSkills, alumni, skills);

            recommended.push({
                userId: alumni.user_id,
                firstName: alumni.first_name,
                lastName: alumni.last_name,
                avatarUrl: alumni.avatar_url,
                headline: alumni.headline,
                currentCompany: alumni.current_company,
                currentPosition: alumni.current_position,
                industry: alumni.industry,
                graduationYear: alumni.graduation_year,
                yearsExperience: alumni.years_experience,
                bio: alumni.bio,
                mentorshipTopics: alumni.mentorship_topics,
                verificationStatus: alumni.verification_status,
                avgRating: alumni.avg_rating ? Number(Number(alumni.avg_rating).toFixed(1)) : 5.0,
                reviewCount: alumni.review_count || 0,
                skills,
                matchScore
            });
        }

        recommended.sort((a, b) => b.matchScore - a.matchScore);

        return res.json({ recommendations: recommended.slice(0, 6) });
    } catch (err) {
        console.error('[Recommendations Error]', err);
        return res.status(500).json({ error: 'Failed to generate mentor recommendations.' });
    }
});

// Insert a new Mentor / Alumni record (DBMS Operation)
router.post('/', (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
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
            mentorshipTopics,
            verificationStatus
        } = req.body;

        if (!firstName || !lastName || !email || !currentCompany || !currentPosition) {
            return res.status(400).json({ error: 'First name, last name, email, company, and position are required fields.' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existing = db.get('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
        if (existing) {
            return res.status(409).json({ error: 'A user with this email address already exists.' });
        }

        const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName + ' ' + lastName)}&background=10b981&color=fff&size=256`;
        const dummyHash = '$2a$10$wT8BfZfXz6R8B3i7G4I2CeH3Z8X6Y4W2U0S9Q8O7M6K5J4H3G2F1E';

        let insertedUserId;
        db.transaction((tx) => {
            const userResult = tx.run(
                `INSERT INTO users (email, password_hash, role, first_name, last_name, avatar_url, headline, is_active)
                 VALUES (?, ?, 'alumni', ?, ?, ?, ?, 1)`,
                [
                    normalizedEmail,
                    dummyHash,
                    firstName.trim(),
                    lastName.trim(),
                    defaultAvatar,
                    headline || `${currentPosition} at ${currentCompany}`
                ]
            );
            insertedUserId = Number(userResult.lastInsertRowid);

            tx.run(
                `INSERT INTO alumni_profiles (
                    user_id, current_company, current_position, industry, degree, field_of_study,
                    graduation_year, years_experience, bio, linkedin_url, mentorship_topics,
                    verification_status, verified_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    insertedUserId,
                    currentCompany.trim(),
                    currentPosition.trim(),
                    industry || 'Technology & Cloud',
                    degree || 'B.S. in Computer Science',
                    fieldOfStudy || 'Computer Science',
                    graduationYear ? Number(graduationYear) : 2020,
                    yearsExperience ? Number(yearsExperience) : 3,
                    bio || null,
                    linkedinUrl || null,
                    mentorshipTopics || 'Career Advice, Mock Interviews',
                    verificationStatus || 'verified',
                    (verificationStatus === 'verified' || !verificationStatus) ? new Date().toISOString() : null
                ]
            );
        });

        const createdAlumni = db.get(`
            SELECT u.id as user_id, u.first_name, u.last_name, u.email, u.headline,
                   a.current_company, a.current_position, a.industry, a.degree, a.field_of_study,
                   a.graduation_year, a.years_experience, a.verification_status, a.mentorship_topics
            FROM users u
            JOIN alumni_profiles a ON u.id = a.user_id
            WHERE u.id = ?
        `, [insertedUserId]);

        return res.status(201).json({
            success: true,
            message: `Mentor record #${insertedUserId} (${firstName} ${lastName}) successfully inserted into SQL database.`,
            alumni: createdAlumni
        });
    } catch (err) {
        console.error('[Insert Alumni Error]', err);
        return res.status(500).json({ error: err.message || 'Failed to insert mentor record.' });
    }
});

// Delete a Mentor record (DBMS Operation with CASCADE)
router.delete('/:id', (req, res) => {
    try {
        const userId = Number(req.params.id);
        const existing = db.get('SELECT id, first_name, last_name FROM users WHERE id = ? AND role = "alumni"', [userId]);
        if (!existing) {
            return res.status(404).json({ error: 'Mentor record not found.' });
        }

        db.run('DELETE FROM users WHERE id = ?', [userId]);

        return res.json({
            success: true,
            message: `Mentor record #${userId} (${existing.first_name} ${existing.last_name}) deleted from SQL database.`
        });
    } catch (err) {
        console.error('[Delete Alumni Error]', err);
        return res.status(500).json({ error: err.message || 'Failed to delete mentor record.' });
    }
});

module.exports = router;

