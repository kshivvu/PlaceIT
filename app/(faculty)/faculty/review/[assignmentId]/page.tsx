import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ReviewClient from "./ReviewClient";

// Fetch from the local app logic rather than doing a raw HTTP fetch
async function getAssignmentData(id: string, facultyId: string) {
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: {
      batches: { include: { _count: { select: { students: true } } } },
    },
  });

  if (!assignment || assignment.postedById !== facultyId) return null;

  const submissions = await prisma.submission.findMany({
    where: { assignmentId: id },
    include: {
      user: {
        select: { name: true, email: true, roll: true, leetcodeUsername: true },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  const totalStudents = assignment.batches.reduce((sum, b) => sum + b._count.students, 0);

  let correct = 0, wrong = 0, pendingReview = 0;
  submissions.forEach(s => {
    if (s.status === "CORRECT") correct++;
    else if (s.status === "WRONG") wrong++;
    else if (s.status === "PENDING" || s.status === "RESUBMITTED") pendingReview++;
  });

  return {
    assignment: {
      ...assignment,
      totalSubmissions: submissions.length,
      totalStudents,
      pendingReview,
      correct,
      wrong
    },
    submissions
  };
}

export default async function ReviewPage(props: { params: Promise<{ assignmentId: string }> }) {
  const params = await props.params;
  const session = await auth();

  if (!session || !session.user || session.user.role !== "FACULTY") {
    redirect("/login");
  }

  const data = await getAssignmentData(params.assignmentId, session.user.id);

  if (!data) {
    return <div className="p-12 text-center text-white">Assignment not found or unauthorized.</div>;
  }

  // We could just pass the API data down to ReviewClient.
  // Actually, wait, since we need to do LeetCode rechecks and Mark Correct/Wrong, we do need a Client Component.
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/30 selection:text-white pb-20">
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <ReviewClient initialData={data} assignmentId={params.assignmentId} />
      </div>
    </div>
  );
}
