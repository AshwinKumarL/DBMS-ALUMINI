# 🗄️ AlumLink — Alumni–Student Relational Database Management System (DBMS)

> An enterprise-grade **Relational Database Management System (DBMS)** designed to store, manage, query, and extract university alumni and student records, mentorship transactions, academic histories, and skill matrices with native ACID-compliant relational guarantees.

---

## ⚡ Core DBMS Features & SQL Capabilities

- **Interactive SQL Console & Query Workbench**:
  - Execute arbitrary SQL commands (`SELECT`, `INSERT`, `UPDATE`, `DELETE`, `JOIN`, `GROUP BY`, `EXPLAIN QUERY PLAN`, `PRAGMA`).
  - View real-time query diagnostics, execution time (in ms), rows affected, and tabular results.
  - **1-Click Pre-Built SQL Queries**:
    - Extract all alumni names with current company, position, graduation year, experience, and average session rating.
    - Extract all student names with degree, major, expected grad year, GPA, and career interests.
    - Multi-table 4-way relational JOINs (Mentorship Sessions, Students, Alumni, and Feedback).
    - Technical skills matrix intersection query (Student skills matching Alumni mentors).
    - Alumni verification audit & moderation queries.
    - Schema catalog inspection (`sqlite_master`).
  - **Export to CSV**: Export any query extraction result directly to CSV with one click.
- **Schema & ER Metadata Explorer**:
  - Introspect all 12 normalized relational tables, column definitions, data types, Primary Keys (PK), Foreign Keys (FK), NOT NULL constraints, and table DDLs.
- **Dedicated DBMS Table Explorers**:
  - **Alumni Records DBMS Table**: Full tabular view of all alumni, multi-column search, filtering by industry and verification status, CSV export, and raw SQL extraction.
  - **Student Records DBMS Table**: Full tabular view of all student records, search by major/GPA/interests, and CSV export.
  - **Mentorship Sessions & Requests Ledger**: Track scheduled meetings, meeting links, agendas, and post-session rating testimonials.


### 1. Role-Based Experiences & Access Control
- **Students:**
  - Create & manage student profiles (Degree, Major, GPA, Expected Grad Year, Career Interests, Target Industries, Portfolio/GitHub links).
  - Discover alumni mentors using multi-faceted filters (Domain, Technical Skills, Organization, Grad Year, Mentorship Availability).
  - View AI-driven **Relevance Match Score (%)** calculating compatibility based on shared skills, interests, and domain goals.
  - Propose mentorship requests with custom topics, learning goals, preferred times, and introductory notes.
  - Schedule 1-on-1 sessions (integrated Google Meet / Zoom links & agendas).
  - Submit ratings (1–5 stars), written testimonials, and highlight tags ("Actionable Advice", "Deep Technical Knowledge", "Inspiring") after sessions.
- **Alumni (Mentors):**
  - Build professional mentor profiles (Current Company, Position, Industry, Years of Experience, Graduation Year, Mentorship Topics, Availability Toggle, Max Mentees limit).
  - Review incoming student requests with 1-click **Accept** or **Decline** (with optional personalized feedback).
  - Host scheduled sessions with meeting links, agendas, and note tracking.
  - Earn a **Verified Alumni Badge** following administration review.
  - Build professional connections with fellow alumni and students.
- **Administrators:**
  - **Alumni Verification Desk:** Review pending alumni credentials (company, role, graduation year, LinkedIn) and approve or reject with custom feedback.
  - **Platform Health & Metrics:** Real-time analytics on total users, verification rates, active requests, conducted sessions, and average student satisfaction.
  - **User Management:** Search and filter all registered users, toggle active/suspended status.
  - **Moderation & Safety:** Review flagged reports, resolve issues with audit notes, or dismiss flags.
  - **Relational SQL Database Health:** Live database telemetry and table counters.

### 2. Built-in 1-Click Demo Persona Switcher
A built-in persona switcher is embedded in the navigation bar to allow reviewers and evaluators to instantly test the platform from all perspectives without repeatedly typing credentials:
- 🎓 **Alex Morgan** — *Student (Senior CS, Aspiring Cloud Systems Engineer)*
- 💼 **Sarah Chen** — *Verified Alumni (Staff Software Engineer @ Google)*
- ⏳ **Jonathan Brooks** — *Pending Alumni (Engineering Manager @ Meta — ready for Admin verification)*
- 🛡️ **Dr. Arthur Pendleton** — *Platform Administrator (Director of Alumni Relations)*

---

## 🗄️ Database Architecture & Relational Schema

The application uses an ACID-compliant **Relational SQL Database Engine** with strict foreign keys, cascade deletes, data normalization (3NF), and performance indexes.

### Normalized Tables
1. `users` — Primary authentication and core user identity (Email, Role, Password Hash, Name, Avatar, Headline, Active status).
2. `student_profiles` — Academic background, GPA, expected graduation, career goals, target industries, links.
3. `alumni_profiles` — Professional credentials, current company, role, experience, verification status, verified_by, max mentees, topics.
4. `skills` — Master skill taxonomy (Languages, Frameworks, Cloud, System Design, Finance, AI).
5. `user_skills` — Junction table connecting users to skills with individual proficiency levels (`Beginner`, `Intermediate`, `Advanced`, `Expert`).
6. `mentorship_requests` — Request state machine (`pending`, `accepted`, `declined`, `completed`, `cancelled`), topic, goals, responses.
7. `mentorship_sessions` — Scheduled sessions with dates, durations, Google Meet/Zoom video links, location type, agendas, completion status.
8. `session_feedback` — Post-session evaluations: 1–5 star ratings, feedback text, highlight recommendation tags.
9. `connections` — Professional networking connections (`pending`, `accepted`, `declined`), optional notes.
10. `messages` — Direct 1-on-1 messaging threads with unread counters and read receipts.
11. `notifications` — Role-targeted alerts (session reminders, request updates, verifications).
12. `reports` — Community moderation queue for flagged accounts.

### Included Migration DDL Scripts
- [SQLite Schema](file:///c:/Users/Ashwin%20Kumar%20L/Desktop/Alumini/server/db/schema.sql) — Out-of-the-box local storage engine.
- [PostgreSQL Schema](file:///c:/Users/Ashwin%20Kumar%20L/Desktop/Alumini/server/db/postgres_schema.sql) — Production-ready PostgreSQL 13+ schema.
- [MySQL Schema](file:///c:/Users/Ashwin%20Kumar%20L/Desktop/Alumini/server/db/mysql_schema.sql) — Production-ready MySQL 8.0+ / MariaDB InnoDB schema.

---

## 🚀 How to Run the Application

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (Tested on Node v24).

### 2. Start the Application
From the project root directory:

```powershell
npm start
```

This single command will:
1. Initialize the SQLite relational database (`alumni_network.db`).
2. Run schema setup and seed realistic sample data (if not already seeded).
3. Start the Express API server and serve the built client application on:
   **`http://localhost:5000`**

Open **`http://localhost:5000`** in your browser to experience the application!

### 3. Optional: Running in Hot-Reload Development Mode
If you wish to run the client and server separately with hot module reloading:

- **Terminal 1 (Backend API):**
  ```powershell
  npm run dev:server
  ```
- **Terminal 2 (Frontend Vite Server):**
  ```powershell
  npm run dev:client
  ```
  *(Vite dev server will run on `http://localhost:3000` and automatically proxies `/api` calls to port 5000).*

---

## 🔐 Pre-Seeded Evaluation Accounts

| Role | Name | Email | Password | Details |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Alex Morgan | `alex.morgan@student.edu` | `password123` | Senior CS student seeking Cloud & Systems roles |
| **Student** | Emily Zhang | `emily.zhang@student.edu` | `password123` | Junior Data Science major interested in Quant Fin |
| **Alumni (Verified)** | Sarah Chen | `sarah.chen@google.com` | `password123` | Staff SWE @ Google, 5.0 ⭐ Rating, 8 yrs exp |
| **Alumni (Verified)** | Marcus Vance | `marcus.vance@stripe.com` | `password123` | VP of Product @ Stripe, Former Founder |
| **Alumni (Pending)** | Jonathan Brooks | `jonathan.brooks@meta.com` | `password123` | EM @ Meta (Use to test Admin verification!) |
| **Administrator** | Dr. Arthur Pendleton | `admin@alumni.edu` | `password123` | Director of Alumni Relations & Platform Admin |

*(Note: You can switch between any of these users instantly using the **Demo Role** dropdown in the top-right navbar).*

---

## 📁 Repository Structure

```
Alumini/
├── package.json                   # Root package & run scripts
├── server/
│   ├── server.js                  # Express backend entry point
│   ├── db/
│   │   ├── index.js               # Relational SQL query & transaction layer
│   │   ├── schema.sql             # SQLite relational schema
│   │   ├── postgres_schema.sql    # PostgreSQL schema script
│   │   ├── mysql_schema.sql       # MySQL InnoDB schema script
│   │   └── seed.js                # Database seeder with realistic entities
│   ├── middleware/
│   │   ├── auth.js                # JWT token authentication & verification
│   │   └── roles.js               # Role-based access control guards
│   └── routes/
│       ├── auth.js                # Login, registration & demo persona endpoints
│       ├── users.js               # Profile editing & master skills taxonomy
│       ├── alumni.js              # Directory search, filtering & AI matchmaker
│       ├── mentorship.js          # Requests, approvals, sessions & rating reviews
│       ├── connections.js         # Networking connection requests
│       ├── messages.js            # Direct 1-on-1 conversations & threads
│       ├── notifications.js       # Real-time alerts & unread management
│       └── admin.js               # Verifications, metrics, moderation & audits
├── client/
│   ├── index.html                 # Single page application entry
│   ├── vite.config.js             # Vite configuration with backend proxy
│   ├── src/
│   │   ├── main.jsx               # React DOM bootstrap
│   │   ├── App.jsx                # Application state & routing orchestration
│   │   ├── index.css              # Dark-mode design system & visual tokens
│   │   ├── services/
│   │   │   └── api.js             # REST API client with JWT injection
│   │   └── components/
│   │       ├── Navbar.jsx         # Navigation bar & 1-click persona switcher
│   │       ├── Dashboard.jsx      # Role-tailored dashboard with KPIs & actions
│   │       ├── ExploreAlumni.jsx  # Mentor directory, search & match scores
│   │       ├── MentorshipHub.jsx  # Requests, sessions & review triggers
│   │       ├── Networking.jsx     # Professional connections directory
│   │       ├── Messages.jsx       # Direct chat threads with instant reply
│   │       ├── AdminPanel.jsx     # Alumni verification & moderation console
│   │       ├── Profile.jsx        # Profile & skills proficiency editor
│   │       └── Modals.jsx         # Booking, rating, request & auth dialogs
└── README.md                      # Comprehensive project documentation
```
