import { useState } from "react";
import { generateReminder } from "../../services/aiApi";

const tones = [
  {
    value: "friendly",
    label: "Friendly",
    description: "Polite and approachable",
  },
  {
    value: "professional",
    label: "Professional",
    description: "Clear and business-like",
  },
  {
    value: "firm",
    label: "Firm",
    description: "Direct but respectful",
  },
];

function AIReminder({ invoice }) {
  const [tone, setTone] = useState("friendly");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    try {
      setLoading(true);
      setError("");
      setCopied(false);

      const result = await generateReminder({
        invoiceId: invoice._id,
        tone,
      });

      if (!result.success) {
        throw new Error(
          result.message || "Failed to generate reminder",
        );
      }

      setMessage(
        result.data?.message ||
          result.data?.reminder ||
          "",
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to generate AI reminder",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!message) return;

    await navigator.clipboard.writeText(message);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  if (Number(invoice.remainingAmount) <= 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-violet-200 bg-white shadow-sm dark:border-violet-900/50 dark:bg-slate-900">
      <div className="border-b border-violet-100 p-5 dark:border-violet-900/40">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-lg dark:bg-violet-500/15">
            🤖
          </div>

          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              AI Payment Reminder
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Generate a personalized payment reminder using your invoice
              details.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5 p-5">
        {/* Tone */}
        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Choose tone
          </p>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {tones.map((item) => {
              const selected = tone === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setTone(item.value)}
                  className={`rounded-xl border p-4 text-left transition ${
                    selected
                      ? "border-violet-500 bg-violet-50 dark:border-violet-400 dark:bg-violet-500/10"
                      : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {item.label}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="w-full rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Generating reminder..."
            : message
              ? "Regenerate Reminder"
              : "Generate AI Reminder"}
        </button>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            <p className="font-semibold">
              AI reminder unavailable
            </p>

            <p className="mt-1">{error}</p>

            <p className="mt-2 text-xs opacity-80">
              Make sure GEMINI_API_KEY is configured in the backend
              .env file.
            </p>
          </div>
        )}

        {/* Result */}
        {message && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Generated Message
              </p>

              <button
                type="button"
                onClick={handleCopy}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-violet-600 hover:bg-violet-100 dark:text-violet-400 dark:hover:bg-violet-500/10"
              >
                {copied ? "Copied ✓" : "Copy"}
              </button>
            </div>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">
              {message}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default AIReminder;