import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
} from "../services/customerApi";
import CustomerForm from "../components/customers/CustomerForm";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  async function loadCustomers() {
    try {
      setLoading(true);
      setError("");

      const result = await getCustomers();

      if (!result.success) {
        throw new Error(result.message || "Failed to load customers");
      }

      setCustomers(result.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load customers",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return customers;
    }

    return customers.filter((customer) =>
      [
        customer.name,
        customer.businessName,
        customer.email,
        customer.phone,
      ]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(value)),
    );
  }, [customers, search]);

  function openCreateForm() {
    setEditingCustomer(null);
    setShowForm(true);
    setError("");
  }

  function openEditForm(customer) {
    setEditingCustomer(customer);
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(formData) {
    try {
      setSaving(true);
      setError("");

      if (editingCustomer) {
        const result = await updateCustomer(
          editingCustomer._id,
          formData,
        );

        if (!result.success) {
          throw new Error(result.message || "Failed to update customer");
        }
      } else {
        const result = await createCustomer(formData);

        if (!result.success) {
          throw new Error(result.message || "Failed to create customer");
        }
      }

      setShowForm(false);
      setEditingCustomer(null);

      await loadCustomers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to save customer",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(customer) {
    const confirmed = window.confirm(
      `Delete ${customer.name}? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const result = await deleteCustomer(customer._id);

      if (!result.success) {
        throw new Error(result.message || "Failed to delete customer");
      }

      await loadCustomers();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to delete customer",
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Customer management
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
            Customers
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Manage your customers and their contact information.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          + Add Customer
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {editingCustomer ? "Edit Customer" : "Add Customer"}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {editingCustomer
                ? "Update customer information."
                : "Add a new customer to PayTrack."}
            </p>
          </div>

          <CustomerForm
            customer={editingCustomer}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingCustomer(null);
            }}
            loading={saving}
          />
        </section>
      )}

      {/* Search + table */}
      <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              All Customers
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {customers.length} customer
              {customers.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customers..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-500 dark:focus:ring-slate-800"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Loading customers...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-4xl">👥</div>

            <h3 className="mt-3 font-semibold text-slate-900 dark:text-white">
              {search ? "No customers found" : "No customers yet"}
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {search
                ? "Try a different search term."
                : "Add your first customer to get started."}
            </p>

            {!search && (
              <button
                type="button"
                onClick={openCreateForm}
                className="mt-5 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
              >
                Add Customer
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Business</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-5 py-4">
                      <Link
                        to={`/customers/${customer._id}`}
                        className="font-semibold text-slate-900 hover:underline dark:text-white"
                      >
                        {customer.name}
                      </Link>
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {customer.businessName || "—"}
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {customer.email}
                    </td>

                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {customer.phone || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(customer)}
                          className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(customer)}
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

export default Customers;