import { useState } from "react";
import { generateInsights } from "../../services/aiApi";

function AIInsights() {
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    try {
      setLoading(true);
      setError("");

      const result = await generateInsights();

      if (!result.success) {
        throw new Error(
          result.message || "Failed to generate insights",
        );
      }

      const generatedInsights =
        result.data?.insights ||
        result.data?.message ||
        result.data?.text ||
        "";

      setInsights(generatedInsights);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to generate AI insights",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-violet-200 bg-white shadow-sm dark:border-violet-900/50 dark:bg-slate-900">
      <div className="flex flex-col gap-4 border-b border-violet-100 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-violet-900/40">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-lg dark:bg-violet-500/15">
            🤖
          </div>

          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              AI Business Insights
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Let AI analyze your current payment and invoice data.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Analyzing..."
            : insights
              ? "Refresh Analysis"
              : "Generate Insights"}
        </button>
      </div>

      <div className="p-5">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            <p className="font-semibold">
              AI insights unavailable
            </p>

            <p className="mt-1">{error}</p>

            <p className="mt-2 text-xs opacity-80">
              Make sure GEMINI_API_KEY is configured in the backend
              .env file.
            </p>
          </div>
        )}

        {!insights && !error && !loading && (
          <div className="rounded-xl bg-slate-50 p-8 text-center dark:bg-slate-950">
            <div className="text-3xl">✨</div>

            <p className="mt-3 font-semibold text-slate-900 dark:text-white">
              No AI analysis yet
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Generate an analysis to discover useful business patterns.
            </p>
          </div>
        )}

        {loading && (
          <div className="rounded-xl bg-slate-50 p-8 text-center dark:bg-slate-950">
            <div className="animate-pulse text-3xl">🤖</div>

            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Analyzing your business data...
            </p>
          </div>
        )}

        {insights && !loading && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950">
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300">
              {insights}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default AIInsights;