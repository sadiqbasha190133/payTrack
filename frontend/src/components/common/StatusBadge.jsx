const statusStyles = {
  PAID: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  PARTIAL:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  PENDING:
    "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  OVERDUE:
    "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
};

function StatusBadge({ status }) {
  const classes =
    statusStyles[status] ||
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}
    >
      {status || "UNKNOWN"}
    </span>
  );
}

export default StatusBadge;