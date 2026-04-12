@AGENTS.md
# PlaceIT — Complete Product Specification

> This document contains every detail needed to understand, design, and build PlaceIT from scratch. Written for any developer or AI agent picking this up cold.

---

## Table of Contents

1. [What It Is](#what-it-is)
2. [The Problem It Solves](#the-problem-it-solves)
3. [Who Uses It](#who-uses-it)
4. [Core Features](#core-features)
5. [Build Order and Priorities](#build-order-and-priorities)
6. [User Roles and Permissions](#user-roles-and-permissions)
7. [Part 3 — Daily Training Dashboard](#part-3--daily-training-dashboard-build-first)
8. [Part 2 — Personal Progress Tracker](#part-2--personal-progress-tracker-build-second)
9. [Part 1 — The Social Feed](#part-1--the-social-feed-build-last)
10. [Verification System](#verification-system)
11. [Reminder and Flagging Logic](#reminder-and-flagging-logic)
12. [Tech Stack](#tech-stack)
13. [Database Schema](#database-schema)
14. [App Routes and Pages](#app-routes-and-pages)
15. [API Routes](#api-routes)
16. [Week-by-Week Build Plan](#week-by-week-build-plan)
17. [Context and Background](#context-and-background)

---

## What It Is

PlaceIT is a placement-oriented platform built specifically for a single college. It has three layers:

1. A **daily training dashboard** — faculty posts daily DSA problems and full stack assignments, students submit directly on the platform, and admins have full visibility into who submitted, who didn't, and who is consistently falling behind.

2. A **personal progress tracker** — students set placement goals, AI generates a personalized prep roadmap, and daily progress is tracked with streaks, weak topic identification, and nudges.

3. A **placement social feed** — students and seniors share progress, experiences, and guidance. A reputation/level system makes senior voices more visible. Engagement drives levels, not just follower counts.

Everything sits on top of a **verified identity system** — only real students of the college get in, authenticated via college email domain or manual admin approval.

---

## The Problem It Solves

This was built for a specific real-world situation:

- A college has started focusing on placement training
- A faculty member runs daily training — 3-4 Leetcode problems and one full stack topic with a GitHub assignment every day
- Currently students submit via **Google Form** with a GitHub link
- Faculty has **zero visibility** into who actually submitted vs who didn't
- There is **no single place** for placement information — it's scattered across WhatsApp groups, Telegram, and word of mouth
- Students have **no way to track DSA prep** — some use a notebook just to note things down, not to track
- Seniors who got placed are discoverable only through personal connections
- No one knows what companies actually asked — interview experiences are shared verbally or not at all
- The placement coordinator and dean have **no data** on how the batch is actually performing

PlaceIT replaces Google Forms, scattered WhatsApp groups, and verbal information sharing with one verified, structured platform.

---

## Who Uses It

### Real-world context

- Built initially for one college in India
- The faculty running placement training is a key stakeholder — her daily workflow is what Part 3 digitizes
- The placement coordinator/dean needs oversight data
- Students are the primary users — 3rd and 4th year CS students going through placement prep

### Four user types

**Student**
Any student at the college. Signs up with college email (auto-verified) or any email (pending manual approval). Primary user of all three parts of the platform.

**Faculty**
The placement training faculty. Posts daily tasks. Sees live submission dashboard. Sees flagged defaulters. Does not need to manage Google Forms anymore.

**Placement Coordinator / Dean**
Oversight role. Read-only but full visibility across the entire batch. Sees performance data, defaulter lists, best performers, exportable reports. This is the person who manages placement activities at the institutional level.

**Super Admin**
The developer (Shivam) initially. Manages the platform — adds users, assigns roles, manages college settings, full access to everything.

---

## Core Features

### Part 3 — Daily Training Dashboard (highest priority)

- Faculty posts daily DSA problems (up to 4 Leetcode links with difficulty tags)
- Faculty posts daily full stack topic + assignment brief
- Students see today's tasks on their dashboard
- Students submit GitHub repo link directly on the platform
- Automated reminders at 2 PM and 6 PM if not submitted
- Auto-flag at 11:59 PM if still not submitted
- Faculty sees live submission status — who submitted, who hasn't, updated in real time
- Coordinator sees full batch dashboard — submission rates, streaks, defaulters, best performers
- Per-topic completion tracking — how many students completed each assignment

### Part 2 — Personal Progress Tracker (second priority)

- Student sets goal on signup — target company type, timeline, current DSA level
- AI (Gemini API) generates a week-by-week personalized prep roadmap
- Daily view shows what topic is due based on the roadmap
- Student logs problems solved each day
- Streak tracking — consecutive days with logged activity
- Weak topic identification — topics the student consistently skips or logs low numbers for
- Nudge system — notification if no activity logged in 2 days

### Part 1 — The Social Feed (third priority)

- College-only feed — only verified students of the same college see each other's posts
- Students post progress updates, study logs, resources, tips
- Upvote system — posts can be upvoted by peers
- Level/reputation system — upvotes accumulate into levels: Beginner → Contributor → Rising → Expert → Senior
- Seniors get a verified senior badge (comes from their graduation year, not just upvotes)
- Senior posts are surfaced differently in the feed — tagged as guidance, shown more prominently
- No anonymous posting in the feed — this is identity-first

---

## Build Order and Priorities

Build in this exact order. Do not jump ahead.

**Why this order:**
Part 3 solves an immediate, concrete pain for a specific real person (the faculty). It can get real users from day one. Parts 2 and 3 require users to already exist on the platform. The social feed is useless without an existing user base — build it last.

```
Part 3 (Training Dashboard) → Part 2 (Progress Tracker) → Part 1 (Social Feed)
```

---

## User Roles and Permissions

| Action | Student | Faculty | Coordinator | Super Admin |
|---|---|---|---|---|
| See today's tasks | Yes | Yes | Yes | Yes |
| Submit GitHub link | Yes | No | No | No |
| Post daily tasks | No | Yes | No | Yes |
| See live submission status | Own only | All students | All students | All students |
| Flag/unflag students | No | Yes | No | Yes |
| See defaulter list | No | Yes | Yes | Yes |
| See performance rankings | No | Yes | Yes | Yes |
| Export data to CSV | No | No | Yes | Yes |
| Set personal goal + roadmap | Yes | No | No | No |
| Log daily progress | Yes | No | No | No |
| Post in social feed | Yes | Yes | No | Yes |
| Upvote posts | Yes | Yes | No | Yes |
| Add/remove users | No | No | No | Yes |
| Assign roles | No | No | No | Yes |
| Manage college settings | No | No | No | Yes |

---

## Part 3 — Daily Training Dashboard (Build First)

### Faculty posting flow

Every day the faculty posts two things:

**DSA Task**
- Up to 4 Leetcode problem links
- Each problem has a difficulty tag: Easy / Medium / Hard
- Optional note for the batch (e.g. "Focus on sliding window approach today")
- Posted once per day — can be edited until first submission comes in

**Full Stack Task**
- Topic name (e.g. "React useEffect and side effects")
- Description — what to study, what to understand
- Assignment brief — what to build/implement
- Students submit a GitHub repo link as proof of completion

### Student daily view

When a student logs in, they see:

- Today's date and a clear indicator if they've submitted or not
- DSA section — all problems listed with links, difficulty badges, and faculty note
- Full stack section — topic name, description, assignment brief, and a text input to paste GitHub link
- A submit button — one click submits the GitHub link and marks the day complete
- Their current streak (X days in a row)
- A calendar heatmap of the last 30 days — green for submitted, red for missed, gray for future

### Submission rules

- A student can submit once per day
- Submission can be updated until 11:59 PM of that day
- After midnight, the submission is locked — late submissions not accepted (this is intentional for accountability)
- If no submission by 11:59 PM, the day is automatically marked as missed and flagged

### Faculty live dashboard

The faculty dashboard shows:

- A real-time counter — X of Y students submitted today
- A list of all students with their submission status (green tick or pending)
- Clicking a student shows their GitHub link and their last 30 days of history
- A flagged students section — students currently flagged highlighted separately
- Ability to post tomorrow's tasks from the same screen

### Coordinator / Dean dashboard

The coordinator sees:

- Full batch submission rate over time (graph — last 7 days, last 30 days)
- Leaderboard — students ranked by streak + submission rate combined score
- Defaulter list — students who have missed more than threshold submissions this month
- Best performers — top 10 students by consistency
- Per-topic completion — for every assignment posted, what % of students submitted
- Individual student drill-down — click any student, see their full history
- Export button — download all data as CSV

---

## Reminder and Flagging Logic

### Reminder schedule

| Time | Action |
|---|---|
| 2:00 PM | First reminder sent if student hasn't submitted |
| 6:00 PM | Second reminder sent if student still hasn't submitted |
| 11:59 PM | Auto-flag triggered if no submission — day marked as missed |

Reminders are sent via email (Resend) and in-app notification.

### Flagging rules

- Each missed day = 1 flag
- 3 flags in a single week → escalated to coordinator automatically
- 5 missed submissions in a calendar month → student appears on coordinator's permanent defaulter list
- Coordinator can resolve/dismiss flags manually after speaking with the student
- Flag history is permanent and visible to faculty and coordinator — it does not disappear when resolved, it just shows as "resolved"

### Streak rules

- Streak = consecutive days with a submission
- Missing one day breaks the streak back to 0
- Streak is shown on the student's own dashboard and on the coordinator leaderboard
- Longest streak ever is also tracked separately from current streak

---

## Part 2 — Personal Progress Tracker (Build Second)

### Goal setting on signup

When a verified student completes onboarding, they set:

- Target company type: Product Startup / Service Company / FAANG / Open
- Timeline: 1 month / 3 months / 6 months / 1 year
- Current DSA level: Beginner / Some experience / Comfortable with basics / Strong

### AI roadmap generation

Based on these inputs, Gemini API generates:

- A week-by-week plan covering DSA topics in the right order
- Problem count targets per week
- Milestone checkpoints (e.g. "By week 4 you should be comfortable with trees and graphs")
- The roadmap is shown on the student's tracker page as a timeline

The prompt sent to Gemini should include the goal, timeline, current level, and ask for a structured JSON response with weeks, topics, problem counts, and milestones.

### Daily logging

Each day the student can log:

- Topics studied (free text + predefined tags)
- Number of problems solved
- Optional note

This is separate from the daily training submission — the training is what madam assigns, the tracker is personal prep on top of that.

### Weak topic identification

The system identifies weak topics based on:

- Topics the student has skipped for 7+ days
- Topics where they log significantly fewer problems than their weekly target
- Weak topics are surfaced prominently on the dashboard with a suggestion to focus on them

### Nudge system

- If no activity logged for 2 consecutive days → in-app notification + email nudge
- Nudge message is contextual — mentions their current streak and what topic is due on their roadmap

---

## Part 1 — The Social Feed (Build Last)

### Feed basics

- College-only — students only see posts from their own college
- No global feed in v1 — this is intentional, keeps the community tight
- Any verified student can post
- Posts are plain text with optional image attachment
- No anonymous posting — identity-first platform

### Post types (soft categories, not strict filters)

Students naturally post about:

- Daily progress ("solved 3 mediums today, finally understood DP")
- Resources ("this video finally made binary search click for me")
- Questions ("anyone know what Flipkart's OA pattern is this year?")
- Wins ("got shortlisted for Atlassian!")

No strict category system in v1 — let the community define its own patterns first.

### Upvote and level system

- Any verified student can upvote a post — one upvote per student per post
- Total lifetime upvotes received = reputation score
- Levels based on reputation score:

| Level | Name | Upvotes Required |
|---|---|---|
| 1 | Beginner | 0 |
| 2 | Contributor | 50 |
| 3 | Rising | 200 |
| 4 | Expert | 500 |
| 5 | Senior | 1000+ OR verified senior badge |

- Level is shown as a badge on every post and on the student's profile

### Senior guidance posts

- Students in their final year (4th year) automatically get a "Senior" badge regardless of upvotes
- When a senior posts, their post is tagged as "Guidance" and shown with a distinct visual treatment in the feed
- Seniors can also respond to questions and their response gets a "Senior Answer" badge

---

## Verification System

### Path 1 — College email

```
Student signs up with @college.ac.in email
         ↓
System checks email domain against registered domains for the college
         ↓
Domain matches → Auto-verified → Full access immediately
         ↓
Onboarding flow → Set goal → See dashboard
```

### Path 2 — Non-college email

```
Student signs up with Gmail or other email
         ↓
No domain match found
         ↓
Student selects their college manually
         ↓
Verification request sent to Super Admin
         ↓
Until approved: can see platform but cannot submit, post, or track
         ↓
Super Admin approves → Full access
Super Admin rejects → Notified with reason
```

### Why verification matters here

Unlike a generic social app, verification is critical here because:

- Daily training submissions must be real — a fake user submitting fake GitHub links pollutes accountability data
- The coordinator's defaulter list must be accurate — fake accounts gaming the system breaks the entire purpose
- Senior guidance is only valuable if the senior is actually verified as being from the college and having gone through placements

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | Frontend + backend in one codebase, file-based routing, server components |
| Database | PostgreSQL via Neon.tech | Relational data with complex joins, free tier for development |
| ORM | Prisma | Type-safe database queries, schema-first, great with Next.js |
| Auth | NextAuth v5 (beta) | App Router compatible, Prisma adapter available, handles sessions |
| Email | Resend | Simple API, reliable delivery, free tier sufficient for one college |
| File uploads | Cloudinary | Profile photos, post images |
| AI | Gemini API | Roadmap generation, free tier available |
| UI | Tailwind CSS + shadcn/ui | Utility-first CSS, pre-built accessible components |
| Deployment | Vercel | Native Next.js support, free tier, easy env var management |
| Cron jobs | Vercel Cron | For midnight auto-flagging logic |

---

## Database Schema

### College

```prisma
model College {
  id          String   @id @default(cuid())
  name        String   @unique
  domains     String[] // e.g. ["college.ac.in"]
  createdAt   DateTime @default(now())
  users       User[]
}
```

### User

```prisma
enum Role {
  STUDENT
  FACULTY
  COORDINATOR
  SUPER_ADMIN
}

enum VerificationStatus {
  UNVERIFIED
  PENDING
  VERIFIED
}

model User {
  id                 String             @id @default(cuid())
  name               String
  email              String             @unique
  passwordHash       String?
  avatarUrl          String?
  role               Role               @default(STUDENT)
  verificationStatus VerificationStatus @default(UNVERIFIED)
  year               String?            // "1st", "2nd", "3rd", "4th"
  branch             String?
  reputationScore    Int                @default(0)
  currentStreak      Int                @default(0)
  longestStreak      Int                @default(0)
  createdAt          DateTime           @default(now())

  collegeId          String?
  college            College?           @relation(fields: [collegeId], references: [id])

  accounts           Account[]
  sessions           Session[]
  submissions        Submission[]
  flags              Flag[]
  progressGoal       ProgressGoal?
  progressLogs       ProgressLog[]
  posts              Post[]
  upvotesGiven       Upvote[]
  notifications      Notification[]
}
```

### DailyTask

```prisma
model DailyTask {
  id             String      @id @default(cuid())
  date           DateTime    // The date this task is for — one per day
  dsaProblems    Json        // Array of { url, difficulty, note }
  fullStackTopic String
  fullStackDesc  String
  assignmentBrief String
  postedById     String
  createdAt      DateTime    @default(now())

  submissions    Submission[]
}
```

### Submission

```prisma
model Submission {
  id          String    @id @default(cuid())
  githubLink  String
  submittedAt DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  isMissed    Boolean   @default(false) // true if auto-flagged at midnight

  userId      String
  user        User      @relation(fields: [userId], references: [id])

  taskId      String
  task        DailyTask @relation(fields: [taskId], references: [id])

  flag        Flag?

  @@unique([userId, taskId]) // one submission per student per day
}
```

### Flag

```prisma
enum FlagStatus {
  ACTIVE
  RESOLVED
  ESCALATED
}

model Flag {
  id           String     @id @default(cuid())
  reason       String     // "missed_submission", "escalated_weekly", "monthly_defaulter"
  status       FlagStatus @default(ACTIVE)
  resolvedNote String?
  createdAt    DateTime   @default(now())
  resolvedAt   DateTime?

  userId       String
  user         User       @relation(fields: [userId], references: [id])

  submissionId String?    @unique
  submission   Submission? @relation(fields: [submissionId], references: [id])
}
```

### ProgressGoal

```prisma
enum TargetCompany {
  PRODUCT_STARTUP
  SERVICE_COMPANY
  FAANG
  OPEN
}

enum CurrentLevel {
  BEGINNER
  SOME_EXPERIENCE
  COMFORTABLE
  STRONG
}

model ProgressGoal {
  id            String        @id @default(cuid())
  targetCompany TargetCompany
  timelineMonths Int          // 1, 3, 6, or 12
  currentLevel  CurrentLevel
  roadmap       Json          // AI generated roadmap — array of weeks with topics and targets
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  userId        String        @unique
  user          User          @relation(fields: [userId], references: [id])
}
```

### ProgressLog

```prisma
model ProgressLog {
  id             String   @id @default(cuid())
  topics         String[] // tags e.g. ["arrays", "sliding window"]
  problemsSolved Int
  note           String?
  loggedAt       DateTime @default(now())

  userId         String
  user           User     @relation(fields: [userId], references: [id])

  @@index([userId, loggedAt])
}
```

### Post

```prisma
model Post {
  id          String   @id @default(cuid())
  content     String
  imageUrl    String?
  isGuidance  Boolean  @default(false) // true for senior posts
  createdAt   DateTime @default(now())

  authorId    String
  author      User     @relation(fields: [authorId], references: [id])

  upvotes     Upvote[]
}
```

### Upvote

```prisma
model Upvote {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())

  userId    String
  user      User     @relation(fields: [userId], references: [id])

  postId    String
  post      Post     @relation(fields: [postId], references: [id])

  @@unique([userId, postId])
}
```

### Notification

```prisma
enum NotificationType {
  REMINDER_FIRST       // 2 PM reminder
  REMINDER_SECOND      // 6 PM reminder
  AUTO_FLAGGED         // missed submission at midnight
  ESCALATED            // 3 flags in a week
  MONTHLY_DEFAULTER    // 5 missed in a month
  STREAK_NUDGE         // 2 days no progress logged
  POST_UPVOTED
  VERIFICATION_APPROVED
  VERIFICATION_REJECTED
}

model Notification {
  id        String           @id @default(cuid())
  type      NotificationType
  message   String
  read      Boolean          @default(false)
  createdAt DateTime         @default(now())

  userId    String
  user      User             @relation(fields: [userId], references: [id])
}
```

### NextAuth required models

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}
```

---

## App Routes and Pages

### Public routes (no auth required)

| Route | Page |
|---|---|
| `/` | Landing page — what PlaceIT is, sign up / sign in buttons |
| `/login` | Login page |
| `/signup` | Signup page |
| `/pending` | Shown to users whose verification is pending |

### Student routes (verified student only)

| Route | Page |
|---|---|
| `/dashboard` | Today's tasks, submission box, streak, calendar |
| `/tracker` | Personal roadmap, daily log, weak topics |
| `/feed` | Social feed, post creation |
| `/profile` | Own profile — level, streak, post history |
| `/profile/[username]` | Other student's profile |

### Faculty routes

| Route | Page |
|---|---|
| `/faculty/dashboard` | Live submission status, today's task overview |
| `/faculty/post-task` | Form to post today's DSA + full stack task |
| `/faculty/students` | All students list with submission rates |
| `/faculty/flags` | All currently flagged students |

### Coordinator routes

| Route | Page |
|---|---|
| `/coordinator/overview` | Batch overview — submission rate graph, leaderboard |
| `/coordinator/defaulters` | Full defaulter list with flag history |
| `/coordinator/best-performers` | Top students ranked |
| `/coordinator/student/[id]` | Individual student drill-down |
| `/coordinator/export` | Download CSV of all data |

### Super admin routes

| Route | Page |
|---|---|
| `/admin/users` | All users, role management, verification requests |
| `/admin/college` | College settings, domain management |
| `/admin/tasks` | All tasks history |

---

## API Routes

### Auth

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create account, check email domain, set verification status |
| POST | `/api/auth/[...nextauth]` | NextAuth handler |

### Tasks

| Method | Route | Description |
|---|---|---|
| GET | `/api/tasks/today` | Get today's task for logged-in student |
| POST | `/api/tasks` | Faculty posts a new daily task |
| PUT | `/api/tasks/[id]` | Faculty edits a task (before first submission) |

### Submissions

| Method | Route | Description |
|---|---|---|
| POST | `/api/submissions` | Student submits GitHub link |
| PUT | `/api/submissions/[id]` | Student updates submission (before midnight) |
| GET | `/api/submissions/today` | Faculty gets today's submission list |
| GET | `/api/submissions/student/[id]` | Get a student's full submission history |

### Flags

| Method | Route | Description |
|---|---|---|
| GET | `/api/flags` | Get all active flags (faculty/coordinator) |
| PATCH | `/api/flags/[id]/resolve` | Coordinator resolves a flag |

### Progress

| Method | Route | Description |
|---|---|---|
| POST | `/api/progress/goal` | Student sets goal, triggers AI roadmap generation |
| GET | `/api/progress/goal` | Get current goal and roadmap |
| POST | `/api/progress/log` | Student logs daily activity |
| GET | `/api/progress/logs` | Get student's progress log history |

### Feed

| Method | Route | Description |
|---|---|---|
| GET | `/api/posts` | Get college feed (paginated) |
| POST | `/api/posts` | Create a post |
| POST | `/api/posts/[id]/upvote` | Upvote a post |

### Coordinator

| Method | Route | Description |
|---|---|---|
| GET | `/api/coordinator/overview` | Batch stats — submission rate, streaks |
| GET | `/api/coordinator/leaderboard` | Ranked student list |
| GET | `/api/coordinator/defaulters` | Students past threshold |
| GET | `/api/coordinator/export` | Returns CSV data |

### Cron (internal — triggered by Vercel Cron)

| Method | Route | Description |
|---|---|---|
| POST | `/api/cron/reminders` | Runs at 2 PM and 6 PM — sends reminders to non-submitters |
| POST | `/api/cron/flag-missed` | Runs at 11:59 PM — flags all students who haven't submitted |
| POST | `/api/cron/check-escalations` | Runs daily — checks weekly and monthly thresholds |

---

## Week-by-Week Build Plan

### Week 1 — Foundation

- Next.js project created
- PostgreSQL on Neon connected
- Prisma schema written with all tables
- NextAuth set up with college email domain verification
- All four roles implemented
- Protected routes — each role redirects correctly if unauthorized
- Basic login and signup pages working
- `.env` variables set up: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL

**Deliverable: Any user can sign up, get auto-verified if college email matches, and land on the correct dashboard for their role. Nothing to see yet but auth is bulletproof.**

### Week 2 — Faculty posting + Student daily view

- Faculty can log in and post today's DSA problems + full stack assignment
- Student sees today's task on their dashboard
- Student can submit a GitHub link
- Submission is stored in the database
- Basic streak calculation working
- Calendar heatmap on student dashboard showing last 30 days

**Deliverable: The core loop works. Faculty posts, student submits. This is the version to show the madam for the first time.**

### Week 3 — Live submission dashboard + Coordinator view

- Faculty sees live list of who submitted vs pending today
- Clicking a student shows their GitHub link and 30-day history
- Coordinator dashboard with submission rate graph
- Leaderboard by streak + submission rate
- Individual student drill-down working
- CSV export working

**Deliverable: Faculty and coordinator have full visibility. The product is now genuinely useful to non-students.**

### Week 4 — Reminders + Flagging system

- Vercel Cron jobs set up for 2 PM, 6 PM reminders and 11:59 PM auto-flag
- Resend email integration for reminder emails
- In-app notifications working
- Flag created automatically on missed submission
- Weekly escalation logic (3 flags → escalated)
- Monthly defaulter threshold logic
- Coordinator sees flags and can resolve them
- Faculty sees flagged students highlighted

**Deliverable: The accountability loop is complete. Students get reminded, missing a day has consequences, coordinator has a clear defaulter list.**

### Week 5 — Personal progress tracker + AI roadmap

- Onboarding flow for new students — goal setting
- Gemini API integration for roadmap generation
- Roadmap displayed as a week-by-week timeline
- Daily logging — topics, problem count, note
- Weak topic identification logic
- Nudge notifications for 2 days of inactivity

**Deliverable: Students have a personal prep tool alongside the training. The platform is now useful even on weekends when no training task is posted.**

### Week 6 — Social feed + Polish + Deploy

- Feed page with post creation
- Upvote system
- Reputation score calculation and level badges
- Senior badge for 4th year verified students
- Senior posts styled differently in the feed
- UI polish across all pages
- Error handling and edge cases
- Seed data — initial college, sample tasks, test users for each role
- Deploy on Vercel with production environment variables
- Share with madam and batch

**Deliverable: Full product live. Real students using it.**

---

## Context and Background

This product was designed in a conversation between the developer (Shivam, 3rd year CS student) and an AI. The key decisions and why they were made:

**Why placement-focused instead of general social?**
The original idea was a verified college social network (UNIverse). After discussion, the more valuable angle was placement-specific — because placement prep is an urgent, daily pain for students, and the faculty running training had a concrete problem (Google Forms, no visibility) that could be solved immediately.

**Why build Part 3 first?**
The daily training dashboard solves a problem for a real, specific person (the faculty) right now. It creates daily habit for users before the social features exist. Social features are worthless without an existing user base — Part 3 builds that base.

**Why is the feed built last?**
A feed with no users is an empty room. By the time the feed is built, students are already coming to the platform daily for their training tasks. The feed has an audience.

**Why college-only?**
Verified identity only has value if the verification means something. A college-only platform means every person you interact with is a real, verified peer or senior from your institution. That's more valuable than a general platform.

**The key insight that shaped everything**
The faculty currently runs daily training verbally in class and collects submissions via Google Form. There is zero digital trail, zero visibility, zero accountability data. The coordinator has no idea how the batch is performing. PlaceIT digitizes an existing workflow — it doesn't ask people to change behaviour, it just makes the existing behaviour trackable and visible.

---

*Last updated: March 2026. Built for one college, designed to expand.*
