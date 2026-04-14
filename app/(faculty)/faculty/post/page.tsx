"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { AssignmentTypeBadge } from "@/components/AssignmentTypeBadge";

type AssignmentType = "DSA" | "FULLSTACK" | "DEVOPS" | "ML";

export default function FacultyPostPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [type, setType] = useState<AssignmentType | null>(null);
  const [batches, setBatches] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(true);

  // Content form states
  const [dsaProblems, setDsaProblems] = useState([{ url: "", difficulty: "EASY" }]);
  const [dsaNote, setDsaNote] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [brief, setBrief] = useState("");
  const [colabUrl, setColabUrl] = useState("");
  const [checklist, setChecklist] = useState([""]);
  
  // Step 3 states
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchBatches() {
      try {
        const res = await fetch("/api/batches");
        if (res.ok) {
          const data = await res.json();
          setBatches(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingBatches(false);
      }
    }
    fetchBatches();
  }, []);

  async function handleSubmit() {
    setError("");
    setIsSubmitting(true);

    try {
      let content: any = {};
      if (type === "DSA") {
        content = { problems: dsaProblems.filter(p => p.url), note: dsaNote };
      } else {
        content = {
          topic,
          description,
          brief,
          checklist: checklist.filter(c => c.trim() !== ""),
        };
        if (type === "ML" && colabUrl) content.colabUrl = colabUrl;
      }

      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          content,
          batchIds: selectedBatches,
          dueDate: new Date(dueDate).toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to post assignment.");
        setIsSubmitting(false);
        return;
      }

      router.push("/faculty/dashboard");
    } catch (err) {
      setError("An unexpected error occurred.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black"></div>
      
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Post New Assignment</h1>
          <span className="text-sm font-medium text-zinc-500 bg-zinc-900/50 px-3 py-1 rounded-full border border-white/10">
            Step {step} of 3
          </span>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl">
            {error}
          </div>
        )}

        <div className="relative overflow-hidden min-h-[400px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {[
                  { id: "DSA", title: "DSA", desc: "LeetCode problems and algorithmic tasks" },
                  { id: "FULLSTACK", title: "Full Stack", desc: "Web applications and API development" },
                  { id: "DEVOPS", title: "DevOps", desc: "Deployment, CI/CD, and infrastructure" },
                  { id: "ML", title: "Machine Learning", desc: "Models, notebooks, and data pipelines" },
                ].map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setType(t.id as AssignmentType);
                      setStep(2);
                    }}
                    className="bg-zinc-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-zinc-800 transition-all cursor-pointer group hover:border-white/20"
                  >
                    <AssignmentTypeBadge type={t.id as AssignmentType} className="mb-4" />
                    <h3 className="text-lg font-medium text-white group-hover:text-blue-400 transition-colors">{t.title}</h3>
                    <p className="text-sm text-zinc-500 mt-2">{t.desc}</p>
                  </div>
                ))}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-zinc-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl space-y-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Content Details</h2>
                  <AssignmentTypeBadge type={type!} />
                </div>

                {type === "DSA" ? (
                  <div className="space-y-4">
                    {dsaProblems.map((p, i) => (
                      <div key={i} className="flex gap-3">
                        <Input
                          placeholder="LeetCode Problem URL"
                          value={p.url}
                          onChange={(e) => {
                            const newP = [...dsaProblems];
                            newP[i].url = e.target.value;
                            setDsaProblems(newP);
                          }}
                          className="flex-1 bg-black/40 border-white/10"
                        />
                        <select
                          value={p.difficulty}
                          onChange={(e) => {
                            const newP = [...dsaProblems];
                            newP[i].difficulty = e.target.value;
                            setDsaProblems(newP);
                          }}
                          className="bg-black/40 border border-white/10 text-white rounded-md px-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
                        >
                          <option value="EASY">EASY</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="HARD">HARD</option>
                        </select>
                        {dsaProblems.length > 1 && (
                          <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => setDsaProblems(dsaProblems.filter((_, idx) => idx !== i))}>
                            X
                          </Button>
                        )}
                      </div>
                    ))}
                    {dsaProblems.length < 10 && (
                      <Button variant="outline" size="sm" className="border-white/10" onClick={() => setDsaProblems([...dsaProblems, { url: "", difficulty: "EASY" }])}>
                        + Add problem
                      </Button>
                    )}
                    <div className="pt-4">
                      <Label className="text-zinc-400">Optional Note to Students</Label>
                      <textarea
                        value={dsaNote}
                        onChange={(e) => setDsaNote(e.target.value)}
                        className="w-full mt-2 bg-black/40 border border-white/10 rounded-md p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[100px]"
                        placeholder="e.g. Focus on recursive approaches first..."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-zinc-400">Topic</Label>
                      <Input value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-2 bg-black/40 border-white/10" placeholder="e.g. Authentication API" />
                    </div>
                    <div>
                      <Label className="text-zinc-400">Short Description</Label>
                      <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full mt-2 bg-black/40 border border-white/10 rounded-md p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[80px]" placeholder="Briefly describe the task" />
                    </div>
                    <div>
                      <Label className="text-zinc-400">Task Instructions (Brief)</Label>
                      <textarea value={brief} onChange={(e) => setBrief(e.target.value)} className="w-full mt-2 bg-black/40 border border-white/10 rounded-md p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[150px]" placeholder="Detailed instructions..." />
                    </div>
                    {type === "ML" && (
                      <div>
                        <Label className="text-zinc-400">Colab Starter URL (Optional)</Label>
                        <Input value={colabUrl} onChange={(e) => setColabUrl(e.target.value)} className="mt-2 bg-black/40 border-white/10" placeholder="https://colab.research.google.com/..." />
                      </div>
                    )}
                    <div className="pt-2">
                      <Label className="text-zinc-400 block mb-2">Checklist Items (Optional)</Label>
                      {checklist.map((c, i) => (
                        <div key={i} className="flex gap-2 mb-2">
                          <Input value={c} onChange={(e) => {
                            const newC = [...checklist];
                            newC[i] = e.target.value;
                            setChecklist(newC);
                          }} className="bg-black/40 border-white/10" placeholder="Requirement..." />
                          {checklist.length > 1 && (
                            <Button variant="ghost" onClick={() => setChecklist(checklist.filter((_, idx) => idx !== i))} className="text-red-400">X</Button>
                          )}
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="border-white/10" onClick={() => setChecklist([...checklist, ""])}>+ Add Item</Button>
                    </div>
                  </div>
                )}

                <div className="pt-6 flex justify-between border-t border-white/10">
                  <Button variant="outline" onClick={() => setStep(1)} className="border-white/10">Back</Button>
                  <Button onClick={() => setStep(3)} className="bg-white text-black hover:bg-zinc-200">Continue</Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-zinc-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl space-y-6"
              >
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Target & Schedule</h2>

                  <div>
                    <Label className="text-zinc-400">Select Batches</Label>
                    <div className="mt-3 bg-black/40 border border-white/10 rounded-xl p-4 max-h-[200px] overflow-y-auto">
                      {isLoadingBatches ? (
                        <p className="text-sm text-zinc-500">Loading batches...</p>
                      ) : batches.length === 0 ? (
                        <p className="text-sm text-zinc-500">No batches found for your college.</p>
                      ) : (
                        batches.map((b) => (
                          <label key={b.id} className="flex items-center gap-3 py-2 cursor-pointer group">
                            <input
                              type="checkbox"
                              className="w-4 h-4 bg-black border-white/20 rounded accent-blue-500"
                              checked={selectedBatches.includes(b.id)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedBatches([...selectedBatches, b.id]);
                                else setSelectedBatches(selectedBatches.filter(id => id !== b.id));
                              }}
                            />
                            <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">{b.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-zinc-400">Due Date & Time</Label>
                    <Input
                      type="datetime-local"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="mt-2 bg-black/40 border-white/10 color-scheme-dark"
                    />
                  </div>
                </div>

                <div className="pt-6 flex justify-between border-t border-white/10">
                  <Button variant="outline" onClick={() => setStep(2)} disabled={isSubmitting} className="border-white/10">Back</Button>
                  <Button onClick={handleSubmit} disabled={isSubmitting || selectedBatches.length === 0 || !dueDate} className="bg-white text-black hover:bg-zinc-200">
                    {isSubmitting ? "Posting..." : "Post Assignment"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
