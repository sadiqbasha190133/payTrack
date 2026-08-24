import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getPayments } from "../services/paymentApi";
import { formatCurrency } from "../utils/formatCurrency";
import { formatDate } from "../utils/formatDate";

function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function loadPayments() {
    try {
      setLoading(true);
      setError("");

      const result = await getPayments();

      if (!result.success) {
        throw new Error(
          result.message || "Failed to load payments",
        );
      }

      setPayments(result.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load payments",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return payments;
    }

    return payments.filter((payment) =>
      [
        payment.customerName,
        payment.invoiceNumber,
        payment.paymentMethod,
        payment.notes,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query),
        ),
    );
  }, [payments, search]);

  const totalReceived = filteredPayments.reduce(
    (total, payment) =>
      total + (Number(payment.amount) || 0),
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Money received
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
          Payments
        </h1>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          View all recorded customer payments.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Payments shown
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {filteredPayments.length}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-500/10">
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            Total received
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {formatCurrency(totalReceived)}
          </p>
        </div>
      </div>

      {/* Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Payment History
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Payments are immutable once recorded.
            </p>
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search payments..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 sm:max-w-xs dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">
            Loading payments...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-4xl">💳</div>

            <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">
              No payments found
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Recorded payments will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Invoice</th>
                  <th className="px-5 py-3">Method</th>
                  <th className="px-5 py-3">Notes</th>
                  <th className="px-5 py-3 text-right">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPayments.map((payment) => (
                  <tr
                    key={payment._id || payment.paymentId}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {formatDate(payment.paymentDate)}
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">
                      {payment.customerName ||
                        payment.customer?.name ||
                        "Unknown"}
                    </td>

                    <td className="px-5 py-4">
                      {payment.invoiceId || payment.invoice?._id ?  (
                        <Link
                          to={`/invoices/${payment.invoiceId || payment.invoice?._id}`}
                          className="font-semibold text-slate-700 hover:underline dark:text-slate-300"
                        >
                          {payment.invoiceNumber ||
                            "View Invoice"}
                        </Link>
                      ) : (
                        payment.invoiceNumber || "—"
                      )}
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {payment.paymentMethod}
                    </td>

                    <td className="max-w-xs truncate px-5 py-4 text-slate-500 dark:text-slate-400">
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

export default Payments;