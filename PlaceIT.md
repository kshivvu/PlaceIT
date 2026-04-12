# PlaceIT — Product Specification V3

> Updated from V2 based on actual build decisions made during Week 1 development.
> Key changes: OTP-only on signup/reset (not login), coordinator handles verification,
> PENDING users can log in but are locked to /pending, PrismaAdapter removed from NextAuth,
> new OtpCode model, corrected schema bugs from V2.

---

## Table of Contents

1. [What It Is](#what-it-is)
2. [The Problem It Solves](#the-problem-it-solves)
3. [Who Uses It](#who-uses-it)
4. [Core Features](#core-features)
5. [Build Order](#build-order)
6. [User Roles and Permissions](#user-roles-and-permissions)
7. [Part 3 — Daily Training Dashboard](#part-3--daily-training-dashboard)
8. [Part 2 — Personal Progress Tracker](#part-2--personal-progress-tracker)
9. [Part 1 — Social Feed](#part-1--social-feed)
10. [Verification System](#verification-system)
11. [Auth System](#auth-system)
12. [Reminder and Flagging Logic](#reminder-and-flagging-logic)
13. [Reputation and Leaderboard](#reputation-and-leaderboard)
14. [Tech Stack](#tech-stack)
15. [Database Schema](#database-schema)
16. [App Routes](#app-routes)
17. [API Routes](#api-routes)
18. [Build Progress](#build-progress)
19. [Week-by-Week Build Plan](#week-by-week-build-plan)

---

## What It Is

PlaceIT is a placement-oriented platform built for a single college, designed to scale to multiple colleges. It has three layers:

1. **Daily Training Dashboard** — Faculty posts assignments per batch, students submit directly, faculty reviews submissions and gives feedback. Admins have full visibility into who submitted, who didn't, and who is consistently falling behind.

2. **Personal Progress Tracker** — Students set placement goals, AI generates a personalized prep roadmap, daily progress is tracked with streaks, weak topic identification, and nudges.

3. **Placement Social Feed** — Students and seniors share progress, experiences, and guidance. A reputation/level system makes senior voices more visible.

Everything sits on top of a verified identity system — only real students of the college get in.

---

## The Problem It Solves

- A college runs daily placement training across multiple batches
- Multiple faculty members post assignments for different subjects (DSA, Full Stack, DevOps, ML, etc.)
- Currently students submit via Google Form — faculty has zero visibility into who submitted vs who didn't
- No way to assign tasks to specific batches — everyone gets the same form regardless of their batch
- No submission review system — faculty can't mark work as correct or wrong
- No single place for placement information — scattered across WhatsApp and Telegram
- Students have no way to track DSA prep
- The placement coordinator has no data on how the batch is actually performing

PlaceIT replaces Google Forms, scattered WhatsApp groups, and verbal information sharing with one verified, structured, batch-aware platform.

---

## Who Uses It

**Student**
Belongs to a specific batch. Sees only assignments posted to their batch. Submits work, gets reviewed, tracks personal progress.

**Faculty**
Posts assignments for specific subjects. Selects which batches receive each assignment. Reviews submissions for assignments they posted. Cannot review other faculty's submissions.

**Placement Coordinator / Dean**
Read-only but full visibility across all batches. Sees performance data, defaulter lists, best performers, exportable reports. Also handles verification requests for non-domain students in their college.

**Super Admin**
Full access. Manages users, roles, batches, college settings. Developer (Shivam) initially.

---

## Core Features

### Part 3 — Daily Training Dashboard (highest priority)

- Faculty posts assignments with a type (DSA, Full Stack, DevOps, ML — extensible enum)
- Faculty selects which batches receive the assignment and sets a due date
- Each assignment type has its own content structure (validated with Zod)
- Students see only assignments for their batch on their dashboard
- Students submit a GitHub repo link
- Faculty reviews each submission — marks CORRECT or WRONG with a note
- Correct on first try → +10 reputation. Correct after resubmission → +5 reputation
- Wrong submissions → student is notified with review note, can resubmit
- Automated reminders at 2 PM and 6 PM if not submitted
- Auto-flag at 11:59 PM if still not submitted
- Faculty sees live submission status for their assignments only
- Coordinator sees full batch dashboard across all assignments and faculties

### Part 2 — Personal Progress Tracker (second priority)

- Student sets goal on signup — target company type, timeline, current DSA level
- Gemini API generates a week-by-week personalized prep roadmap
- Daily logging — topics studied, problems solved, optional note
- Streak tracking — consecutive days with any logged activity
- Weak topic identification — topics skipped for 7+ days or consistently low numbers
- Nudge system — notification if no activity logged in 2 days

### Part 1 — Social Feed (third priority)

- College-only feed
- Students post progress updates, resources, tips, wins
- Upvote system — one per student per post
- Level/reputation system based on total upvotes received
- Senior badge for 4th year verified students
- Senior posts tagged as "Guidance" and shown prominently
- Public leaderboard showing reputation scores

---

## Build Order

```
Part 3 (Training Dashboard) → Part 2 (Progress Tracker) → Part 1 (Social Feed)
```

Part 3 solves an immediate concrete pain for real people right now. It creates daily habits before social features exist. The social feed is useless without an existing user base.

---

## User Roles and Permissions

| Action | Student | Faculty | Coordinator | Super Admin |
|---|---|---|---|---|
| See assignments for their batch | Yes | Yes | Yes | Yes |
| Submit GitHub link | Yes | No | No | No |
| Post assignments to batches | No | Yes | No | Yes |
| Review submissions | No | Own assignments only | No | Yes |
| See live submission status | Own only | Own assignments | All | All |
| Flag/unflag students | No | Yes | No | Yes |
| See defaulter list | No | Yes | Yes | Yes |
| See performance leaderboard | Yes (public) | Yes | Yes | Yes |
| Export data to CSV | No | No | Yes | Yes |
| Set personal goal + roadmap | Yes | No | No | No |
| Log daily progress | Yes | No | No | No |
| Post in social feed | Yes | Yes | No | Yes |
| Upvote posts | Yes | Yes | No | Yes |
| Manage users / roles / batches | No | No | No | Yes |
| Approve/reject verification requests | No | No | Yes (own college) | Yes |

---

## Part 3 — Daily Training Dashboard

### How batches work

The college has multiple batches (e.g. Batch 1 through Batch 6). Each student belongs to exactly one batch. Faculty can post an assignment to one or more batches. Students only see assignments for their own batch.

### Faculty posting flow

Faculty creates an assignment by:
- Selecting assignment type (DSA / FULLSTACK / DEVOPS / ML — more can be added)
- Filling in the content for that type (structure varies per type)
- Selecting which batches receive this assignment
- Setting a due date

**Content structure per type (stored as JSON, validated with Zod):**

```
DSA:       { problems: [{ url, difficulty }], note? }
FULLSTACK: { topic, description, brief }
DEVOPS:    { topic, description, brief }
ML:        { topic, description, brief }
```

Adding a new type in the future = add to enum + add Zod schema + update faculty form + update student view. No database restructuring needed.

### Student daily view

When a student logs in they see:
- All pending assignments for their batch grouped by due date
- Each assignment shows type badge, content, and submission status
- A text input to paste GitHub link and a submit button
- Their current streak
- A calendar heatmap of last 30 days

### Submission and review flow

```
Student submits GitHub link → status: PENDING
       ↓
Faculty reviews the submission
       ↓
CORRECT → status: CORRECT → reputation += 10
WRONG   → status: WRONG → faculty leaves review note → student notified
       ↓ (if wrong)
Student fixes and resubmits → status: RESUBMITTED
       ↓
Faculty reviews again → CORRECT → reputation += 5
```

**Reputation rules:**
- Correct on first submission: +10
- Correct after resubmission: +5
- Wrong with no resubmission: 0
- Not submitted: 0 (streak breaks, flag created — that is punishment enough)
- No negative reputation — mistakes are part of learning

**Resubmission rule:** Updates the existing submission row (githubLink + status). Does not create a new row. The `@@unique([userId, assignmentId])` constraint enforces one submission per student per assignment.

### Faculty dashboard

- Shows all assignments the faculty posted
- For each assignment: X of Y students submitted, pending list, reviewed list
- Can only review submissions for assignments they posted
- Flagged students highlighted separately

### Coordinator dashboard

- Full batch submission rate over time across all assignments and faculties
- Leaderboard — ranked by reputation score + current streak + submission rate
- Defaulter list — students past threshold
- Individual student drill-down
- CSV export
- Pending verification requests for their college

---

## Verification System

**Path 1 — College email (e.g. shivam@sfit.ac.in):**
- User signs up → OTP sent to that email → OTP verified
- Server extracts domain, checks College.domains array
- Domain match found → verificationStatus = VERIFIED automatically
- User can log in immediately with full access

**Path 2 — Non-college email (e.g. shivam@gmail.com):**
- User signs up → OTP sent to that email → OTP verified
- Server extracts domain, no college match found
- User selects their college from dropdown on signup form
- verificationStatus = PENDING
- User can log in but is locked to /pending page only
- Coordinator of the selected college gets a VERIFICATION_REQUEST notification
- Coordinator reviews and approves or rejects from their dashboard
- On approval → verificationStatus = VERIFIED → user gets email notification
- On rejection → user notified, account stays UNVERIFIED

**Why coordinator and not super admin:**
The coordinator owns their college's students. Super admin (developer) should not be bottleneck for every new student approval.

**Status check:**
PENDING users can log in (password works), but middleware locks them to /pending only.
The /pending page reads their session and shows current status live.
When coordinator approves, they log out and back in to get full access.

---

## Auth System

**Decision: No OAuth. Email + password login with OTP only at critical points.**

### Why no OAuth
OAuth (Google/GitHub) would let anyone with a Gmail sign in. We need domain verification as a gate. OAuth bypasses this control.

### Login flow (daily use — no OTP)
```
User enters email + password
→ Server checks password hash (bcrypt)
→ Checks verificationStatus (PENDING users can log in, locked to /pending)
→ JWT token created with id, role, verificationStatus, collegeId, batchId
→ Redirected to correct dashboard based on role
```

### Signup flow (OTP required — proves email ownership)
```
User fills: name, email, password
→ POST /api/auth/send-otp → 6-digit code emailed via Resend
→ User enters OTP
→ POST /api/auth/verify-signup
  → OTP validated (10 min expiry, single use)
  → Domain check → VERIFIED or PENDING
  → If PENDING → coordinator notified
  → Account created with hashed password
→ Redirect: VERIFIED → /login | PENDING → /pending
```

### Forgot password flow (OTP required — proves email ownership)
```
User enters email on forgot-password page
→ POST /api/auth/send-otp → code emailed
→ User enters OTP + new password
→ POST /api/auth/reset-password
  → OTP validated
  → New password hashed and saved
→ Redirect to /login
```

### Session strategy
JWT (not database sessions). Token signed with NEXTAUTH_SECRET. Contains: id, role, verificationStatus, collegeId, batchId. No DB read needed per request.

### Key implementation notes
- PrismaAdapter is NOT used — incompatible with Credentials provider + JWT strategy in NextAuth v5
- Prisma is used directly inside authorize() via shared lib/prisma.ts client
- PENDING users are NOT blocked at login — middleware handles the lock to /pending
- bcrypt cost factor: 12

---

## Reminder and Flagging Logic

| Time | Action |
|---|---|
| 2:00 PM | First reminder if student hasn't submitted |
| 6:00 PM | Second reminder if still not submitted |
| 11:59 PM | Auto-flag if no submission — day marked as missed |

**Flagging rules:**
- Each missed assignment = 1 flag
- 3 flags in a single week → escalated to coordinator automatically
- 5 missed submissions in a calendar month → permanent defaulter list
- Coordinator can resolve flags manually
- Flag history is permanent — resolved flags show as "resolved", not deleted

**Streak rules:**
- Streak = consecutive days with at least one submission (any status counts — PENDING, CORRECT, WRONG, RESUBMITTED)
- Streak measures consistency. Reputation measures quality. These are separate.
- Missing one day breaks streak to 0
- Longest streak ever tracked separately

---

## Reputation and Leaderboard

**Reputation score** lives on the User model. It only ever goes up. It is calculated from:
- +10 for every first-try correct submission
- +5 for every correct submission after resubmission
- +1 for every upvote received on a social feed post (Part 1)

**Leaderboard ranking** combines three signals:
- Reputation score (quality)
- Current streak (consistency right now)
- Submission rate (% of assigned tasks submitted)

Submission rate is calculated fresh from Submission rows for leaderboard queries — not stored.

**Reputation levels (for social feed):**

| Level | Name | Reputation Required |
|---|---|---|
| 1 | Beginner | 0 |
| 2 | Contributor | 50 |
| 3 | Rising | 200 |
| 4 | Expert | 500 |
| 5 | Senior | 1000+ OR verified 4th year |

---

## Part 2 — Personal Progress Tracker

### Goal setting on signup

Student sets:
- Target company type: PRODUCT_STARTUP / SERVICE_COMPANY / FAANG / OPEN
- Timeline: 1 / 3 / 6 / 12 months
- Current DSA level: BEGINNER / SOME_EXPERIENCE / COMFORTABLE / STRONG

### AI roadmap generation

Gemini API generates a week-by-week JSON roadmap:
- Topics per week in the correct order
- Problem count targets per week
- Milestone checkpoints

Stored in ProgressGoal.roadmap as JSON.

### Daily logging

Student logs each day:
- Topics studied (free text + predefined tags)
- Number of problems solved
- Optional note

This is separate from assignment submissions — tracker is personal prep on top of training.

### Weak topic identification

Topics skipped for 7+ days or consistently below weekly target are surfaced prominently.

---

## Part 1 — Social Feed

- College-only — students only see posts from their own college
- Any verified student can post (plain text + optional image)
- No anonymous posting
- Upvote system — one per student per post
- Senior badge for 4th year verified students
- Senior posts tagged as "Guidance" in the feed
- Public leaderboard visible to all verified students

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) | Frontend + backend in one codebase |
| Database | PostgreSQL via Neon.tech | Relational data, free tier, serverless |
| ORM | Prisma 6 | Type-safe queries, schema-first |
| Auth | NextAuth v5 (beta) | App Router compatible, JWT strategy, Credentials provider |
| Validation | Zod | Runtime validation for login, signup, assignment content JSON |
| Email | Resend | OTP delivery, notifications |
| File uploads | Cloudinary | Profile photos, post images |
| AI | Gemini API | Roadmap generation |
| UI | Tailwind CSS v4 + shadcn/ui | Utility-first, accessible components |
| Deployment | Vercel | Native Next.js, cron jobs, env vars |
| Cron | Vercel Cron | Midnight auto-flagging, reminders |

**Important Prisma 6 note:** Generator output is `../app/generated/prisma`. Import client from `@/app/generated/prisma`, NOT from `@prisma/client`.

**Important NextAuth v5 note:** PrismaAdapter is NOT used. Credentials provider + JWT strategy handles everything directly. Prisma is imported via `@/lib/prisma`.

---

## Database Schema

### Enums

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

enum AssignmentType {
  DSA
  FULLSTACK
  DEVOPS
  ML
}

enum SubmissionStatus {
  PENDING
  CORRECT
  WRONG
  RESUBMITTED
}

enum FlagStatus {
  ACTIVE
  RESOLVED
  ESCALATED
}

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

enum NotificationType {
  REMINDER_FIRST
  REMINDER_SECOND
  AUTO_FLAGGED
  ESCALATED
  MONTHLY_DEFAULTER
  STREAK_NUDGE
  POST_UPVOTED
  SUBMISSION_REVIEWED
  VERIFICATION_APPROVED
  VERIFICATION_REJECTED
  VERIFICATION_REQUEST   // ← added V3: sent to coordinator when non-domain user signs up
}
```

### Models

```prisma
model College {
  id        String   @id @default(cuid())
  name      String   @unique
  domains   String[]
  createdAt DateTime @default(now())

  users     User[]
  batches   Batch[]
}

model Batch {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())

  collegeId   String
  college     College      @relation(fields: [collegeId], references: [id])

  students    User[]
  assignments Assignment[] @relation("AssignmentBatches")

  @@unique([name, collegeId])   // ← V3 fix: was [collegeId, id] in V2 — wrong
}

model User {
  id                 String             @id @default(cuid())
  name               String
  email              String             @unique
  emailVerified      DateTime?          // Required by NextAuth adapter interface
  image              String?            // Required by NextAuth adapter interface
  passwordHash       String?
  avatarUrl          String?
  role               Role               @default(STUDENT)
  verificationStatus VerificationStatus @default(UNVERIFIED)  // ← V3 fix: was PENDING in V2
  reputationScore    Int                @default(0)
  currentStreak      Int                @default(0)
  longestStreak      Int                @default(0)
  createdAt          DateTime           @default(now())

  collegeId          String?
  college            College?           @relation(fields: [collegeId], references: [id])

  batchId            String?
  batch              Batch?             @relation(fields: [batchId], references: [id])

  accounts           Account[]
  sessions           Session[]

  submissions        Submission[]
  assignmentsPosted  Assignment[]       @relation("PostedAssignments")  // ← V3 fix: was singular in V2
  reviewsDone        Submission[]       @relation("SubmissionReviews")
  flags              Flag[]
  progressGoal       ProgressGoal?
  progressLogs       ProgressLog[]
  posts              Post[]
  upvotesGiven       Upvote[]
  notifications      Notification[]
}

model Assignment {
  id          String         @id @default(cuid())
  type        AssignmentType
  content     Json
  dueDate     DateTime
  createdAt   DateTime       @default(now())

  postedById  String
  postedBy    User           @relation("PostedAssignments", fields: [postedById], references: [id])

  batches     Batch[]        @relation("AssignmentBatches")
  submissions Submission[]
}

model Submission {
  id           String           @id @default(cuid())
  githubLink   String
  submittedAt  DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
  isMissed     Boolean          @default(false)
  status       SubmissionStatus @default(PENDING)
  reviewedAt   DateTime?
  reviewNote   String?

  userId       String
  user         User             @relation(fields: [userId], references: [id])

  assignmentId String
  assignment   Assignment       @relation(fields: [assignmentId], references: [id])

  reviewedById String?          // ← V3 fix: was non-nullable in V2
  reviewedBy   User?            @relation("SubmissionReviews", fields: [reviewedById], references: [id])

  flag         Flag?

  @@unique([userId, assignmentId])
}

model Flag {
  id           String      @id @default(cuid())
  reason       String
  status       FlagStatus  @default(ACTIVE)
  resolvedNote String?
  createdAt    DateTime    @default(now())
  resolvedAt   DateTime?

  userId       String
  user         User        @relation(fields: [userId], references: [id])

  submissionId String?     @unique
  submission   Submission? @relation(fields: [submissionId], references: [id])
}

model ProgressGoal {
  id             String        @id @default(cuid())
  targetCompany  TargetCompany  // ← V3 fix: was String in V2
  timelineMonths Int
  currentLevel   CurrentLevel
  roadmap        Json
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  userId         String        @unique  // ← V3 fix: @unique was missing in V2
  user           User          @relation(fields: [userId], references: [id])
}

model ProgressLog {
  id             String   @id @default(cuid())
  topics         String[]
  problemsSolved Int
  note           String?
  loggedAt       DateTime @default(now())

  userId         String
  user           User     @relation(fields: [userId], references: [id])

  @@index([userId, loggedAt])
}

model Post {
  id         String   @id @default(cuid())
  content    String
  imageUrl   String?
  isGuidance Boolean  @default(false)
  createdAt  DateTime @default(now())

  authorId   String
  author     User     @relation(fields: [authorId], references: [id])

  upvotes    Upvote[]
}

model Upvote {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())

  userId    String
  user      User     @relation(fields: [userId], references: [id])

  postId    String
  post      Post     @relation(fields: [postId], references: [id])

  @@unique([userId, postId])
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

// ← V3 addition: OTP codes for signup and password reset only
model OtpCode {
  id        String   @id @default(cuid())
  email     String
  code      String
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([email])
}

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

## App Routes

### Public
| Route | Page |
|---|---|
| `/` | Landing page |
| `/login` | Login |
| `/signup` | Signup (3-step: form → OTP entry → redirect) |
| `/forgot-password` | Send OTP to reset password |
| `/reset-password` | Enter OTP + new password |
| `/pending` | Pending verification screen — shows live status |

### Student
| Route | Page |
|---|---|
| `/dashboard` | Today's assignments for batch, submit, streak, calendar |
| `/tracker` | Personal roadmap, daily log, weak topics |
| `/feed` | Social feed, post creation |
| `/leaderboard` | Public reputation leaderboard |
| `/profile` | Own profile |
| `/profile/[username]` | Other student's profile |

### Faculty
| Route | Page |
|---|---|
| `/faculty/dashboard` | Assignments posted, submission status per assignment |
| `/faculty/post` | Form to post new assignment — select type, content, batches, due date |
| `/faculty/review/[assignmentId]` | Review submissions for a specific assignment |
| `/faculty/flags` | Flagged students |

### Coordinator
| Route | Page |
|---|---|
| `/coordinator/overview` | Batch overview — submission rate graph, leaderboard |
| `/coordinator/defaulters` | Defaulter list with flag history |
| `/coordinator/best-performers` | Top students |
| `/coordinator/student/[id]` | Individual student drill-down |
| `/coordinator/export` | CSV export |
| `/coordinator/verification` | Pending verification requests for their college |

### Admin
| Route | Page |
|---|---|
| `/admin/users` | All users, role management |
| `/admin/batches` | Manage batches |
| `/admin/college` | College settings, domain management |

---

## API Routes

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/send-otp` | Generate OTP, save to DB, email via Resend. Used for signup and forgot-password |
| POST | `/api/auth/verify-signup` | Validate OTP, create user, domain check, notify coordinator if PENDING |
| POST | `/api/auth/reset-password` | Validate OTP, update password hash |
| POST | `/api/auth/[...nextauth]` | NextAuth handler (login, logout, session) |

### Assignments
| Method | Route | Description |
|---|---|---|
| GET | `/api/assignments/my` | Get assignments for logged-in student's batch |
| POST | `/api/assignments` | Faculty posts new assignment |
| PUT | `/api/assignments/[id]` | Faculty edits assignment (before first submission) |
| GET | `/api/assignments/[id]/submissions` | Faculty gets all submissions for an assignment |

### Submissions
| Method | Route | Description |
|---|---|---|
| POST | `/api/submissions` | Student submits GitHub link |
| PUT | `/api/submissions/[id]` | Student resubmits after WRONG review |
| PATCH | `/api/submissions/[id]/review` | Faculty reviews — marks CORRECT or WRONG with note |

### Flags
| Method | Route | Description |
|---|---|---|
| GET | `/api/flags` | Get all active flags |
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
| GET | `/api/coordinator/overview` | Batch stats |
| GET | `/api/coordinator/leaderboard` | Ranked student list |
| GET | `/api/coordinator/defaulters` | Students past threshold |
| GET | `/api/coordinator/export` | CSV data |
| GET | `/api/coordinator/verification` | Pending verification requests for their college |
| PATCH | `/api/coordinator/verification/[userId]` | Approve or reject a verification request |

### Cron (Vercel Cron)
| Method | Route | Description |
|---|---|---|
| POST | `/api/cron/reminders` | 2 PM and 6 PM — send reminders to non-submitters |
| POST | `/api/cron/flag-missed` | 11:59 PM — flag all students who haven't submitted |
| POST | `/api/cron/check-escalations` | Daily — check weekly and monthly thresholds |

---

## Build Progress

### ✅ Completed

**Schema & Database**
- Complete Prisma schema with all models and enums
- All V2 schema bugs fixed (Batch @@unique, User default, assignmentsPosted array, reviewedById nullable, ProgressGoal targetCompany enum + userId @unique, Flag submissionId @unique)
- OtpCode model added
- VERIFICATION_REQUEST added to NotificationType enum
- emailVerified + image fields added to User for NextAuth compatibility
- Neon PostgreSQL connected and fully migrated

**Auth Foundation**
- `auth.ts` — NextAuth v5, JWT strategy, Credentials provider, authorize() with bcrypt + Zod validation, PENDING users allowed through, jwt + session callbacks with custom fields
- `app/api/auth/[...nextauth]/route.ts` — NextAuth route handler
- `types/next-auth.d.ts` — TypeScript augmentation for role, verificationStatus, collegeId, batchId on Session, User, JWT
- `middleware.ts` — 4-rule route protection: public routes, unauthenticated redirect, PENDING lock to /pending, role-based access
- `lib/prisma.ts` — Shared Prisma client with globalThis hot-reload protection

**Signup & OTP API**
- `app/api/auth/send-otp/route.ts` — OTP generation, previous OTP invalidation, Resend email delivery
- `app/api/auth/verify-signup/route.ts` — OTP validation, user creation, domain check, coordinator notification via Notification model

### ⬜ In Progress / Up Next

**Week 1 remaining:**
- `app/(auth)/login/page.tsx` — email + password form, NextAuth signIn()
- `app/(auth)/signup/page.tsx` — 3-step: form → OTP entry → redirect
- `app/(auth)/pending/page.tsx` — status display using session
- `app/(auth)/forgot-password/page.tsx` — email input, sends OTP
- `app/(auth)/reset-password/page.tsx` — OTP + new password
- `app/api/auth/reset-password/route.ts` — OTP validation + password update

**Week 2:**
- Faculty assignment posting (API + UI)
- Student dashboard with batch assignments (API + UI)
- Student submission flow (API + UI)
- Streak calculation on submission

**Week 3:**
- Faculty review system
- Reputation update on review
- Coordinator dashboard

**Week 4:**
- Vercel Cron jobs
- Flagging and escalation logic
- In-app notifications UI

**Week 5:**
- Progress tracker + Gemini roadmap

**Week 6:**
- Social feed + deploy

---

## Week-by-Week Build Plan

### Week 1 — Foundation ← CURRENT WEEK
- ✅ Prisma schema written with all models
- ✅ Neon connected and first migration run
- ✅ NextAuth v5 set up with credentials provider
- ✅ OTP-based signup with college domain verification
- ✅ Coordinator notified for non-domain signups
- ✅ All four roles implemented in session
- ✅ Protected routes — each role redirects correctly via middleware
- ⬜ Login, signup, pending, forgot-password, reset-password pages

**Deliverable: Any user can sign up, get verified, and land on the correct dashboard for their role.**

### Week 2 — Faculty posting + Student daily view
- Faculty can post an assignment — select type, content (Zod validated), batches, due date
- Student sees assignments for their batch on dashboard
- Student can submit a GitHub link
- Submission stored in database with PENDING status
- Basic streak calculation on submission

**Deliverable: The core loop works. Faculty posts to batches, students submit. Show this to the faculty.**

### Week 3 — Review system + Live dashboard
- Faculty reviews submissions — marks CORRECT or WRONG with note
- Reputation updated on correct review
- Student notified of review result
- Student can resubmit after WRONG
- Faculty sees live submission list per assignment
- Coordinator dashboard with submission rate graph and leaderboard

**Deliverable: The accountability and quality loop is complete.**

### Week 4 — Reminders + Flagging
- Vercel Cron for 2 PM, 6 PM reminders and 11:59 PM auto-flag
- Resend email integration for reminders
- In-app notifications UI
- Weekly escalation logic (3 flags → escalated)
- Monthly defaulter threshold
- Coordinator sees and resolves flags

**Deliverable: Students get reminded, missing has consequences, coordinator has a defaulter list.**

### Week 5 — Personal Progress Tracker + AI
- Onboarding goal-setting flow
- Gemini API roadmap generation
- Roadmap displayed as week-by-week timeline
- Daily logging
- Weak topic identification
- Nudge notifications

**Deliverable: Students have a personal prep tool. Platform is useful on weekends too.**

### Week 6 — Social Feed + Polish + Deploy
- Feed with post creation
- Upvote system + reputation update
- Level badges
- Public leaderboard page
- Senior badge for 4th year students
- UI polish and error handling
- Seed data
- Deploy on Vercel

**Deliverable: Full product live. Real students using it.**

---

*Version 3 — April 2026. Updated during Week 1 development to reflect actual build decisions.*
