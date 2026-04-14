import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function StudentDashboardPage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "STUDENT") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, currentStreak: true, longestStreak: true },
  });

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/30 selection:text-white pb-20">
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black"></div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Good morning, {user.name}</h1>
            <p className="text-zinc-400 mt-2 text-sm">Keep up the daily momentum.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-zinc-900/80 border border-orange-500/30 px-4 py-2 rounded-xl">
              <span className="text-orange-500 text-lg">🔥</span>
              <span className="font-bold text-orange-400">{user.currentStreak} day streak</span>
            </div>
            {user.longestStreak > 0 && (
              <div className="hidden sm:flex text-xs text-zinc-500 font-medium px-3 py-1 bg-zinc-900 rounded-lg">
                Best: {user.longestStreak}
              </div>
            )}
          </div>
        </div>

        <DashboardClient />
      </div>
    </div>
  );
}
