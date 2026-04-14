import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "STUDENT") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      batch: true,
      college: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/30 selection:text-white pb-20">
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Your Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Main Info */}
          <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              {user.avatarUrl || user.image ? (
                <img src={user.avatarUrl || user.image || ""} alt={user.name} className="w-16 h-16 rounded-full bg-zinc-800" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-xl font-bold text-zinc-400">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-zinc-400">{user.email}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="block text-sm text-zinc-500 mb-1">College</span>
                <span className="font-medium text-zinc-300">{user.college?.name || "No College"}</span>
              </div>
              <div>
                <span className="block text-sm text-zinc-500 mb-1">Batch</span>
                <span className="font-medium text-zinc-300">{user.batch?.name || "No Batch"}</span>
              </div>
              <div>
                <span className="block text-sm text-zinc-500 mb-1">Roll Number</span>
                <span className="font-medium text-zinc-300">{user.roll || "Not set"}</span>
              </div>
            </div>
          </div>

          {/* Stats & Settings */}
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
                <span className="block text-sm text-zinc-500 mb-2">Reputation</span>
                <span className="text-3xl font-bold text-white">{user.reputationScore}</span>
              </div>
              <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
                <span className="block text-sm text-zinc-500 mb-2">Longest Streak</span>
                <span className="text-3xl font-bold text-white">🔥 {user.longestStreak}</span>
              </div>
            </div>
            
            <ProfileClient initialLeetcode={user.leetcodeUsername || ""} />
          </div>
        </div>
      </div>
    </div>
  );
}
