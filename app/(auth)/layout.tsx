"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden selection:bg-white/30 selection:text-white">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/30 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-rose-900/10 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" 
      />

      {/* Content wrapper */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo / Brand */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white shrink-0 flex items-center justify-center">
              <span className="text-black font-bold text-xl leading-none">P</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">PlaceIT</span>
          </div>
        </motion.div>

        {children}
      </div>
    </div>
  );
}
