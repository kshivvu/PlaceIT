import { cn } from "@/lib/utils";
import { type AssignmentType } from "@/app/generated/prisma";

interface AssignmentTypeBadgeProps {
  type: AssignmentType;
  className?: string;
}

const typeStyles: Record<AssignmentType, string> = {
  DSA: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  FULLSTACK: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  DEVOPS: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  ML: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

export function AssignmentTypeBadge({ type, className }: AssignmentTypeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        typeStyles[type] || "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
        className
      )}
    >
      {type}
    </span>
  );
}
