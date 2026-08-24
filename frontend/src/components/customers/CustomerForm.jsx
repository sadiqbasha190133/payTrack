import { useEffect, useState } from "react";

const initialForm = {
  name: "",
  businessName: "",
  email: "",
  phone: "",
  address: "",
};

function CustomerForm({
  customer = null,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name || "",
        businessName: customer.businessName || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
      });
    } else {
      setForm(initialForm);
    }
  }, [customer]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    await onSubmit(form);
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-500 dark:focus:ring-slate-800";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Customer Name *
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Ravi Kumar"
            className={inputClass}
          />
        </label>

        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Business Name
          <input
            name="businessName"
            value={form.businessName}
            onChange={handleChange}
            placeholder="Ravi Electronics"
            className={inputClass}
          />
        </label>

        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Email *
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="ravi@example.com"
            className={inputClass}
          />
        </label>

        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Phone
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="9876543210"
            className={inputClass}
          />
        </label>
      </div>

      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Address
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          rows="3"
          placeholder="Customer address"
          className={inputClass}
        />
      </label>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {loading
            ? "Saving..."
            : customer
              ? "Update Customer"
              : "Add Customer"}
        </button>
      </div>
    </form>
  );
}

export default CustomerForm;