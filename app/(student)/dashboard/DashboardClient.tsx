"use client";

import { useEffect, useState } from "react";
import { AssignmentTypeBadge } from "@/components/AssignmentTypeBadge";
import { SubmissionStatusBadge } from "@/components/SubmissionStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export default function DashboardClient() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [githubLinks, setGithubLinks] = useState<{ [key: string]: string }>({});
  const [colabLinks, setColabLinks] = useState<{ [key: string]: string }>({});
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMyAssignments() {
      try {
        const res = await fetch("/api/assignments/my");
        const data = await res.json();
        setAssignments(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchMyAssignments();
  }, []);

  async function handleSubmit(assignmentId: string, type: string) {
    setSubmitting(assignmentId);
    setErrorBanner(null);
    
    try {
      const payload: any = { assignmentId };
      if (type !== "DSA") {
        payload.githubLink = githubLinks[assignmentId] || "";
      }
      if (type === "ML") {
        payload.colabLink = colabLinks[assignmentId] || "";
      }

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === "LEETCODE_USERNAME_NOT_SET") {
          setErrorBanner("Set your LeetCode username in your profile before submitting DSA assignments.");
        } else if (data.error?.includes("SUBMISSION_NOT_ALLOWED")) {
          setErrorBanner(data.error);
        } else {
          setErrorBanner(data.error || "Failed to submit.");
        }
        return;
      }
      
      // refresh
      const refreshRes = await fetch("/api/assignments/my");
      const refreshData = await refreshRes.json();
      setAssignments(Array.isArray(refreshData) ? refreshData : []);
    } catch (e) {
      setErrorBanner("An unexpected error occurred.");
    } finally {
      setSubmitting(null);
    }
  }

  if (loading) {
    return <div className="text-zinc-500 animate-pulse">Loading assignments...</div>;
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-20 bg-zinc-900/30 border border-white/5 rounded-2xl">
        <h3 className="text-xl text-zinc-300 font-medium">No assignments yet</h3>
        <p className="text-zinc-500 mt-2">Check back soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {errorBanner && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center justify-between">
          <p>{errorBanner}</p>
          {errorBanner.includes("LeetCode") && (
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/profile'}>
              Go to Profile
            </Button>
          )}
        </div>
      )}

      {assignments.map((assignment, index) => {
        const subStatus = assignment.submission?.status || null;
        
        let subArea = null;
        if (!subStatus || subStatus === "WRONG") {
          if (assignment.type === "DSA") {
            subArea = (
              <Button onClick={() => handleSubmit(assignment.id, assignment.type)} disabled={submitting === assignment.id} className="w-full bg-white text-black hover:bg-zinc-200">
                {submitting === assignment.id ? "Submitting..." : "I've solved these — Submit"}
              </Button>
            );
          } else {
            subArea = (
              <div className="space-y-3">
                <Input placeholder="GitHub Repo Link" value={githubLinks[assignment.id] || ""} onChange={(e) => setGithubLinks({ ...githubLinks, [assignment.id]: e.target.value })} className="bg-black/40 border-white/10" disabled={submitting === assignment.id} />
                {assignment.type === "ML" && (
                  <Input placeholder="Colab Link (Optional)" value={colabLinks[assignment.id] || ""} onChange={(e) => setColabLinks({ ...colabLinks, [assignment.id]: e.target.value })} className="bg-black/40 border-white/10" disabled={submitting === assignment.id} />
                )}
                <Button onClick={() => handleSubmit(assignment.id, assignment.type)} disabled={submitting === assignment.id || !githubLinks[assignment.id]} className="w-full bg-white text-black hover:bg-zinc-200">
                  {submitting === assignment.id ? "Submitting..." : "Submit Task"}
                </Button>
              </div>
            );
          }
        } else if (subStatus === "PENDING" || subStatus === "RESUBMITTED") {
          subArea = <div className="text-center py-3 bg-yellow-500/5 text-yellow-500/80 rounded-lg text-sm font-medium border border-yellow-500/10">Waiting for review...</div>;
        }

        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} key={assignment.id} className="bg-zinc-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex flex-col md:flex-row gap-6 hover:bg-zinc-900/70 transition-colors">
            {/* Left side info */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <AssignmentTypeBadge type={assignment.type} />
                <span className="text-sm text-zinc-400 font-medium">Due {new Date(assignment.dueDate).toLocaleDateString()}</span>
                <SubmissionStatusBadge status={subStatus} />
              </div>
              
              <div>
                {assignment.type === "DSA" ? (
                  <div className="space-y-2 mt-4">
                    {assignment.content.problems?.map((p: any, i: number) => (
                      <a key={i} href={p.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5 hover:border-white/10 transition-colors">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.difficulty === 'HARD' ? 'bg-red-500/20 text-red-400' : p.difficulty === 'MEDIUM' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'}`}>{p.difficulty}</span>
                        <span className="text-blue-400 hover:text-blue-300 truncate">{p.url.replace('https://leetcode.com/problems/', '').replace('/', '')}</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2">
                    <h3 className="text-lg font-semibold text-white">{assignment.content.topic}</h3>
                    <p className="text-zinc-400 mt-1 text-sm">{assignment.content.description}</p>
                    <div className="mt-4 p-4 bg-black/40 border border-white/5 rounded-xl text-sm text-zinc-300">
                      {assignment.content.brief}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right side interactions */}
            <div className="w-full md:w-80 flex flex-col justify-end">
              {subStatus === "WRONG" && assignment.submission?.reviewNote && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">Feedback</p>
                  <p className="text-sm text-red-200">{assignment.submission.reviewNote}</p>
                </div>
              )}
              {subArea}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
