import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getInvoice,
  getInvoicePayments,
} from "../services/invoiceApi";
import StatusBadge from "../components/common/StatusBadge";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";
import AIReminder from "../components/ai/AIReminder";

function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInvoice() {
      try {
        setLoading(true);
        setError("");

        const result = await getInvoice(id);

        if (!result.success) {
          throw new Error(
            result.message || "Invoice not found",
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
        setLoading(false);
      }
    }

    loadInvoice();
  }, [id]);

  useEffect(() => {
    async function loadPayments() {
      try {
        setPaymentsLoading(true);

        const result = await getInvoicePayments(id);

        if (!result.success) {
          throw new Error(
            result.message || "Unable to load payments",
          );
        }

        setPayments(result.data || []);
      } catch (err) {
        console.error("Payment history error:", err);
      } finally {
        setPaymentsLoading(false);
      }
    }

    loadPayments();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        Loading invoice...
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate("/invoices")}
          className="text-sm font-semibold text-slate-600 hover:underline dark:text-slate-300"
        >
          ← Back to Invoices
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error || "Invoice not found"}
        </div>
      </div>
    );
  }

  const customerName =
    invoice.customerName ||
    invoice.customer?.name ||
    "Unknown Customer";

  const businessName =
    invoice.businessName ||
    invoice.customer?.businessName;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            to="/invoices"
            className="text-sm font-semibold text-slate-600 hover:underline dark:text-slate-300"
          >
            ← Back to Invoices
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
              {invoice.invoiceNumber}
            </h1>

            <StatusBadge status={invoice.status} />
          </div>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Created on {formatDate(invoice.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to={`/invoices/${invoice._id}/edit`}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Edit Invoice
          </Link>

          {Number(invoice.remainingAmount) > 0 && (
            <Link
              to={`/invoices/${invoice._id}/payment`}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              + Record Payment
            </Link>
          )}
        </div>
      </div>

      {/* Customer + financial summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Customer */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Customer
          </p>

          <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">
            {customerName}
          </h2>

          {businessName && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {businessName}
            </p>
          )}

          {invoice.customer?.email && (
            <p className="mt-5 break-all text-sm text-slate-600 dark:text-slate-300">
              {invoice.customer.email}
            </p>
          )}

          {invoice.customer?.phone && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {invoice.customer.phone}
            </p>
          )}

          {invoice.customer?._id && (
            <Link
              to={`/customers/${invoice.customer._id}`}
              className="mt-5 inline-block text-sm font-semibold text-slate-700 hover:underline dark:text-slate-300"
            >
              View customer →
            </Link>
          )}
        </section>

        {/* Invoice summary */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Invoice Summary
              </p>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Due date: {formatDate(invoice.dueDate)}
              </p>
            </div>

            <StatusBadge status={invoice.status} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Total
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(invoice.totalAmount)}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-500/10">
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Paid
              </p>

              <p className="mt-2 text-xl font-bold text-emerald-700 dark:text-emerald-300">
                {formatCurrency(invoice.paidAmount)}
              </p>
            </div>

            <div className="rounded-xl bg-red-50 p-4 dark:bg-red-500/10">
              <p className="text-xs text-red-600 dark:text-red-400">
                Remaining
              </p>

              <p className="mt-2 text-xl font-bold text-red-700 dark:text-red-300">
                {formatCurrency(invoice.remainingAmount)}
              </p>
            </div>
          </div>

          {/* Payment progress */}
          <div className="mt-6">
            <div className="mb-2 flex justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Payment progress
              </span>

              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {invoice.totalAmount > 0
                  ? Math.min(
                      100,
                      Math.round(
                        (invoice.paidAmount /
                          invoice.totalAmount) *
                          100,
                      ),
                    )
                  : 0}
                %
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{
                  width: `${
                    invoice.totalAmount > 0
                      ? Math.min(
                          100,
                          (invoice.paidAmount /
                            invoice.totalAmount) *
                            100,
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </section>
      </div>

      {/* Items */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Invoice Items
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">Item</th>
                <th className="px-5 py-3">Quantity</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3 text-right">
                  Total
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(invoice.items || []).map((item, index) => (
                <tr key={item._id || index}>
                  <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">
                    {item.name}
                  </td>

                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                    {item.quantity}
                  </td>

                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                    {formatCurrency(item.price)}
                  </td>

                  <td className="px-5 py-4 text-right font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(
                      Number(item.quantity) *
                        Number(item.price),
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

            <tfoot className="border-t border-slate-200 dark:border-slate-800">
              <tr>
                <td
                  colSpan="3"
                  className="px-5 py-3 text-right text-slate-500 dark:text-slate-400"
                >
                  Subtotal
                </td>

                <td className="px-5 py-3 text-right font-semibold">
                  {formatCurrency(invoice.subtotal)}
                </td>
              </tr>

              <tr>
                <td
                  colSpan="3"
                  className="px-5 py-2 text-right text-slate-500 dark:text-slate-400"
                >
                  Tax
                </td>

                <td className="px-5 py-2 text-right">
                  + {formatCurrency(invoice.tax)}
                </td>
              </tr>

              <tr>
                <td
                  colSpan="3"
                  className="px-5 py-2 text-right text-slate-500 dark:text-slate-400"
                >
                  Discount
                </td>

                <td className="px-5 py-2 text-right">
                  - {formatCurrency(invoice.discount)}
                </td>
              </tr>

              <tr>
                <td
                  colSpan="3"
                  className="px-5 py-4 text-right font-bold"
                >
                  Grand Total
                </td>

                <td className="px-5 py-4 text-right text-lg font-bold">
                  {formatCurrency(invoice.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <AIReminder invoice={invoice} />

      {/* Payment history */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Payment History
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {payments.length} payment
              {payments.length === 1 ? "" : "s"} recorded.
            </p>
          </div>

          {Number(invoice.remainingAmount) > 0 && (
            <Link
              to={`/invoices/${invoice._id}/payment`}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900"
            >
              + Record Payment
            </Link>
          )}
        </div>

        {paymentsLoading ? (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Loading payment history...
          </div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-3xl">💳</div>

            <p className="mt-3 font-semibold text-slate-900 dark:text-white">
              No payments yet
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Payments recorded against this invoice will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Method</th>
                  <th className="px-5 py-3">Notes</th>
                  <th className="px-5 py-3 text-right">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.map((payment) => (
                  <tr key={payment._id || payment.paymentId}>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {formatDate(payment.paymentDate)}
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">
                      {payment.paymentMethod}
                    </td>

                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                      {payment.notes || "—"}
                    </td>

                    <td className="px-5 py-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(payment.amount)}
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

export default InvoiceDetails;