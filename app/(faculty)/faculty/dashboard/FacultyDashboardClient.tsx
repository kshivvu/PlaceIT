"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AssignmentTypeBadge } from "@/components/AssignmentTypeBadge";
import { RelativeTime } from "@/components/RelativeTime";
import { Button } from "@/components/ui/button";

export default function FacultyDashboardClient() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/assignments/mine");
        const data = await res.json();
        setAssignments(data);

        // Fetch submissions for each to compile pending reviews
        // (In a real app, a dedicated /api/reviews/pending endpoint is better, but following instructions)
        let allPending: any[] = [];
        
        for (const a of data) {
          if (a.submissionCounts.pendingReview > 0 || a.submissionCounts.resubmitted > 0) {
            const subRes = await fetch(`/api/assignments/${a.id}/submissions`);
            if (subRes.ok) {
              const subData = await subRes.json();
              const pending = subData.submissions
                .filter((s: any) => s.status === "PENDING" || s.status === "RESUBMITTED")
                .map((s: any) => ({ ...s, assignmentType: a.type, assignmentId: a.id }));
              allPending = [...allPending, ...pending];
            }
          }
        }
        
        allPending.sort((x, y) => new Date(x.submittedAt).getTime() - new Date(y.submittedAt).getTime());
        setPendingReviews(allPending);

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <div className="text-zinc-500 animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Section A - Pending Reviews */}
      <div className="lg:col-span-1 space-y-4">
        <h2 className="text-xl font-semibold border-b border-white/10 pb-2">Pending Reviews</h2>
        
        {pendingReviews.length === 0 ? (
          <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl text-center">
            <span className="text-3xl block mb-2">✅</span>
            <p className="text-green-400 font-medium">All caught up!</p>
            <p className="text-green-500/70 text-sm mt-1">No pending reviews.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-zinc-400">{pendingReviews.length} submissions waiting for your review</p>
            {pendingReviews.map(review => (
              <Link key={review.id} href={`/faculty/review/${review.assignmentId}`}>
                <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 p-4 rounded-xl hover:bg-zinc-800 transition-colors group cursor-pointer mt-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-white group-hover:text-blue-400 transition-colors">{review.user.name}</h4>
                      <p className="text-xs text-zinc-500">{review.user.roll || "No roll"}</p>
                    </div>
                    <AssignmentTypeBadge type={review.assignmentType} />
                  </div>
                  <div className="text-xs text-zinc-500 flex items-center justify-between">
                    <span className={review.status === "RESUBMITTED" ? "text-blue-400" : "text-yellow-500"}>
                      {review.status}
                    </span>
                    <RelativeTime date={review.submittedAt} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Section B - My Assignments */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <h2 className="text-xl font-semibold">My Assignments</h2>
          <Button className="bg-white text-black hover:bg-zinc-200" size="sm">
            <Link href="/faculty/post">Post New Assignment</Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {assignments.map(a => {
            const hasPending = a.submissionCounts.pendingReview > 0 || a.submissionCounts.resubmitted > 0;
            const subRate = a.totalStudents ? (a.totalSubmissions / a.totalStudents) * 100 : 0;
            const isPastDue = new Date(a.dueDate).getTime() < Date.now();
            const lowRate = isPastDue && subRate < 50;
            
            let borderClass = "border-white/10";
            if (lowRate) borderClass = "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]";
            else if (hasPending) borderClass = "border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]";
            else if (a.totalSubmissions > 0) borderClass = "border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]";

            return (
              <Link key={a.id} href={`/faculty/review/${a.id}`}>
                <div className={`bg-zinc-900/50 backdrop-blur-md border p-5 rounded-2xl hover:bg-zinc-800 transition-all cursor-pointer h-full flex flex-col ${borderClass}`}>
                  <div className="flex justify-between items-start mb-4">
                    <AssignmentTypeBadge type={a.type} />
                    <span className="text-xs text-zinc-400 font-medium bg-black/40 px-2 py-1 rounded-md">
                      Due {new Date(a.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <p className="text-sm font-medium text-white truncate">
                      {a.type === 'DSA' ? `${a.content.problems?.length} Problems` : a.content.topic}
                    </p>
                    
                    <div className="text-xs text-zinc-500 flex flex-wrap gap-1">
                      {a.batches.map((b: string) => (
                        <span key={b} className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">{b}</span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-zinc-400">Submission Rate</span>
                      <span className="font-medium text-white">{a.totalSubmissions} / {a.totalStudents}</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(subRate, 100)}%` }} />
                    </div>
                    
                    <div className="flex gap-4 mt-3 text-xs">
                      <span className="text-yellow-500">{a.submissionCounts.pendingReview + a.submissionCounts.resubmitted} pending</span>
                      <span className="text-green-500">{a.submissionCounts.correct} correct</span>
                      <span className="text-red-500">{a.submissionCounts.wrong} wrong</span>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  );
}
