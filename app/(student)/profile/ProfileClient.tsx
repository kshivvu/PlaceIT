"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProfileClient({ initialLeetcode }: { initialLeetcode: string }) {
  const [leetcode, setLeetcode] = useState(initialLeetcode);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/users/me/leetcode", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leetcodeUsername: leetcode }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update LeetCode username");
        return;
      }
      setIsEditing(false);
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-zinc-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
      <h3 className="text-lg font-medium text-white mb-4">Integrations</h3>
      
      <div className="space-y-3">
        <label className="block text-sm font-medium text-zinc-400">LeetCode Username</label>
        
        {!isEditing ? (
          <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-lg px-4 py-3">
            <span className={leetcode ? "text-white" : "text-zinc-600 italic"}>
              {leetcode || "Not connected"}
            </span>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Input
              value={leetcode}
              onChange={(e) => setLeetcode(e.target.value)}
              placeholder="e.g. shivam123"
              disabled={isLoading}
              className="bg-black/40 border-white/10"
            />
            {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isLoading || !leetcode.trim()} className="bg-white text-black hover:bg-zinc-200">
                {isLoading ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" onClick={() => { setIsEditing(false); setLeetcode(initialLeetcode); setError(""); }} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
