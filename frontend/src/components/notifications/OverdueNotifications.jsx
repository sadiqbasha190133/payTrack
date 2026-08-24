import { useState } from "react";
import { sendOverdueNotifications } from "../../services/notificationApi";

function OverdueNotifications() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleSendNotifications() {
    const confirmed = window.confirm(
      "Send overdue payment reminders to all eligible customers?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const response = await sendOverdueNotifications();

      if (!response.success) {
        throw new Error(
          response.message || "Failed to process notifications"
        );
      }

      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to process overdue notifications."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-amber-200 bg-white shadow-sm dark:border-amber-900/50 dark:bg-slate-900">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-lg dark:bg-amber-500/10">
            🔔
          </div>

          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Overdue Payment Reminders
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Send email reminders to customers with unpaid overdue invoices.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSendNotifications}
          disabled={loading}
          className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Processing..."
            : "Send Overdue Reminders"}
        </button>
      </div>

      {error && (
        <div className="mx-5 mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {result && (
        <div className="border-t border-amber-100 p-5 dark:border-amber-900/40">
          <p className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
            Overdue reminders processed successfully
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Invoices checked
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                {result.processed ?? 0}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-500/10">
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Sent
              </p>

              <p className="mt-1 text-xl font-bold text-emerald-700 dark:text-emerald-300">
                {result.emailsSent ?? 0}
              </p>
            </div>

            <div className="rounded-xl bg-red-50 p-4 dark:bg-red-500/10">
              <p className="text-xs text-red-600 dark:text-red-400">
                Failed
              </p>

              <p className="mt-1 text-xl font-bold text-red-700 dark:text-red-300">
                {result.emailsFailed ?? 0}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Skipped
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                {result.emailsSkipped ?? 0}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default OverdueNotifications;