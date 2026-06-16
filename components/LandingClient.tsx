"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Code, 
  Sparkles, 
  Users, 
  Flame, 
  CheckCircle, 
  ShieldCheck, 
  BarChart3,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
  ClipboardList
} from "lucide-react";

export default function LandingClient() {
  // Animation presets
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-zinc-950 font-sans text-zinc-100 antialiased">
      {/* Subdued, professional background gradient (Steel blue, very soft) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-[600px] w-full max-w-7xl rounded-full bg-blue-500/[0.02] blur-[140px] pointer-events-none" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-40" />

      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-900/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 shadow-sm">
              <span className="font-mono text-base font-extrabold text-white">P</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Place<span className="text-blue-500">IT</span>
            </span>
          </Link>

          <div className="flex items-center gap-5">
            <Link 
              href="/login" 
              className="text-sm font-medium text-zinc-400 transition hover:text-white"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="group flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition active:scale-95"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-6 pt-16 pb-16 md:pt-28 md:pb-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-center">
          
          {/* Left Column: Heading & CTA */}
          <div className="lg:col-span-6 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs font-medium text-zinc-300"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              <span>Verified Placement & Training Portal</span>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-4"
            >
              <motion.h1 
                variants={fadeInUp}
                className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-white"
              >
                Where College Prep Meets{" "}
                <span className="text-blue-500">
                  Placement Success
                </span>
              </motion.h1>

              <motion.p 
                variants={fadeInUp}
                className="text-base text-zinc-400 leading-relaxed max-w-xl"
              >
                PlaceIT digitizes daily training, maps your progress with Gemini AI, and connects you with verified seniors to elevate your placement preparation.
              </motion.p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link 
                href="/signup" 
                className="group flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-5 font-semibold text-white transition active:scale-95 shadow-sm"
              >
                Start Free Account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                href="/login" 
                className="flex h-11 items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-5 font-semibold text-zinc-300 transition hover:bg-zinc-900 hover:text-white active:scale-95"
              >
                Sign In to Portal
              </Link>
            </motion.div>

            {/* Quick Metrics */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="pt-6 border-t border-zinc-900/60 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-zinc-500"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-blue-500" />
                <span>100% Verified Identities</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4.5 w-4.5 text-blue-500" />
                <span>Automated Workflow & Logs</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Clean Dashboard Preview */}
          <div className="lg:col-span-6 relative flex justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative w-full max-w-[480px] rounded-xl border border-zinc-800 bg-zinc-900/20 p-5 shadow-xl shadow-black/40 backdrop-blur-sm"
            >
              {/* Card Header */}
              <div className="mb-4 flex items-center justify-between pb-3 border-b border-zinc-900">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
                  <div className="h-2.5 w-2.5 rounded-full bg-zinc-800" />
                </div>
                <div className="flex items-center gap-1.5 rounded bg-zinc-900/80 px-2 py-0.5 text-[11px] font-medium text-zinc-400 border border-zinc-800/80">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  <span>14 Day Streak</span>
                </div>
              </div>

              {/* Mock Dashboard Layout */}
              <div className="space-y-4">
                {/* Stats Panel */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-zinc-900 bg-zinc-900/40 p-3">
                    <span className="block text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Solved Today</span>
                    <span className="text-lg font-bold text-white mt-1 block">4 / 4 Tasks</span>
                  </div>
                  <div className="rounded-lg border border-zinc-900 bg-zinc-900/40 p-3">
                    <span className="block text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">AI Goal</span>
                    <span className="text-lg font-bold text-blue-400 mt-1 block">FAANG Ready</span>
                  </div>
                </div>

                {/* LeetCode assignment widget */}
                <div className="rounded-lg border border-zinc-900 bg-zinc-950/60 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300">Today's DSA Assignment</span>
                    <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-red-400 border border-red-500/10">Hard</span>
                  </div>
                  <p className="text-sm font-medium text-zinc-400 truncate">Merge k Sorted Lists (LeetCode #23)</p>
                  <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
                    <span>Submitted: 2:40 PM</span>
                    <span className="text-green-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="h-3.5 w-3.5" /> Verified
                    </span>
                  </div>
                </div>

                {/* AI Roadmap snippet */}
                <div className="rounded-lg border border-zinc-900 bg-zinc-950/60 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300">AI Roadmap Tracker</span>
                    <span className="text-xs text-zinc-500">Week 3 of 8</span>
                  </div>
                  {/* Progress Line */}
                  <div className="h-1.5 w-full rounded-full bg-zinc-900 overflow-hidden">
                    <div className="h-full w-3/5 rounded-full bg-blue-600" />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-zinc-400">
                    <span>Focus: Trees & Graphs</span>
                    <span className="text-blue-400 font-semibold">60% Complete</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Core Features Grid */}
      <section className="border-t border-zinc-900/60 bg-zinc-950/50 px-6 py-20 md:py-28">
        <div className="mx-auto max-w-7xl">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-blue-500">Core Capabilities</h2>
            <p className="text-3xl font-bold sm:text-4xl text-white tracking-tight">
              Digitizing preparation from assignment to placement.
            </p>
            <p className="text-zinc-400 text-sm">
              Three connected modules designed to streamline student accountability, planning, and peer-led guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="group relative rounded-xl border border-zinc-900 bg-zinc-900/10 p-6 transition hover:bg-zinc-900/20 hover:border-zinc-800"
            >
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-blue-400 border border-zinc-800/80 group-hover:text-blue-300 transition-colors">
                <Code className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Daily Training Dashboard</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Faculty posts daily DSA and Full Stack challenges. Students submit GitHub links. Automated 2 PM / 6 PM reminders, and midnight auto-flagging ensure high batch accountability.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="group relative rounded-xl border border-zinc-900 bg-zinc-900/10 p-6 transition hover:bg-zinc-900/20 hover:border-zinc-800"
            >
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-blue-400 border border-zinc-800/80 group-hover:text-blue-300 transition-colors">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Personal Roadmap</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Enter your target company type, timeline, and current skill level. Gemini AI builds a customized, week-by-week DSA roadmap. Streamlines tracking, streak calculations, and weak topic detection.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="group relative rounded-xl border border-zinc-900 bg-zinc-900/10 p-6 transition hover:bg-zinc-900/20 hover:border-zinc-800"
            >
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 text-blue-400 border border-zinc-800/80 group-hover:text-blue-300 transition-colors">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Verified Senior Network</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                A college-only, identity-verified social feed. Connect with final year seniors and peers. Browse interview experiences, ask doubts, and find resources without any spam or anonymity.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Role Showcase */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="rounded-2xl border border-zinc-900 bg-zinc-900/10 p-8 md:p-12 relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-blue-500">Integrated Roles</h2>
              <h3 className="text-3xl font-bold text-white tracking-tight">
                One platform, three powerful viewpoints.
              </h3>
              <p className="text-zinc-400 text-sm">
                Whether you are a student preparing, a faculty member assigning, or a coordinator tracking metrics, PlaceIT gives you a tailormade view.
              </p>
              
              <ul className="space-y-3.5 text-sm text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
                  <span><strong>Students:</strong> See today's tasks, track streaks, and follow AI roadmaps.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
                  <span><strong>Faculty:</strong> Post tasks, monitor submissions, and flag defaulters easily.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
                  <span><strong>Coordinators:</strong> Access batch statistics, streaks, rankings, and CSV exports.</span>
                </li>
              </ul>
            </div>

            {/* Mock Roles Dashboard Interface */}
            <div className="lg:col-span-7 rounded-xl border border-zinc-800 bg-zinc-950 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Coordinator Panel</span>
                <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400 border border-blue-500/10">Overview</span>
              </div>
              
              {/* Batch Stat Graph Widget */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-medium">Batch Submission Rate (Weekly)</span>
                  <span className="text-green-400 font-semibold flex items-center gap-0.5"><TrendingUp className="h-3 w-3" /> +12.3%</span>
                </div>
                
                {/* Visual Bar graph */}
                <div className="flex h-20 items-end justify-between gap-2.5 px-2 pt-2 border-b border-zinc-900">
                  <div className="h-3/5 w-full rounded-t-sm bg-zinc-900" />
                  <div className="h-4/5 w-full rounded-t-sm bg-zinc-900" />
                  <div className="h-2/3 w-full rounded-t-sm bg-zinc-900" />
                  <div className="h-[90%] w-full rounded-t-sm bg-blue-600" />
                  <div className="h-3/4 w-full rounded-t-sm bg-blue-600" />
                </div>
                <div className="flex justify-between text-[9px] text-zinc-600 px-1 font-bold">
                  <span>MON</span>
                  <span>TUE</span>
                  <span>WED</span>
                  <span>THU</span>
                  <span>FRI</span>
                </div>
              </div>

              {/* Leaderboard preview list */}
              <div className="pt-2 space-y-2">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block font-mono">Top Performers</span>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs bg-zinc-900/30 border border-zinc-900 px-3 py-1.5 rounded-lg">
                    <span className="text-zinc-300 font-semibold">1. Shivam Kumar</span>
                    <span className="text-zinc-500 font-medium">Streak: 45 days</span>
                  </div>
                  <div className="flex justify-between items-center text-xs bg-zinc-900/30 border border-zinc-900 px-3 py-1.5 rounded-lg">
                    <span className="text-zinc-300 font-semibold">2. Tanya Sharma</span>
                    <span className="text-zinc-500 font-medium">Streak: 42 days</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-5xl px-6 py-12 md:py-20 text-center">
        <div className="relative rounded-2xl border border-zinc-900 bg-zinc-900/10 px-8 py-14 shadow-sm overflow-hidden">
          
          <div className="max-w-2xl mx-auto space-y-5 relative z-10">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Ready to accelerate your career?
            </h2>
            <p className="text-zinc-400 max-w-md mx-auto text-sm leading-relaxed">
              Create your account with your college email for instant verification, or sign up to request coordinator approval.
            </p>
            
            <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/signup" 
                className="group flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 px-6 font-semibold text-white transition active:scale-95 shadow-sm"
              >
                Sign Up Now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link 
                href="/login" 
                className="flex h-11 items-center justify-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-6 font-semibold text-zinc-300 transition hover:bg-zinc-900 hover:text-white active:scale-95"
              >
                Login to Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900/60 bg-zinc-950 py-10 px-6">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded border border-zinc-800 bg-zinc-900">
              <span className="font-mono text-sm font-bold text-white">P</span>
            </div>
            <span className="text-sm font-bold text-zinc-300 tracking-tight">
              PlaceIT
            </span>
          </div>

          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} PlaceIT. Built for college placement excellence.
          </p>

          <div className="flex gap-5 text-xs text-zinc-500">
            <Link href="/login" className="hover:text-zinc-300">Login</Link>
            <Link href="/signup" className="hover:text-zinc-300">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
