"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

export default function OnboardingPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(true);

  const [roll, setRoll] = useState("");
  const [batchId, setBatchId] = useState("");
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBatches() {
      try {
        const res = await fetch("/api/batches");
        if (res.ok) {
          const data = await res.json();
          setBatches(data);
          if (data.length > 0) {
            setBatchId(data[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingBatches(false);
      }
    }
    fetchBatches();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!roll || !batchId) {
      setError("Roll number and Batch are required.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const payload: any = { roll, batchId };
      if (leetcodeUsername) {
        payload.leetcodeUsername = leetcodeUsername;
      }

      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update profile.");
        setIsSubmitting(false);
        return;
      }

      // If we also updated leetcode here, the user needs to actually log out and log in to update the session properly according to NextAuth.
      alert("Profile complete! You will now be redirected to log in again to apply these changes.");
      router.push("/login?callbackUrl=/dashboard");
      // Actually typically redirecting to /api/auth/signout then /login is safest but just pushing to login is requested:
      // message: "Profile complete! Please log in again to continue." (This is handled if we logout, but let's just use router.push('/api/auth/signout') which isn't custom, or redirect to a client side route)
    } catch (err) {
      setError("An unexpected error occurred.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black text-white selection:bg-white/30">
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Complete your profile to get started</h1>
            <p className="text-sm text-zinc-400">
              We just need a few more details to set up your workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="roll">Roll Number <span className="text-red-500">*</span></Label>
              <Input
                id="roll"
                value={roll}
                onChange={(e) => setRoll(e.target.value)}
                placeholder="e.g. 21BCE0001"
                required
                disabled={isSubmitting}
                className="bg-black/50 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch">Batch <span className="text-red-500">*</span></Label>
              {isLoadingBatches ? (
                <div className="h-10 bg-black/50 border border-white/10 rounded-md flex items-center px-3 text-sm text-zinc-500">
                  Loading batches...
                </div>
              ) : (
                <select
                  id="batch"
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full h-10 px-3 bg-black/50 border border-white/10 rounded-md text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                  required
                >
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="leetcode">LeetCode Username <span className="text-zinc-500 font-normal">(Optional)</span></Label>
              <Input
                id="leetcode"
                value={leetcodeUsername}
                onChange={(e) => setLeetcodeUsername(e.target.value)}
                placeholder="e.g. shivam123"
                disabled={isSubmitting}
                className="bg-black/50 border-white/10"
              />
              <p className="text-xs text-zinc-500 mt-1">Required for DSA assignment auto-verification</p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-white text-black hover:bg-zinc-200 py-6 text-base font-semibold"
              disabled={isSubmitting || isLoadingBatches}
            >
              {isSubmitting ? "Saving..." : "Complete Profile"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
