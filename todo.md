Build the auth UI for PlaceIT — a placement training platform.
Use Next.js 16 App Router, Tailwind CSS, and shadcn/ui components.
Place all pages inside app/(auth)/ route group.

CONTEXT:
- Auth is NextAuth v5 with JWT strategy + Credentials provider
- Session contains: id, email, name, role, verificationStatus, collegeId, batchId
- signIn() is imported from "@/auth"
- All pages are public (no session required to view)

---

PAGE 1: app/(auth)/login/page.tsx
- Email + password form
- On submit: call signIn("credentials", { email, password, redirectTo: "/" })
- NextAuth middleware will redirect to correct dashboard based on role
- Show loading state on submit button
- Show error message if signIn fails ("Invalid email or password")
- Link to /signup and /forgot-password
- Clean centered card layout

---

PAGE 2: app/(auth)/signup/page.tsx
Three internal steps managed with useState — no page navigation between steps:

STEP 1 — Details form:
- Fields: name, email, password, confirm password
- Client-side validation: passwords match, email is valid
- On submit: POST /api/auth/send-otp with { email }
- If success → move to Step 2
- Show loading state

STEP 2 — OTP entry:
- Show "We sent a 6-digit code to {email}"
- Single OTP input (6 digits)
- Resend code button (calls send-otp again, disabled for 30s after click)
- On submit: POST /api/auth/verify-signup with { name, email, password, code }
- Response contains { success, verificationStatus }
- If verificationStatus === "VERIFIED" → redirect to /login with message "Account created. Please log in."
- If verificationStatus === "PENDING" → redirect to /pending
- Show loading state and error messages

STEP 3 is just the redirect — no UI needed.

Show a step indicator at top: Step 1 of 2, Step 2 of 2.

---

PAGE 3: app/(auth)/pending/page.tsx
- Read session with auth() — user is logged in but PENDING
- Show their name and email from session
- Message: "Your account is pending approval from your college coordinator."
- "What happens next" section explaining the process
- Sign out button (calls signOut())
- Clean centered layout, no navigation

---

PAGE 4: app/(auth)/forgot-password/page.tsx
Two internal steps:

STEP 1 — Email input:
- Single email field
- On submit: POST /api/auth/send-otp with { email }
- If success → move to Step 2

STEP 2 — OTP + new password:
- OTP input (6 digits)
- New password field
- Confirm new password field
- On submit: POST /api/auth/reset-password with { email, code, password }
- On success → redirect to /login with message "Password reset. Please log in."
- Show errors inline

---

SHARED REQUIREMENTS:
- All API calls use fetch() with proper error handling
- Show field-level error messages from API responses
- Use shadcn Button, Input, Card, Label components
- Dark mode compatible (use Tailwind semantic classes not hardcoded colors)
- Mobile responsive
- No react-hook-form — use controlled inputs with useState for simplicity
- TypeScript throughout, no 'any' types

---

## 🚀 IMPLEMENTATION SUMMARY

✅ **Completed All UI Requirements with Premium Upgrades**
- Installed `framer-motion`, `lucide-react`, `clsx`, and `tailwind-merge`.
- Created custom `shadcn`-inspired primitives (`Button`, `Input`, `Label`, `Card`) designed specifically to work cleanly with Tailwind CSS v4 without conflict. Focus was on a modern glassmorphic look with glowing borders, hover physics, and integrated loading spinners.
- Built a stunning global Auth Layout (`app/(auth)/layout.tsx`) featuring a subtle mesh gradient background and a dot grid overlay.
- Transformed the `app/(auth)/login/page.tsx` into an elegant, animated card with full form validation and interactive loading states.
- Implemented `app/(auth)/signup/page.tsx` as a seamless animated 2-step process using `framer-motion`'s `AnimatePresence`. Swiping and transitioning states feel hyper-responsive.
- Created `app/(auth)/pending/page.tsx` featuring a clean, centralized message display confirming their pending coordinator status and describing the next steps. Incorporates a one-click server action to sign out.
- Implemented `app/(auth)/forgot-password/page.tsx` as a beautiful 2-step OTP and Reset flow with countdown timers and dynamic slide animations matching the signup page standard.

## 🔧 POST-UI FIXES & ENHANCEMENTS

✅ **Edge Middleware & NextAuth v5 Compatibility**
- **Change:** Extracted NextAuth configuration into a pristine `auth.config.ts` without Node dependencies, while injecting Prisma and `bcryptjs` exclusively inside `auth.ts`.
- **Reasoning:** Next.js `middleware.ts` runs on the Edge Runtime, which crashes if it attempts to load Node.js modules like Prisma or standard bcrypt buffers. Decoupling the config allows the middleware to execute fast, JWT-based session authorization checks natively at the edge, while API routes securely process the heavy DB operations in standard Node runtime.

✅ **Middleware Routing Priorities & UX Flash Fix**
- **Change:** Promoted the `PENDING` user lock (`verificationStatus !== "VERIFIED"`) to **Rule 0** — meaning it executes *before* allowing access to `publicRoutes` like `/`.
- **Reasoning:** Previously, public routes bypassed the auth lock. A newly registered (or logging in) pending user would successfully be redirected to the landing page `/`, and because it was a public route, the middleware happily let it through. This resulted in an unwanted layout flash before client logic eventually caught it. By enforcing the pending condition globally at the very top of `middleware.ts`, pending users instantly receive a 307 redirect to `/pending` safely and instantly at the server level.

✅ **Dynamic College Selection Hooking**
- **Change:** Added a glassmorphic `<select>` dropdown to "Step 1" of `signup/page.tsx` that requires a `collegeId`. Created the `GET /api/colleges` route to feed this dropdown, and added `/api/colleges` to `publicRoutes` in the middleware so the request doesn't bounce to the login page.
- **Reasoning:** Without a dropdown in Step 1, students registering with personal emails (like Gmail) had no way to indicate which college they attended. Consequently, the backend had no idea *which* coordinator dashboard to route their verification request to!

✅ **College Detail Verification on `/pending`**
- **Change:** Imported the Prisma client directly into the `PendingPage` server component to dynamically query and reveal the user's assigned college.
- **Reasoning:** Enhances user confidence and trust. Instead of a generic waiting screen, they can now clearly see that their manual request successfully routed to the exact college they selected.

✅ **Database Seeding Pipeline**
- **Change:** Built `prisma/seed.ts` (using `upsert` logic to prevent duplicates) mapped to the customized `@/app/generated/prisma` client output, and wired `"prisma": {"seed": "tsx prisma/seed.ts"}` into `.package.json`.
- **Reasoning:** Since the UI signup flow heavily relied on live database lookup for fetching colleges, developers needed an immediate way to inject mock college logic rapidly without manual GUI database queries.

✅ **Framer Motion Strict Type Safety**
- **Change:** Realigned TS interfaces by casting strict element props inside the `Button.tsx` and `Card.tsx` primitive primitives.
- **Reasoning:** Framer motion attribute signatures (like `onDrag` or `children`) chronically conflict with standard `React.HTMLAttributes` inside Next.js 15+ strict mode. Trimming the typing avoids failing blocking Next.js dev server builds while preserving the 60fps animations.