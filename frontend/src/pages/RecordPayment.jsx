import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import { getInvoice } from "../services/invoiceApi";
import { createPayment } from "../services/paymentApi";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";

const paymentMethods = [
  "CASH",
  "UPI",
  "BANK_TRANSFER",
  "CARD",
  "CHEQUE",
  "OTHER",
];

function RecordPayment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(true);

  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInvoice() {
      try {
        setLoadingInvoice(true);
        setError("");

        const result = await getInvoice(id);

        if (!result.success) {
          throw new Error(
            result.message || "Unable to load invoice",
          );
        }

        setInvoice(result.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load invoice",
        );
      } finally {
        setLoadingInvoice(false);
      }
    }

    loadInvoice();
  }, [id]);

  const remainingAmount = Number(
    invoice?.remainingAmount || 0,
  );

  const enteredAmount = Number(amount) || 0;

  const remainingAfterPayment = useMemo(() => {
    return Math.max(
      0,
      remainingAmount - enteredAmount,
    );
  }, [remainingAmount, enteredAmount]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!invoice) {
      return;
    }

    if (enteredAmount <= 0) {
      setError("Payment amount must be greater than zero.");
      return;
    }

    if (enteredAmount > remainingAmount) {
      setError(
        `Payment cannot exceed the remaining balance of ${formatCurrency(
          remainingAmount,
        )}.`,
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const result = await createPayment({
        invoice: invoice._id,
        amount: enteredAmount,
        paymentDate,
        paymentMethod,
        notes: notes.trim(),
      });

      if (!result.success) {
        throw new Error(
          result.message || "Failed to record payment",
        );
      }

      navigate(`/invoices/${invoice._id}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to record payment",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loadingInvoice) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        Loading invoice...
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="space-y-4">
        <Link
          to="/invoices"
          className="text-sm font-semibold text-slate-600 hover:underline dark:text-slate-300"
        >
          ← Back to Invoices
        </Link>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error || "Invoice not found"}
        </div>
      </div>
    );
  }

  if (remainingAmount <= 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Link
          to={`/invoices/${invoice._id}`}
          className="text-sm font-semibold text-slate-600 hover:underline dark:text-slate-300"
        >
          ← Back to Invoice
        </Link>

        <section className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm dark:border-emerald-900/50 dark:bg-slate-900">
          <div className="text-5xl">✅</div>

          <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            Invoice Already Paid
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            There is no remaining balance on this invoice.
          </p>

          <Link
            to={`/invoices/${invoice._id}`}
            className="mt-6 inline-block rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
          >
            View Invoice
          </Link>
        </section>
      </div>
    );
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-500 dark:focus:ring-slate-800";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          to={`/invoices/${invoice._id}`}
          className="text-sm font-semibold text-slate-600 hover:underline dark:text-slate-300"
        >
          ← Back to Invoice
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
          Record Payment
        </h1>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Record a payment against {invoice.invoiceNumber}.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Invoice balance */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Invoice Total
          </p>

          <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(invoice.totalAmount)}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/50 dark:bg-emerald-500/10">
          <p className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            Already Paid
          </p>

          <p className="mt-2 text-xl font-bold text-emerald-700 dark:text-emerald-300">
            {formatCurrency(invoice.paidAmount)}
          </p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-500/10">
          <p className="text-xs uppercase tracking-wide text-red-600 dark:text-red-400">
            Remaining
          </p>

          <p className="mt-2 text-xl font-bold text-red-700 dark:text-red-300">
            {formatCurrency(remainingAmount)}
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 dark:border-slate-800 dark:bg-slate-900">
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Payment Amount *
              <input
                type="number"
                min="0.01"
                max={remainingAmount}
                step="0.01"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
                required
                placeholder="20000"
                className={inputClass}
              />

              <span className="mt-1 block text-xs text-slate-400">
                Maximum: {formatCurrency(remainingAmount)}
              </span>
            </label>

            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Payment Method *
              <select
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(event.target.value)
                }
                className={inputClass}
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method.replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Payment Date *
              <input
                type="date"
                value={paymentDate}
                onChange={(event) =>
                  setPaymentDate(event.target.value)
                }
                required
                className={inputClass}
              />
            </label>

            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Notes
              <input
                type="text"
                value={notes}
                onChange={(event) =>
                  setNotes(event.target.value)
                }
                placeholder="First partial payment"
                className={inputClass}
              />
            </label>
          </div>

          {/* Preview */}
          <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-950">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Payment Preview
            </p>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Current balance
                </span>

                <span className="font-medium">
                  {formatCurrency(remainingAmount)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  This payment
                </span>

                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  - {formatCurrency(enteredAmount)}
                </span>
              </div>

              <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="font-semibold">
                    Remaining after payment
                  </span>

                  <span className="text-lg font-bold text-slate-900 dark:text-white">
                    {formatCurrency(remainingAfterPayment)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end dark:border-slate-800">
            <Link
              to={`/invoices/${invoice._id}`}
              className="rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={
                saving ||
                enteredAmount <= 0 ||
                enteredAmount > remainingAmount
              }
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {saving
                ? "Recording Payment..."
                : "Record Payment"}
            </button>
          </div>
        </form>
      </section>

      <p className="text-center text-xs text-slate-400">
        Invoice due date: {formatDate(invoice.dueDate)}
      </p>
    </div>
  );
}

export default RecordPayment;