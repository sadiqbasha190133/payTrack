import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCustomer } from "../services/customerApi";

function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCustomer() {
      try {
        setLoading(true);
        setError("");

        const result = await getCustomer(id);

        if (!result.success) {
          throw new Error(result.message || "Customer not found");
        }

        setCustomer(result.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load customer",
        );
      } finally {
        setLoading(false);
      }
    }

    loadCustomer();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        Loading customer...
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate("/customers")}
          className="text-sm font-semibold text-slate-600 hover:underline dark:text-slate-300"
        >
          ← Back to Customers
        </button>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link
        to="/customers"
        className="inline-block text-sm font-semibold text-slate-600 hover:underline dark:text-slate-300"
      >
        ← Back to Customers
      </Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-xl font-bold text-white dark:bg-white dark:text-slate-900">
            {customer.name?.charAt(0)?.toUpperCase() || "C"}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {customer.name}
            </h1>

            <p className="mt-1 text-slate-500 dark:text-slate-400">
              {customer.businessName || "Individual Customer"}
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
            <p className="text-xs font-medium uppercase text-slate-400">
              Email
            </p>

            <p className="mt-2 break-all text-sm font-medium text-slate-900 dark:text-white">
              {customer.email || "—"}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
            <p className="text-xs font-medium uppercase text-slate-400">
              Phone
            </p>

            <p className="mt-2 text-sm font-medium text-slate-900 dark:text-white">
              {customer.phone || "—"}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2 dark:bg-slate-950">
            <p className="text-xs font-medium uppercase text-slate-400">
              Address
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm font-medium text-slate-900 dark:text-white">
              {customer.address || "No address provided"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CustomerDetails;