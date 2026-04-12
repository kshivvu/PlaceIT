import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { Clock, LogOut, ShieldAlert, CheckCircle, Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PendingPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // If they somehow got here but are verified, send them to dashboard
  if (session.user.verificationStatus === "VERIFIED") {
    redirect("/");
  }

  let collegeName = "Unknown College";
  if (session.user.collegeId) {
    const college = await prisma.college.findUnique({
      where: { id: session.user.collegeId }
    });
    if (college) {
      collegeName = college.name;
    }
  }

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <Card className="text-center">
      <CardHeader className="flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-blue-500/20">
          <Clock className="w-8 h-8 text-blue-400" />
        </div>
        <CardTitle className="text-2xl">Account Pending Approval</CardTitle>
        <CardDescription className="text-base mt-2">
          Your account has been created but requires coordinator access.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 mx-auto max-w-sm text-left">
          <p className="text-sm text-zinc-400">Logged in as</p>
          <p className="font-medium text-white">{session.user.name}</p>
          <p className="text-sm text-zinc-500 mb-3">{session.user.email}</p>
          
          <div className="pt-3 border-t border-white/10 mt-1">
            <p className="text-sm text-zinc-400 mb-1">Requested College</p>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-zinc-500" />
              <p className="text-sm text-zinc-300 truncate" title={collegeName}>{collegeName}</p>
            </div>
          </div>
        </div>

        <div className="text-left space-y-4">
          <h4 className="font-medium text-white px-2">What happens next?</h4>
          <ul className="space-y-3">
            <li className="flex gap-3 text-sm text-zinc-400">
              <ShieldAlert className="w-5 h-5 text-zinc-500 shrink-0" />
              <span>Because you used a non-college domain, your college coordinator must manually verify your identity.</span>
            </li>
            <li className="flex gap-3 text-sm text-zinc-400">
              <CheckCircle className="w-5 h-5 text-zinc-500 shrink-0" />
              <span>Once approved, you will get an email notification and gain full access to the training dashboard.</span>
            </li>
          </ul>
        </div>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-white/5 pt-6">
        <form action={handleSignOut} className="w-full">
          <Button type="submit" variant="outline" className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
