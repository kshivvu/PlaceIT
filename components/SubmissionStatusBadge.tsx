import { cn } from "@/lib/utils";
import { type SubmissionStatus } from "@/app/generated/prisma";

interface SubmissionStatusBadgeProps {
  status: SubmissionStatus | null | undefined;
  className?: string;
}

const styles: Record<SubmissionStatus, string> = {
  PENDING: "bg-yellow-400/10 text-yellow-500 ring-yellow-400/20",
  CORRECT: "bg-green-500/10 text-green-500 ring-green-500/20",
  WRONG: "bg-red-500/10 text-red-500 ring-red-500/20",
  RESUBMITTED: "bg-blue-500/10 text-blue-500 ring-blue-500/20",
};

const labels: Record<SubmissionStatus, string> = {
  PENDING: "Submitted — awaiting review",
  CORRECT: "Correct ✓",
  WRONG: "Wrong — resubmit",
  RESUBMITTED: "Resubmitted — awaiting review",
};

export function SubmissionStatusBadge({ status, className }: SubmissionStatusBadgeProps) {
  if (!status) {
    return (
      <span className={cn("inline-flex items-center rounded-md bg-zinc-500/10 px-2 py-1 text-xs font-medium text-zinc-400 ring-1 ring-inset ring-zinc-500/20", className)}>
        Not submitted
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
        styles[status],
        className
      )}
    >
      {labels[status]}
    </span>
  );
}
