Add the forgot password UI flow to PlaceIT.

CONTEXT:
- Next.js 16 App Router, Tailwind CSS, existing auth UI components already built
- The page already exists at app/(auth)/forgot-password/page.tsx but needs 
  to be wired to the real API
- Match the exact visual style of the existing signup page — same card, 
  same step indicator pattern, same animations

FLOW — two internal steps managed with useState, no page navigation:

STEP 1 — Email input:
- Single email field
- Label: "Enter your registered email"
- Button: "Send Reset Code"
- On submit: POST /api/auth/send-otp with body { email }
- Header: { "Content-Type": "application/json" } — required
- On success → move to Step 2, carry email in state
- On error → show error message inline
- Show loading state on button

STEP 2 — OTP + new password:
- Show: "We sent a 6-digit code to {email}"
- Field 1: OTP input (6 digits)
- Field 2: New password (min 6 chars)
- Field 3: Confirm new password
- Validate passwords match client-side before calling API
- On submit: POST /api/auth/reset-password with body 
  { email, code, password }
- Header: { "Content-Type": "application/json" } — required
- Response: { success: true } on success
- On success → redirect to /login
- On error → show error message from API response inline
- Show loading state on button
- Resend code button — calls send-otp again, disabled for 30s after click

SHARED:
- Step indicator at top: "Step 1 of 2" / "Step 2 of 2"
- TypeScript, no any types
- Controlled inputs with useState only — no react-hook-form
- All fetch calls must include Content-Type: application/json header