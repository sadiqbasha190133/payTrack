import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InvoiceForm from "../components/invoices/InvoiceForm";
import { createInvoice } from "../services/invoiceApi";

function CreateInvoice() {
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(data) {
    try {
      setSaving(true);
      setError("");

      const result = await createInvoice(data);

      if (!result.success) {
        throw new Error(
          result.message || "Failed to create invoice",
        );
      }

      const invoiceId = result.data?.invoice?._id || result.data?._id;

      if (invoiceId) {
        navigate(`/invoices/${invoiceId}`);
      } else {
        navigate("/invoices");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to create invoice",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate("/invoices")}
          className="text-sm font-semibold text-slate-600 hover:underline dark:text-slate-300"
        >
          ← Back to Invoices
        </button>

        <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
          Create Invoice
        </h1>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Create an invoice and start tracking its payments.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900">
        <InvoiceForm
          onSubmit={handleSubmit}
          onCancel={() => navigate("/invoices")}
          loading={saving}
        />
      </section>
    </div>
  );
}

export default CreateInvoice;