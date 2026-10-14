const bcrypt = require('bcryptjs');
const db = require('./index');

async function seedDatabase() {
    console.log('[Seed] Initializing database schema...');
    db.initDb();

    // Check if users already seeded
    const existingUsers = db.query('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count > 0) {
        console.log('[Seed] Database already contains data. Skipping seed.');
        return;
    }

    console.log('[Seed] Seeding sample data...');
    const defaultPasswordHash = await bcrypt.hash('password123', 10);

    // 1. Insert Skills
    const skillsList = [
        { name: 'Python', category: 'Technical' },
        { name: 'JavaScript', category: 'Technical' },
        { name: 'TypeScript', category: 'Technical' },
        { name: 'React', category: 'Technical' },
        { name: 'Node.js', category: 'Technical' },
        { name: 'System Design', category: 'Technical' },
        { name: 'SQL & Database Design', category: 'Technical' },
        { name: 'Docker & Kubernetes', category: 'DevOps' },
        { name: 'AWS Cloud', category: 'Cloud' },
        { name: 'Machine Learning', category: 'Data & AI' },
        { name: 'Deep Learning & NLP', category: 'Data & AI' },
        { name: 'Product Management', category: 'Product' },
        { name: 'Financial Modeling', category: 'Finance' },
        { name: 'Data Structures & Algorithms', category: 'Technical' },
        { name: 'Agile & Scrum', category: 'Management' },
        { name: 'Biotechnology & Bioinformatics', category: 'Healthcare' },
        { name: 'Career Strategy & Interview Prep', category: 'Mentorship' }
    ];

    const insertSkillStmt = db.getDb().prepare('INSERT INTO skills (name, category) VALUES (?, ?)');
    for (const skill of skillsList) {
        insertSkillStmt.run(skill.name, skill.category);
    }
    console.log(`[Seed] Added ${skillsList.length} skills.`);

    // Helper to get skill id by name
    const getSkillId = (name) => {
        const row = db.get('SELECT id FROM skills WHERE name = ?', [name]);
        return row ? row.id : null;
    };

    // 2. Insert Users (Admin, Alumni, Students)
    const users = [
        // Admin
        {
            email: 'admin@alumni.edu',
            password_hash: defaultPasswordHash,
            role: 'admin',
            first_name: 'Dr. Arthur',
            last_name: 'Pendleton',
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
            headline: 'Director of Alumni Relations & Academic Partnerships',
            is_active: 1
        },
        // Alumni 1 - Verified
        {
            email: 'sarah.chen@google.com',
            password_hash: defaultPasswordHash,
            role: 'alumni',
            first_name: 'Sarah',
            last_name: 'Chen',
            avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
            headline: 'Staff Software Engineer @ Google | Cloud & Distributed Systems',
            is_active: 1
        },
        // Alumni 2 - Verified
        {
            email: 'marcus.vance@stripe.com',
            password_hash: defaultPasswordHash,
            role: 'alumni',
            first_name: 'Marcus',
            last_name: 'Vance',
            avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
            headline: 'VP of Product @ Stripe | Former YC Founder & PM Lead',
            is_active: 1
        },
        // Alumni 3 - Verified
        {
            email: 'priya.patel@anthropic.com',
            password_hash: defaultPasswordHash,
            role: 'alumni',
            first_name: 'Priya',
            last_name: 'Patel',
            avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
            headline: 'AI Research Scientist @ Anthropic | NLP & Foundation Models',
            is_active: 1
        },
        // Alumni 4 - Verified
        {
            email: 'david.miller@gs.com',
            password_hash: defaultPasswordHash,
            role: 'alumni',
            first_name: 'David',
            last_name: 'Miller',
            avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80',
            headline: 'Investment Banking Associate @ Goldman Sachs | Tech M&A',
            is_active: 1
        },
        // Alumni 5 - Verified
        {
            email: 'elena.rostova@genentech.com',
            password_hash: defaultPasswordHash,
            role: 'alumni',
            first_name: 'Elena',
            last_name: 'Rostova',
            avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
            headline: 'Senior Computational Biologist @ Genentech | Genomic Data Science',
            is_active: 1
        },
        // Alumni 6 - PENDING (For Admin verification showcase)
        {
            email: 'jonathan.brooks@meta.com',
            password_hash: defaultPasswordHash,
            role: 'alumni',
            first_name: 'Jonathan',
            last_name: 'Brooks',
            avatar_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=80',
            headline: 'Engineering Manager @ Meta | Frontend Infrastructure',
            is_active: 1
        },
        // Student 1
        {
            email: 'alex.morgan@student.edu',
            password_hash: defaultPasswordHash,
            role: 'student',
            first_name: 'Alex',
            last_name: 'Morgan',
            avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
            headline: 'Senior CS Major @ Apex | Cloud Systems & Distributed Apps Enthusiast',
            is_active: 1
        },
        // Student 2
        {
            email: 'emily.zhang@student.edu',
            password_hash: defaultPasswordHash,
            role: 'student',
            first_name: 'Emily',
            last_name: 'Zhang',
            avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
            headline: 'Junior Data Science & Math @ Apex | Aspiring Quantitative Researcher',
            is_active: 1
        },
        // Student 3
        {
            email: 'rahul.sharma@student.edu',
            password_hash: defaultPasswordHash,
            role: 'student',
            first_name: 'Rahul',
            last_name: 'Sharma',
            avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=80',
            headline: 'Sophomore Software Engineering @ Apex | Fullstack & Open Source',
            is_active: 1
        },
        // Student 4
        {
            email: 'chloe.bennett@student.edu',
            password_hash: defaultPasswordHash,
            role: 'student',
            first_name: 'Chloe',
            last_name: 'Bennett',
            avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=256&q=80',
            headline: 'Junior Business & Computer Science @ Apex | Aspiring Product Manager',
            is_active: 1
        }
    ];

    const insertUserStmt = db.getDb().prepare(`
        INSERT INTO users (email, password_hash, role, first_name, last_name, avatar_url, headline, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const u of users) {
        insertUserStmt.run(u.email, u.password_hash, u.role, u.first_name, u.last_name, u.avatar_url, u.headline, u.is_active);
    }
    console.log(`[Seed] Added ${users.length} users.`);

    // Helper to get user by email
    const getUserByEmail = (email) => db.get('SELECT * FROM users WHERE email = ?', [email]);

    const admin = getUserByEmail('admin@alumni.edu');
    const sarah = getUserByEmail('sarah.chen@google.com');
    const marcus = getUserByEmail('marcus.vance@stripe.com');
    const priya = getUserByEmail('priya.patel@anthropic.com');
    const david = getUserByEmail('david.miller@gs.com');
    const elena = getUserByEmail('elena.rostova@genentech.com');
    const jonathan = getUserByEmail('jonathan.brooks@meta.com');

    const alex = getUserByEmail('alex.morgan@student.edu');
    const emily = getUserByEmail('emily.zhang@student.edu');
    const rahul = getUserByEmail('rahul.sharma@student.edu');
    const chloe = getUserByEmail('chloe.bennett@student.edu');

    // 3. Insert Alumni Profiles
    const alumniProfiles = [
        {
            user_id: sarah.id,
            current_company: 'Google',
            current_position: 'Staff Software Engineer',
            industry: 'Technology & Cloud',
            degree: 'B.S. in Computer Science',
            field_of_study: 'Computer Science',
            graduation_year: 2018,
            years_experience: 8,
            bio: 'Passionate about distributed storage, high-throughput pipelines, and helping underrepresented students break into top tier technology companies. Happy to conduct mock system design interviews and resume teardowns.',
            linkedin_url: 'https://linkedin.com/in/sarah-chen-demo',
            github_url: 'https://github.com/sarahchen-demo',
            personal_website: 'https://sarahchen.dev',
            max_mentees: 4,
            is_available_for_mentorship: 1,
            mentorship_topics: 'System Design, Large Scale Systems, Technical Coding Interviews, Career Progression',
            verification_status: 'verified',
            verified_at: '2025-01-15 10:00:00',
            verified_by: admin.id
        },
        {
            user_id: marcus.id,
            current_company: 'Stripe',
            current_position: 'VP of Product',
            industry: 'Financial Technology',
            degree: 'B.S. in Electrical & Computer Engineering',
            field_of_study: 'Computer Engineering',
            graduation_year: 2016,
            years_experience: 10,
            bio: 'Started my career as a backend engineer before founding a YC-backed startup and subsequently transitioning into Product Management. I mentor students on product sense, career pivots, and entrepreneurial mindset.',
            linkedin_url: 'https://linkedin.com/in/marcus-vance-demo',
            personal_website: 'https://marcusvance.co',
            max_mentees: 3,
            is_available_for_mentorship: 1,
            mentorship_topics: 'Product Management, Startup Strategy, PM Interview Prep, Pitching & Leadership',
            verification_status: 'verified',
            verified_at: '2025-01-16 11:30:00',
            verified_by: admin.id
        },
        {
            user_id: priya.id,
            current_company: 'Anthropic',
            current_position: 'AI Research Scientist',
            industry: 'Artificial Intelligence',
            degree: 'M.S. in Artificial Intelligence',
            field_of_study: 'Computer Science & AI',
            graduation_year: 2020,
            years_experience: 6,
            bio: 'Focusing on large language model alignment, interpretability, and evaluation. Mentoring students eager to explore AI research, PhD application strategies, or joining top tier AI research labs.',
            linkedin_url: 'https://linkedin.com/in/priya-patel-ai',
            github_url: 'https://github.com/priyapatel-ai',
            max_mentees: 3,
            is_available_for_mentorship: 1,
            mentorship_topics: 'Machine Learning, Deep Learning, AI Alignment, Research Publishing, PhD Prep',
            verification_status: 'verified',
            verified_at: '2025-02-01 09:15:00',
            verified_by: admin.id
        },
        {
            user_id: david.id,
            current_company: 'Goldman Sachs',
            current_position: 'Investment Banking Associate',
            industry: 'Investment Banking & Finance',
            degree: 'B.A. in Economics & Data Science',
            field_of_study: 'Economics & Mathematics',
            graduation_year: 2019,
            years_experience: 7,
            bio: 'Advise leading technology companies on mergers & acquisitions and capital raises. Happy to mentor students aiming for Wall Street, financial modeling masterclasses, and behavioral interview polish.',
            linkedin_url: 'https://linkedin.com/in/david-miller-finance',
            max_mentees: 2,
            is_available_for_mentorship: 1,
            mentorship_topics: 'Investment Banking Recruitment, Financial Modeling, Wall Street Culture, Case Studies',
            verification_status: 'verified',
            verified_at: '2025-02-10 14:00:00',
            verified_by: admin.id
        },
        {
            user_id: elena.id,
            current_company: 'Genentech',
            current_position: 'Senior Computational Biologist',
            industry: 'Healthcare & Biotechnology',
            degree: 'Ph.D. in Bioengineering & Systems Biology',
            field_of_study: 'Computational Biology',
            graduation_year: 2017,
            years_experience: 9,
            bio: 'Bridging high-throughput biological data and machine learning for drug discovery. Passionate about guiding STEM students interested in bioinformatics, health-tech, and clinical data science.',
            linkedin_url: 'https://linkedin.com/in/elena-rostova-bio',
            max_mentees: 3,
            is_available_for_mentorship: 1,
            mentorship_topics: 'Biotech Careers, Python for Genomics, Graduate School Advice, Cross-disciplinary STEM',
            verification_status: 'verified',
            verified_at: '2025-02-20 16:30:00',
            verified_by: admin.id
        },
        {
            user_id: jonathan.id,
            current_company: 'Meta',
            current_position: 'Engineering Manager',
            industry: 'Technology & Social Media',
            degree: 'B.S. in Computer Science',
            field_of_study: 'Software Engineering',
            graduation_year: 2021,
            years_experience: 5,
            bio: 'Leading teams building performant web applications and frontend developer infrastructure. Pending verification on the alumni network.',
            linkedin_url: 'https://linkedin.com/in/jonathan-brooks-meta',
            github_url: 'https://github.com/jbrooks-meta',
            max_mentees: 2,
            is_available_for_mentorship: 1,
            mentorship_topics: 'Frontend Engineering, React Ecosystem, Web Performance, Engineering Management',
            verification_status: 'pending',
            verified_at: null,
            verified_by: null
        }
    ];

    const insertAlumniStmt = db.getDb().prepare(`
        INSERT INTO alumni_profiles (
            user_id, current_company, current_position, industry, degree, field_of_study,
            graduation_year, years_experience, bio, linkedin_url, github_url, personal_website,
            max_mentees, is_available_for_mentorship, mentorship_topics, verification_status,
            verified_at, verified_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const ap of alumniProfiles) {
        insertAlumniStmt.run(
            ap.user_id ?? null,
            ap.current_company ?? null,
            ap.current_position ?? null,
            ap.industry ?? null,
            ap.degree ?? null,
            ap.field_of_study ?? null,
            ap.graduation_year ?? null,
            ap.years_experience ?? 0,
            ap.bio ?? null,
            ap.linkedin_url ?? null,
            ap.github_url ?? null,
            ap.personal_website ?? null,
            ap.max_mentees ?? 3,
            ap.is_available_for_mentorship ?? 1,
            ap.mentorship_topics ?? null,
            ap.verification_status ?? 'pending',
            ap.verified_at ?? null,
            ap.verified_by ?? null
        );
    }
    console.log(`[Seed] Added ${alumniProfiles.length} alumni profiles.`);

    // 4. Insert Student Profiles
    const studentProfiles = [
        {
            user_id: alex.id,
            degree: 'B.S. in Computer Science',
            field_of_study: 'Computer Science',
            institution: 'Apex University Institute of Technology',
            expected_graduation_year: 2026,
            gpa: 3.88,
            bio: 'Aspiring Cloud Infrastructure Engineer with a love for distributed databases and microservices architecture. Actively preparing for upcoming summer new-grad interviews.',
            career_interests: 'Cloud Architecture, Backend Engineering, Distributed Systems, Site Reliability',
            target_industries: 'Technology & Cloud, Enterprise Software',
            linkedin_url: 'https://linkedin.com/in/alex-morgan-cs',
            github_url: 'https://github.com/alexmorgan-cs',
            portfolio_url: 'https://alexmorgan.me'
        },
        {
            user_id: emily.id,
            degree: 'B.S. in Data Science & Mathematics',
            field_of_study: 'Data Science & Quantitative Finance',
            institution: 'Apex University Institute of Technology',
            expected_graduation_year: 2027,
            gpa: 3.94,
            bio: 'Fascinated by statistical arbitrage, quantitative research, and predictive modeling in capital markets. Seeking mentorship to navigate fintech and investment firm recruiting.',
            career_interests: 'Quantitative Research, Data Science, Machine Learning in Finance',
            target_industries: 'Financial Technology, Investment Banking & Finance',
            linkedin_url: 'https://linkedin.com/in/emily-zhang-ds',
            github_url: 'https://github.com/emilyzhang-ds'
        },
        {
            user_id: rahul.id,
            degree: 'B.S. in Software Engineering',
            field_of_study: 'Software Engineering',
            institution: 'Apex University Institute of Technology',
            expected_graduation_year: 2028,
            gpa: 3.75,
            bio: 'Passionate sophomore developer building open-source React web apps and GraphQL APIs. Looking for guidance on open source contribution and building a competitive tech resume.',
            career_interests: 'Full Stack Development, Web Technologies, Open Source Systems',
            target_industries: 'Technology & Cloud, Consumer Internet',
            linkedin_url: 'https://linkedin.com/in/rahul-sharma-swe',
            github_url: 'https://github.com/rahulsharma-swe'
        },
        {
            user_id: chloe.id,
            degree: 'B.S. in Business Administration & Computer Science',
            field_of_study: 'Product Management & Information Systems',
            institution: 'Apex University Institute of Technology',
            expected_graduation_year: 2027,
            gpa: 3.85,
            bio: 'President of Apex Product Club. Passionate about user-centric design, product strategy, and market disruption. Seeking mentorship from tech PM leaders.',
            career_interests: 'Product Management, Venture Capital, Growth Strategy',
            target_industries: 'Technology & Cloud, Financial Technology',
            linkedin_url: 'https://linkedin.com/in/chloe-bennett-pm'
        }
    ];

    const insertStudentStmt = db.getDb().prepare(`
        INSERT INTO student_profiles (
            user_id, degree, field_of_study, institution, expected_graduation_year,
            gpa, bio, career_interests, target_industries, linkedin_url, github_url, portfolio_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const sp of studentProfiles) {
        insertStudentStmt.run(
            sp.user_id ?? null,
            sp.degree ?? null,
            sp.field_of_study ?? null,
            sp.institution ?? 'Apex University Institute of Technology',
            sp.expected_graduation_year ?? null,
            sp.gpa ?? null,
            sp.bio ?? null,
            sp.career_interests ?? null,
            sp.target_industries ?? null,
            sp.linkedin_url ?? null,
            sp.github_url ?? null,
            sp.portfolio_url ?? null
        );
    }
    console.log(`[Seed] Added ${studentProfiles.length} student profiles.`);

    // 5. Associate User Skills
    const userSkillsMap = [
        // Sarah Chen
        { user: sarah, skills: [['System Design', 'Expert'], ['SQL & Database Design', 'Expert'], ['Docker & Kubernetes', 'Advanced'], ['AWS Cloud', 'Expert'], ['Python', 'Advanced']] },
        // Marcus Vance
        { user: marcus, skills: [['Product Management', 'Expert'], ['Agile & Scrum', 'Expert'], ['Career Strategy & Interview Prep', 'Expert'], ['System Design', 'Intermediate']] },
        // Priya Patel
        { user: priya, skills: [['Machine Learning', 'Expert'], ['Deep Learning & NLP', 'Expert'], ['Python', 'Expert'], ['Data Structures & Algorithms', 'Advanced']] },
        // David Miller
        { user: david, skills: [['Financial Modeling', 'Expert'], ['Career Strategy & Interview Prep', 'Advanced'], ['Data Analysis', 'Advanced']] },
        // Elena Rostova
        { user: elena, skills: [['Biotechnology & Bioinformatics', 'Expert'], ['Python', 'Advanced'], ['Machine Learning', 'Advanced']] },
        // Jonathan Brooks
        { user: jonathan, skills: [['JavaScript', 'Expert'], ['TypeScript', 'Expert'], ['React', 'Expert'], ['Node.js', 'Advanced']] },
        // Alex Morgan (Student)
        { user: alex, skills: [['Python', 'Intermediate'], ['System Design', 'Beginner'], ['Docker & Kubernetes', 'Beginner'], ['SQL & Database Design', 'Intermediate']] },
        // Emily Zhang (Student)
        { user: emily, skills: [['Python', 'Advanced'], ['Machine Learning', 'Intermediate'], ['Financial Modeling', 'Beginner']] },
        // Rahul Sharma (Student)
        { user: rahul, skills: [['JavaScript', 'Intermediate'], ['React', 'Intermediate'], ['Node.js', 'Intermediate']] },
        // Chloe Bennett (Student)
        { user: chloe, skills: [['Product Management', 'Intermediate'], ['Agile & Scrum', 'Intermediate']] }
    ];

    const insertUserSkillStmt = db.getDb().prepare(`
        INSERT INTO user_skills (user_id, skill_id, proficiency_level)
        VALUES (?, ?, ?)
    `);

    for (const mapping of userSkillsMap) {
        for (const [skillName, level] of mapping.skills) {
            const skillId = getSkillId(skillName);
            if (skillId) {
                insertUserSkillStmt.run(mapping.user.id, skillId, level);
            }
        }
    }
    console.log('[Seed] Associated user skills.');

    // 6. Mentorship Requests
    const mentorshipRequests = [
        {
            student_id: alex.id,
            alumni_id: sarah.id,
            topic: 'System Design Interview & Distributed Cache Deep-Dive',
            goals: 'Prepare for senior internship interview at top cloud infrastructure firms.',
            preferred_schedule: 'Weekday evenings (EST) or Saturday morning',
            message: 'Hi Sarah! I am a senior at Apex working on distributed systems. I read your insights on distributed caching and would love 45 minutes to get feedback on system design interview frameworks.',
            status: 'accepted',
            response_note: 'Happy to help Alex! Let us schedule a mock session and review architectural tradeoffs.',
            responded_at: '2026-03-10 14:00:00'
        },
        {
            student_id: alex.id,
            alumni_id: priya.id,
            topic: 'Transitioning from Software Engineering to AI Research',
            goals: 'Understand whether to pursue a master degree or apply directly to AI alignment engineering roles.',
            preferred_schedule: 'Flexible during weekends',
            message: 'Hi Priya! I have a strong foundation in systems engineering and want to understand the prerequisites for LLM alignment research.',
            status: 'pending',
            response_note: null,
            responded_at: null
        },
        {
            student_id: emily.id,
            alumni_id: david.id,
            topic: 'Quantitative Finance & Market Making Fundamentals',
            goals: 'Advice on quantitative modeling interviews and resume positioning.',
            preferred_schedule: 'Thursday or Friday afternoons',
            message: 'Hello David! I am currently studying Data Science & Math with a strong focus on stochastic calculus and time series analysis. I would love your advice on preparing for finance recruitment.',
            status: 'accepted',
            response_note: 'Sounds great Emily, excited to connect and review your portfolio projects.',
            responded_at: '2026-03-12 11:30:00'
        },
        {
            student_id: rahul.id,
            alumni_id: sarah.id,
            topic: 'Full-Stack Project Architecture Review',
            goals: 'Getting critical feedback on database normalization and API design for my open-source project.',
            preferred_schedule: 'Wednesday 4:00 PM',
            message: 'Hi Sarah, I am building a full stack application and would appreciate your technical eye on scalability patterns.',
            status: 'completed',
            response_note: 'Great session Rahul, keep pushing on database indexes and query optimization!',
            responded_at: '2026-03-05 16:30:00'
        },
        {
            student_id: chloe.id,
            alumni_id: marcus.id,
            topic: 'Product Strategy & Breaking into APM Programs',
            goals: 'Learn what top fintech APM programs look for in undergraduate candidates.',
            preferred_schedule: 'Tuesdays or Thursdays',
            message: 'Hi Marcus! As the president of the Apex Product Club, I deeply admire your journey from founder to VP of Product at Stripe. Would love guidance on positioning for APM cohorts.',
            status: 'accepted',
            response_note: 'Hi Chloe, always happy to support Apex students aiming for product management. Let us set up a session.',
            responded_at: '2026-03-11 18:00:00'
        }
    ];

    const insertRequestStmt = db.getDb().prepare(`
        INSERT INTO mentorship_requests (
            student_id, alumni_id, topic, goals, preferred_schedule, message, status, response_note, responded_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertedRequests = [];
    for (const req of mentorshipRequests) {
        const result = insertRequestStmt.run(
            req.student_id ?? null,
            req.alumni_id ?? null,
            req.topic ?? null,
            req.goals ?? null,
            req.preferred_schedule ?? null,
            req.message ?? null,
            req.status ?? 'pending',
            req.response_note ?? null,
            req.responded_at ?? null
        );
        insertedRequests.push(result.lastInsertRowid);
    }
    console.log(`[Seed] Added ${mentorshipRequests.length} mentorship requests.`);

    // 7. Mentorship Sessions
    const sessions = [
        // Upcoming session 1: Alex & Sarah
        {
            request_id: insertedRequests[0],
            student_id: alex.id,
            alumni_id: sarah.id,
            topic: 'System Design Interview & Distributed Cache Deep-Dive',
            scheduled_at: '2026-10-18 15:00:00',
            duration_minutes: 45,
            meeting_link: 'https://meet.google.com/alm-srch-demo',
            location_type: 'virtual',
            agenda: '1. Review Alex’s cache eviction architecture\n2. Walk through consistent hashing\n3. Q&A on Google interview expectations',
            notes: 'Alex should prepare his high-level architecture diagram beforehand.',
            status: 'scheduled'
        },
        // Upcoming session 2: Chloe & Marcus
        {
            request_id: insertedRequests[4],
            student_id: chloe.id,
            alumni_id: marcus.id,
            topic: 'Product Strategy & Breaking into APM Programs',
            scheduled_at: '2026-10-20 18:30:00',
            duration_minutes: 45,
            meeting_link: 'https://zoom.us/j/9876543210',
            location_type: 'virtual',
            agenda: '1. Resume critique for Stripe/Google APM\n2. Product Sense Framework demo\n3. Leadership narrative review',
            notes: 'Bring 1 product tear-down write-up.',
            status: 'scheduled'
        },
        // Completed past session: Rahul & Sarah
        {
            request_id: insertedRequests[3],
            student_id: rahul.id,
            alumni_id: sarah.id,
            topic: 'Full-Stack Project Architecture Review',
            scheduled_at: '2026-10-10 16:00:00',
            duration_minutes: 60,
            meeting_link: 'https://meet.google.com/alm-arch-done',
            location_type: 'virtual',
            agenda: 'Database schema review, foreign key indexing, RESTful design.',
            notes: 'Rahul did a great job explaining his ER diagram. Recommended adding Redis caching and compound indexes.',
            status: 'completed'
        }
    ];

    const insertSessionStmt = db.getDb().prepare(`
        INSERT INTO mentorship_sessions (
            request_id, student_id, alumni_id, topic, scheduled_at, duration_minutes,
            meeting_link, location_type, agenda, notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertedSessions = [];
    for (const sess of sessions) {
        const res = insertSessionStmt.run(
            sess.request_id, sess.student_id, sess.alumni_id, sess.topic, sess.scheduled_at,
            sess.duration_minutes, sess.meeting_link, sess.location_type, sess.agenda, sess.notes, sess.status
        );
        insertedSessions.push(res.lastInsertRowid);
    }
    console.log(`[Seed] Added ${sessions.length} mentorship sessions.`);

    // 8. Session Feedback for completed session
    db.run(`
        INSERT INTO session_feedback (
            session_id, student_id, alumni_id, rating, feedback_text, tags, is_public
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
        insertedSessions[2], // Completed session (Rahul & Sarah)
        rahul.id,
        sarah.id,
        5,
        'Sarah provided extraordinary insights into my database schema and system tradeoffs. She was encouraging, highly technical, and gave clear, actionable homework items!',
        'Actionable Advice, Deep Technical Knowledge, Inspiring, Great Listener',
        1
    ]);
    console.log('[Seed] Added session feedback & rating.');

    // 9. Connections
    const connections = [
        { requester_id: alex.id, addressee_id: sarah.id, status: 'accepted', note: 'Looking forward to keeping in touch!' },
        { requester_id: alex.id, addressee_id: marcus.id, status: 'pending', note: 'Hi Marcus, fellow Apex student hoping to connect.' },
        { requester_id: emily.id, addressee_id: david.id, status: 'accepted', note: 'Excited to chat about quant finance.' },
        { requester_id: rahul.id, addressee_id: sarah.id, status: 'accepted', note: 'Thank you for the guidance!' },
        { requester_id: chloe.id, addressee_id: marcus.id, status: 'accepted', note: 'Connecting after our scheduled mentorship session.' },
        { requester_id: jonathan.id, addressee_id: sarah.id, status: 'accepted', note: 'Great to see you on the alumni network!' }
    ];

    const insertConnStmt = db.getDb().prepare(`
        INSERT INTO connections (requester_id, addressee_id, status, note)
        VALUES (?, ?, ?, ?)
    `);

    for (const conn of connections) {
        insertConnStmt.run(conn.requester_id, conn.addressee_id, conn.status, conn.note);
    }
    console.log(`[Seed] Added ${connections.length} connections.`);

    // 10. Messages
    const messages = [
        {
            sender_id: alex.id,
            recipient_id: sarah.id,
            content: 'Hi Sarah, thank you so much for accepting my mentorship request! I am really looking forward to our session.',
            is_read: 1,
            created_at: '2026-10-12 10:15:00'
        },
        {
            sender_id: sarah.id,
            recipient_id: alex.id,
            content: 'You are welcome Alex! Be sure to take a look at the Google Meet link in the calendar invite. See you soon!',
            is_read: 1,
            created_at: '2026-10-12 10:45:00'
        },
        {
            sender_id: alex.id,
            recipient_id: sarah.id,
            content: 'Will do! I have also prepared 3 specific questions on horizontal database partitioning.',
            is_read: 0,
            created_at: '2026-10-13 14:20:00'
        },
        {
            sender_id: emily.id,
            recipient_id: david.id,
            content: 'Hello David, I wanted to thank you for the connection! Should I send over my resume before we talk?',
            is_read: 1,
            created_at: '2026-10-13 11:00:00'
        },
        {
            sender_id: david.id,
            recipient_id: emily.id,
            content: 'Yes please Emily! Send it over anytime, and I will highlight areas to tailor for quant trading desks.',
            is_read: 0,
            created_at: '2026-10-13 11:30:00'
        }
    ];

    const insertMsgStmt = db.getDb().prepare(`
        INSERT INTO messages (sender_id, recipient_id, content, is_read, created_at)
        VALUES (?, ?, ?, ?, ?)
    `);

    for (const msg of messages) {
        insertMsgStmt.run(msg.sender_id, msg.recipient_id, msg.content, msg.is_read, msg.created_at);
    }
    console.log(`[Seed] Added ${messages.length} messages.`);

    // 11. Notifications
    const notifications = [
        {
            user_id: alex.id,
            type: 'mentorship_accepted',
            title: 'Mentorship Request Accepted',
            message: 'Sarah Chen accepted your mentorship request on "System Design Interview Prep".',
            link: '/mentorship',
            is_read: 0
        },
        {
            user_id: alex.id,
            type: 'session_scheduled',
            title: 'Upcoming Session Scheduled',
            message: 'Your mentorship session with Sarah Chen is scheduled for Oct 18, 2026 at 3:00 PM.',
            link: '/mentorship',
            is_read: 0
        },
        {
            user_id: sarah.id,
            type: 'new_message',
            title: 'New Message from Alex Morgan',
            message: 'Alex sent you a message: "Will do! I have also prepared 3 specific questions..."',
            link: '/messages',
            is_read: 0
        },
        {
            user_id: admin.id,
            type: 'profile_verified',
            title: 'New Alumni Verification Required',
            message: 'Jonathan Brooks (Meta) registered and is awaiting alumni credentials review.',
            link: '/admin',
            is_read: 0
        },
        {
            user_id: rahul.id,
            type: 'session_completed',
            title: 'Session Completed',
            message: 'Your session with Sarah Chen has completed. Thank you for leaving your feedback!',
            link: '/mentorship',
            is_read: 1
        }
    ];

    const insertNotifStmt = db.getDb().prepare(`
        INSERT INTO notifications (user_id, type, title, message, link, is_read)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const notif of notifications) {
        insertNotifStmt.run(notif.user_id, notif.type, notif.title, notif.message, notif.link, notif.is_read);
    }
    console.log(`[Seed] Added ${notifications.length} notifications.`);

    // 12. Moderation Report for Admin demo
    db.run(`
        INSERT INTO reports (
            reporter_id, reported_user_id, reason, details, status
        ) VALUES (?, ?, ?, ?, ?)
    `, [
        alex.id,
        jonathan.id,
        'other',
        'Profile verification request: User claims affiliation with Meta engineering management; please review credentials.',
        'pending'
    ]);
    console.log('[Seed] Added sample report for admin moderation queue.');

    console.log('[Seed] Database seeding completed successfully!');
}

if (require.main === module) {
    seedDatabase()
        .then(() => process.exit(0))
        .catch(err => {
            console.error('[Seed Error]', err);
            process.exit(1);
        });
}

module.exports = { seedDatabase };
