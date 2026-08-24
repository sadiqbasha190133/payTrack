import { useEffect, useState } from "react";
import { getDashboard } from "../services/dashboardApi";
import StatusBadge from "../components/common/StatusBadge";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";
import AIInsights from "../components/ai/AIInsights";
import OverdueNotifications from "../components/notifications/OverdueNotifications";
import { getErrorMessage } from "../utils/getErrorMessage";

const statCards = [
  {
    key: "totalCustomers",
    title: "Total Customers",
    icon: "👥",
  },
  {
    key: "totalSales",
    title: "Total Sales",
    icon: "📈",
    currency: true,
  },
  {
    key: "totalReceived",
    title: "Total Received",
    icon: "💰",
    currency: true,
  },
  {
    key: "totalOutstanding",
    title: "Outstanding",
    icon: "💳",
    currency: true,
  },
  {
    key: "totalOverdue",
    title: "Overdue",
    icon: "⚠️",
    currency: true,
  },
];

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const result = await getDashboard();

        if (!result.success) {
          throw new Error(result.message || "Failed to load dashboard");
        }

        setDashboard(result.data);
      } catch (err) {
        setError(
          getErrorMessage(err)
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
        <h2 className="font-semibold">Unable to load dashboard</h2>
        <p className="mt-1 text-sm">{error}</p>
      </div>
    );
  }

  const { metrics, recentPayments, recentInvoices, topOutstandingCustomers, overdueInvoices } =
    dashboard;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Overview
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Keep track of your sales, payments and outstanding invoices.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg dark:bg-slate-800">
                {card.icon}
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              {card.title}
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {card.currency
                ? formatCurrency(metrics[card.key])
                : metrics[card.key]}
            </p>
          </div>
        ))}
      </div>

      {/* Invoice status summary */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Invoice Overview
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Current invoice status across your business.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-blue-50 px-4 py-3 dark:bg-blue-500/10">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Pending
              </p>
              <p className="mt-1 font-bold text-blue-700 dark:text-blue-300">
                {metrics.pendingInvoiceCount}
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 px-4 py-3 dark:bg-amber-500/10">
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Partial
              </p>
              <p className="mt-1 font-bold text-amber-700 dark:text-amber-300">
                {metrics.partialInvoiceCount}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-500/10">
              <p className="text-xs text-emerald-600 dark:text-emerald-400">
                Paid
              </p>
              <p className="mt-1 font-bold text-emerald-700 dark:text-emerald-300">
                {metrics.paidInvoiceCount}
              </p>
            </div>

            <div className="rounded-xl bg-red-50 px-4 py-3 dark:bg-red-500/10">
              <p className="text-xs text-red-600 dark:text-red-400">
                Overdue
              </p>
              <p className="mt-1 font-bold text-red-700 dark:text-red-300">
                {metrics.overdueInvoiceCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent payments + outstanding customers */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Recent Payments */}
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Recent Payments
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Latest payments received.
            </p>
          </div>

          {recentPayments.length === 0 ? (
            <div className="p-6 text-sm text-slate-500 dark:text-slate-400">
              No payments yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Amount</th>
                    <th className="px-5 py-3">Method</th>
                    <th className="px-5 py-3">Date</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentPayments.map((payment) => (
                    <tr key={payment.paymentId}>
                      <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">
                        {payment.customerName || "Unknown"}
                      </td>

                      <td className="px-5 py-4 font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(payment.amount)}
                      </td>

                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                        {payment.paymentMethod}
                      </td>

                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                        {formatDate(payment.paymentDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Top Outstanding Customers */}
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Top Outstanding Customers
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Customers with the highest pending balances.
            </p>
          </div>

          {topOutstandingCustomers.length === 0 ? (
            <div className="p-6 text-sm text-slate-500 dark:text-slate-400">
              No outstanding balances.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {topOutstandingCustomers.map((customer) => (
                <div
                  key={customer.customerId}
                  className="flex items-center justify-between gap-4 p-5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900 dark:text-white">
                      {customer.customerName}
                    </p>

                    {customer.businessName && (
                      <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                        {customer.businessName}
                      </p>
                    )}
                  </div>

                  <p className="shrink-0 font-semibold text-red-600 dark:text-red-400">
                    {formatCurrency(customer.outstandingAmount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Recent invoices */}
      <section className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Recent Invoices
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Latest invoices created.
          </p>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="p-6 text-sm text-slate-500 dark:text-slate-400">
            No invoices yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3">Invoice</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Remaining</th>
                  <th className="px-5 py-3">Due Date</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentInvoices.map((invoice) => (
                  <tr key={invoice._id}>
                    <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">
                      {invoice.invoiceNumber}
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {invoice.customerName || "Unknown"}
                    </td>

                    <td className="px-5 py-4">
                      {formatCurrency(invoice.totalAmount)}
                    </td>

                    <td className="px-5 py-4 font-medium">
                      {formatCurrency(invoice.remainingAmount)}
                    </td>

                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                      {formatDate(invoice.dueDate)}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={invoice.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Overdue */}
      <section className="min-w-0 rounded-2xl border border-red-200 bg-white shadow-sm dark:border-red-900/50 dark:bg-slate-900">
        <div className="border-b border-red-100 p-5 dark:border-red-900/40">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Overdue Invoices
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Payments that need your attention.
              </p>
            </div>

            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-400">
              {formatCurrency(metrics.totalOverdue)} overdue
            </div>
          </div>
        </div>

        {overdueInvoices.length === 0 ? (
          <div className="p-6 text-sm text-emerald-600 dark:text-emerald-400">
            🎉 No overdue invoices.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {overdueInvoices.map((invoice) => (
              <div
                key={invoice.invoiceId}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {invoice.invoiceNumber}
                    </p>

                    <StatusBadge status="OVERDUE" />
                  </div>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {invoice.customerName} · Due{" "}
                    {formatDate(invoice.dueDate)}
                  </p>

                  <p className="mt-1 text-xs font-medium text-red-500 dark:text-red-400">
                    {invoice.numberOfDaysOverdue} day
                    {invoice.numberOfDaysOverdue === 1 ? "" : "s"} overdue
                  </p>
                </div>

                <p className="shrink-0 text-lg font-bold text-red-600 dark:text-red-400">
                  {formatCurrency(invoice.remainingAmount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
      <AIInsights />
      <OverdueNotifications />
    </div>
  );
}

export default Dashboard;