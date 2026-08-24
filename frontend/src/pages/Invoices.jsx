import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteInvoice, getInvoices } from "../services/invoiceApi";
import StatusBadge from "../components/common/StatusBadge";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";

const statusOptions = [
  "ALL",
  "PENDING",
  "PARTIAL",
  "PAID",
  "OVERDUE",
];

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  async function loadInvoices() {
    try {
      setLoading(true);
      setError("");

      const result = await getInvoices();

      if (!result.success) {
        throw new Error(result.message || "Failed to load invoices");
      }

      setInvoices(result.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load invoices",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const matchesSearch =
        !query ||
        [
          invoice.invoiceNumber,
          invoice.customerName,
          invoice.customer?.name,
          invoice.customer?.businessName,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(query),
          );

      const matchesStatus =
        status === "ALL" || invoice.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, status]);

  async function handleDelete(invoice) {
    const confirmed = window.confirm(
      `Delete invoice ${invoice.invoiceNumber}?`,
    );

    if (!confirmed) return;

    try {
      setError("");

      const result = await deleteInvoice(invoice._id);

      if (!result.success) {
        throw new Error(result.message || "Failed to delete invoice");
      }

      await loadInvoices();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to delete invoice",
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Receivables
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
            Invoices
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Create, track and manage customer invoices.
          </p>
        </div>

        <Link
          to="/invoices/new"
          className="rounded-xl bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          + Create Invoice
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between dark:border-slate-800">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              All Invoices
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {filteredInvoices.length} invoice
              {filteredInvoices.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search invoices..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 sm:w-64 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option === "ALL" ? "All statuses" : option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">
            Loading invoices...
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-4xl">🧾</div>

            <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">
              {search || status !== "ALL"
                ? "No matching invoices"
                : "No invoices yet"}
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Create an invoice to start tracking payments.
            </p>

            {!search && status === "ALL" && (
              <Link
                to="/invoices/new"
                className="mt-5 inline-block rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
              >
                Create Invoice
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3">Invoice</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Paid</th>
                  <th className="px-5 py-3">Remaining</th>
                  <th className="px-5 py-3">Due Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredInvoices.map((invoice) => (
                  <tr
                    key={invoice._id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-5 py-4">
                      <Link
                        to={`/invoices/${invoice._id}`}
                        className="font-semibold text-slate-900 hover:underline dark:text-white"
                      >
                        {invoice.invoiceNumber}
                      </Link>
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {invoice.customerName ||
                        invoice.customer?.name ||
                        "Unknown"}
                    </td>

                    <td className="px-5 py-4 font-medium">
                      {formatCurrency(invoice.totalAmount)}
                    </td>

                    <td className="px-5 py-4 text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(invoice.paidAmount)}
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {formatCurrency(invoice.remainingAmount)}
                    </td>

                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                      {formatDate(invoice.dueDate)}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={invoice.status} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/invoices/${invoice._id}`}
                          className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          View
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDelete(invoice)}
                          className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Invoices;