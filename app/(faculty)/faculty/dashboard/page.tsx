import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import FacultyDashboardClient from "./FacultyDashboardClient";

export default async function FacultyDashboardPage() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== "FACULTY") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true },
  });

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/30 selection:text-white pb-20">
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Welcome back, {user.name}</h1>
        <FacultyDashboardClient />
      </div>
    </div>
  );
}
