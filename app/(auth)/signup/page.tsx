"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, User, Mail, Lock, AlertCircle, CheckCircle2, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
  const router = useRouter();
  
  // Step Management
  const [step, setStep] = useState<1 | 2>(1);
  
  // Step 1: Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [colleges, setColleges] = useState<{ id: string; name: string }[]>([]);
  
  // Step 2: OTP State
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // Shared State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch Colleges
  useEffect(() => {
    async function fetchColleges() {
      try {
        const res = await fetch("/api/colleges");
        if (res.ok) {
          const data = await res.json();
          setColleges(data);
        }
      } catch (err) {
        console.error("Failed to load colleges", err);
      }
    }
    fetchColleges();
  }, []);

  // OTP Resend Timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    // Client-side validation
    if (!collegeId) {
      setError("Please select a college");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send OTP");
      
      setStep(2);
      setResendCooldown(30);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit code");
      return;
    }

    setError("");
    setIsLoading(true);
    
    try {
      const res = await fetch("/api/auth/verify-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, code: otp, collegeId }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      
      if (data.verificationStatus === "VERIFIED") {
        router.push("/login?message=Account created. Please log in.");
      } else {
        router.push("/pending");
      }
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          {step === 2 && (
            <button 
              onClick={() => { setStep(1); setError(""); }}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="text-xs font-medium text-zinc-500 tracking-wider">
            STEP {step} OF 2
          </div>
        </div>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          {step === 1 
            ? "Join your college's official placement platform."
            : `We sent a 6-digit code to ${email}`
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg flex items-center gap-2 mb-4"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form 
              key="step1"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              onSubmit={handleSendOtp} 
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-zinc-500" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">College Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-zinc-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@sfit.ac.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="college">College</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-zinc-500" />
                  <select
                    id="college"
                    value={collegeId}
                    onChange={(e) => setCollegeId(e.target.value)}
                    required
                    className="flex h-11 w-full appearance-none rounded-lg border border-white/10 bg-white/5 pl-10 pr-3 py-2 text-sm text-white shadow-sm transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50 focus-visible:border-white/30 focus-visible:bg-white/10"
                  >
                    <option value="" className="bg-black text-white" disabled>Select your college</option>
                    {colleges.map((c) => (
                      <option key={c.id} value={c.id} className="bg-black text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-zinc-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <CheckCircle2 className="absolute left-3 top-2.5 h-5 w-5 text-zinc-500" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
                {!isLoading && (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </motion.form>
          ) : (
            <motion.form 
              key="step2"
              variants={formVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              onSubmit={handleVerifySignup} 
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required
                  className="text-center text-tracking-widest text-lg font-medium"
                />
              </div>

              <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
                {!isLoading && "Verify & Create Account"}
              </Button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  disabled={resendCooldown > 0 || isLoading}
                  onClick={() => handleSendOtp()}
                  className="text-sm text-zinc-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 
                    ? `Resend code in ${resendCooldown}s` 
                    : "Didn't receive a code? Resend"}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </CardContent>

      {step === 1 && (
        <CardFooter className="flex justify-center border-t border-white/5 pt-6">
          <p className="text-sm text-zinc-400">
            Already have an account?{" "}
            <Link href="/login" className="text-white hover:underline transition-colors">
              Log in
            </Link>
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
