import { useState } from "react";
import { askAI } from "../services/aiApi";

function AIAssistant() {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const question = message.trim();

    if (!question || loading) {
      return;
    }

    setConversation((current) => [
      ...current,
      {
        role: "user",
        content: question,
      },
    ]);

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const result = await askAI(question);

      if (!result.success) {
        throw new Error(
          result.message || "AI request failed",
        );
      }

      const answer =
        result.data?.answer ||
        result.data?.message ||
        result.data?.response ||
        "";

      setConversation((current) => [
        ...current,
        {
          role: "assistant",
          content:
            answer || "I couldn't find an answer.",
        },
      ]);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to contact AI assistant",
      );
    } finally {
      setLoading(false);
    }
  }

  function clearConversation() {
    setConversation([]);
    setError("");
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-5xl flex-col gap-6">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-violet-600 dark:text-violet-400">
          AI Assistant
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
          Ask PayTrack AI
        </h1>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Ask questions about your invoices, payments and outstanding
          balances.
        </p>
      </div>

      {/* Chat */}
      <section className="flex min-h-[500px] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* Chat header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-500/15">
              🤖
            </div>

            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                PayTrack AI
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Business assistant
              </p>
            </div>
          </div>

          {conversation.length > 0 && (
            <button
              type="button"
              onClick={clearConversation}
              className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Clear
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {conversation.length === 0 && (
            <div className="flex min-h-[350px] items-center justify-center">
              <div className="max-w-lg text-center">
                <div className="text-5xl">💬</div>

                <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                  How can I help?
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Ask about your outstanding invoices, payments,
                  overdue customers or business activity.
                </p>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    "How much money is outstanding?",
                    "Which invoices are overdue?",
                    "Who owes me the most?",
                    "How much have I received?",
                  ].map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => setMessage(question)}
                      className="rounded-xl border border-slate-200 p-3 text-left text-sm text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {conversation.map((item, index) => (
            <div
              key={`${item.role}-${index}`}
              className={`flex ${
                item.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[70%] ${
                  item.role === "user"
                    ? "rounded-br-md bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "rounded-bl-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-6">
                  {item.content}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3 dark:bg-slate-800">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="border-t border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-slate-200 p-4 dark:border-slate-800"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              placeholder="Ask something about your business..."
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-violet-500 dark:focus:ring-violet-900"
            />

            <button
              type="submit"
              disabled={!message.trim() || loading}
              className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Thinking..." : "Ask AI"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default AIAssistant;