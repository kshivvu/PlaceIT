"use client";

import { useState } from "react";
import { AssignmentTypeBadge } from "@/components/AssignmentTypeBadge";
import { SubmissionStatusBadge } from "@/components/SubmissionStatusBadge";
import { RelativeTime } from "@/components/RelativeTime";
import { Button } from "@/components/ui/button";

export default function ReviewClient({ initialData, assignmentId }: { initialData: any, assignmentId: string }) {
  const [data, setData] = useState(initialData);
  const [loadingAction, setLoadingAction] = useState<string | null>(null); // Submission ID currently being processed
  const [reviewNotes, setReviewNotes] = useState<{ [key: string]: string }>({});
  const [showNoteInput, setShowNoteInput] = useState<{ [key: string]: boolean }>({});

  const { assignment, submissions } = data;

  async function handleReview(submissionId: string, status: "CORRECT" | "WRONG") {
    if (status === "WRONG" && (!reviewNotes[submissionId] || !reviewNotes[submissionId].trim())) {
      alert("Please provide a feedback note when marking an assignment wrong.");
      return;
    }

    setLoadingAction(submissionId);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          reviewNote: status === "WRONG" ? reviewNotes[submissionId] : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit review");
      }

      // Update local state without full reload
      const updatedSubmissions = submissions.map((s: any) => 
        s.id === submissionId 
          ? { ...s, status, reviewNote: status === "WRONG" ? reviewNotes[submissionId] : null }
          : s
      );

      let pending = 0, correct = 0, wrong = 0;
      updatedSubmissions.forEach((s: any) => {
        if (s.status === "CORRECT") correct++;
        else if (s.status === "WRONG") wrong++;
        else if (s.status === "PENDING" || s.status === "RESUBMITTED") pending++;
      });

      setData({
        assignment: { ...assignment, pendingReview: pending, correct, wrong },
        submissions: updatedSubmissions,
      });
      setShowNoteInput({ ...showNoteInput, [submissionId]: false });
    } catch (e) {
      console.error(e);
      alert("Error submitting review.");
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleRecheckLeetCode(submissionId: string, username: string, problemUrl: string) {
    setLoadingAction(submissionId);
    try {
      const res = await fetch(`/api/leetcode/check?username=${username}&problemUrl=${encodeURIComponent(problemUrl)}`);
      const rdata = await res.json();
      
      // Update local ui if solved (just a simple local UI update to show ✅ visually)
      if (rdata.solved) {
        const updatedSubmissions = submissions.map((s: any) => 
          s.id === submissionId ? { ...s, leetcodeVerified: true } : s
        );
        setData({ ...data, submissions: updatedSubmissions });
      } else {
        const updatedSubmissions = submissions.map((s: any) => 
          s.id === submissionId ? { ...s, leetcodeVerified: false } : s
        );
        setData({ ...data, submissions: updatedSubmissions });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Bar */}
      <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex flex-wrap gap-6 items-center justify-between">
        <div className="flex gap-4">
          <div className="bg-black/40 px-4 py-2 rounded-xl">
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Submitted</p>
            <p className="text-xl font-semibold text-white">{assignment.totalSubmissions} <span className="text-sm text-zinc-600">/ {assignment.totalStudents}</span></p>
          </div>
          <div className="bg-yellow-500/10 px-4 py-2 rounded-xl border border-yellow-500/20">
            <p className="text-xs text-yellow-500/70 font-medium uppercase tracking-wider">Pending</p>
            <p className="text-xl font-semibold text-yellow-500">{assignment.pendingReview}</p>
          </div>
          <div className="bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20">
            <p className="text-xs text-green-500/70 font-medium uppercase tracking-wider">Correct</p>
            <p className="text-xl font-semibold text-green-500">{assignment.correct}</p>
          </div>
          <div className="bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20">
            <p className="text-xs text-red-500/70 font-medium uppercase tracking-wider">Wrong</p>
            <p className="text-xl font-semibold text-red-500">{assignment.wrong}</p>
          </div>
        </div>
        <AssignmentTypeBadge type={assignment.type} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Assignment Info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl sticky top-6">
            <h3 className="text-lg font-semibold mb-4">Assignment Brief</h3>
            <p className="text-sm text-zinc-400 mb-6">Due {new Date(assignment.dueDate).toLocaleString()}</p>
            
            {assignment.type === "DSA" ? (
              <div className="space-y-3">
                {assignment.content.problems?.map((p: any, i: number) => (
                  <a key={i} href={p.url} target="_blank" rel="noreferrer" className="block p-3 rounded-xl bg-black/40 border border-white/5 hover:border-white/10 text-blue-400 hover:text-blue-300 text-sm truncate">
                    {p.url.replace('https://leetcode.com/problems/', '').replace('/', '')}
                  </a>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <span className="block text-xs text-zinc-500 mb-1">Topic</span>
                  <span className="text-sm font-medium text-white">{assignment.content.topic}</span>
                </div>
                <div>
                  <span className="block text-xs text-zinc-500 mb-1">Description</span>
                  <span className="text-sm text-zinc-300">{assignment.content.description}</span>
                </div>
                <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-sm text-zinc-400">
                  {assignment.content.brief}
                </div>
                {assignment.content.checklist && assignment.content.checklist.length > 0 && (
                  <div>
                    <span className="block text-xs text-zinc-500 mb-2">Checklist</span>
                    <ul className="text-sm text-zinc-300 space-y-1 list-disc pl-4">
                      {assignment.content.checklist.map((c: string, i: number) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Submissions List */}
        <div className="lg:col-span-2 space-y-4">
          {submissions.length === 0 ? (
            <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-2xl text-center text-zinc-400">
              No submissions yet.
            </div>
          ) : (
            submissions.map((sub: any) => {
              const needsReview = sub.status === "PENDING" || sub.status === "RESUBMITTED";
              const isLate = new Date(sub.submittedAt).getTime() > new Date(assignment.dueDate).getTime();

              return (
                <div key={sub.id} className="bg-zinc-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex flex-col sm:flex-row gap-6">
                  
                  {/* Info side */}
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-white text-lg">{sub.user.name}</h4>
                        <p className="text-sm text-zinc-400">{sub.user.roll || "No roll"} • {sub.user.email}</p>
                      </div>
                      <SubmissionStatusBadge status={sub.status} />
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <RelativeTime date={sub.submittedAt} />
                      {isLate && <span className="text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">LATE</span>}
                    </div>

                    <div className="pt-2 flex flex-wrap gap-3">
                      {sub.githubLink && (
                        <a href={sub.githubLink} target="_blank" rel="noreferrer" className="text-sm bg-black/60 px-3 py-1.5 rounded-lg border border-white/10 text-white hover:bg-zinc-800 transition-colors">
                          <span className="mr-2 opacity-50 text-xs">🔗</span>GitHub Repo
                        </a>
                      )}
                      {sub.colabLink && (
                        <a href={sub.colabLink} target="_blank" rel="noreferrer" className="text-sm bg-black/60 px-3 py-1.5 rounded-lg border border-white/10 text-yellow-500 hover:bg-zinc-800 transition-colors">
                          <span className="mr-2 opacity-50 text-xs">📓</span>Colab Notebook
                        </a>
                      )}
                      {assignment.type === "DSA" && sub.user.leetcodeUsername && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-zinc-400">LeetCode: <span className="text-white font-medium">{sub.user.leetcodeUsername}</span></span>
                          {sub.leetcodeVerified === true && <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20">✅ Verified</span>}
                          {sub.leetcodeVerified === false && <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20">❌ Not Verified</span>}
                          {sub.leetcodeVerified === null && <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded border border-zinc-700">⚠️ Check unavailable</span>}
                          
                          {needsReview && assignment.content.problems?.[0]?.url && sub.leetcodeVerified !== true && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-6 text-xs px-2"
                              disabled={loadingAction === sub.id}
                              onClick={() => handleRecheckLeetCode(sub.id, sub.user.leetcodeUsername, assignment.content.problems[0].url)}
                            >
                              Re-check
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {sub.reviewNote && (
                      <div className="bg-black/40 border border-white/5 p-3 rounded-lg text-sm text-zinc-300 mt-2">
                        <span className="text-xs text-zinc-500 block mb-1">Previous Note</span>
                        {sub.reviewNote}
                      </div>
                    )}
                  </div>

                  {/* Actions side */}
                  <div className="w-full sm:w-64 border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6 flex flex-col gap-3 justify-center">
                    {needsReview ? (
                      showNoteInput[sub.id] ? (
                        <div className="space-y-2">
                          <textarea
                            value={reviewNotes[sub.id] || ""}
                            onChange={(e) => setReviewNotes({ ...reviewNotes, [sub.id]: e.target.value })}
                            className="w-full bg-black/40 border border-red-500/30 rounded-lg p-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[80px]"
                            placeholder="Why is it wrong?"
                          />
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1 bg-red-500/20 text-red-500 hover:bg-red-500/30"
                              disabled={loadingAction === sub.id}
                              onClick={() => handleReview(sub.id, "WRONG")}
                            >
                              {loadingAction === sub.id ? "..." : "Submit Review"}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setShowNoteInput({ ...showNoteInput, [sub.id]: false })}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <Button 
                            className="w-full bg-green-500/20 text-green-500 hover:bg-green-500/30 hover:text-green-400 border border-green-500/30"
                            disabled={loadingAction === sub.id}
                            onClick={() => handleReview(sub.id, "CORRECT")}
                          >
                            Mark Correct ✓
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full text-red-400 border-red-500/20 hover:bg-red-500/10 hover:text-red-300"
                            onClick={() => setShowNoteInput({ ...showNoteInput, [sub.id]: true })}
                          >
                            Mark Wrong ✕
                          </Button>
                          {assignment.type === "DSA" && sub.leetcodeVerified === true && (
                            <p className="text-xs text-green-500/70 text-center mt-2">Auto-verified by LeetCode</p>
                          )}
                        </>
                      )
                    ) : (
                      <div className="text-center text-sm font-medium text-zinc-500">
                        Reviewed ✓
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
