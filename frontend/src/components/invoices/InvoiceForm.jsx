import { useEffect, useMemo, useState } from "react";
import { getCustomers } from "../../services/customerApi";
import { formatCurrency } from "../../utils/formatCurrency";

const createEmptyItem = () => ({
  name: "",
  quantity: 1,
  price: 0,
});

const initialForm = {
  customer: "",
  invoiceNumber: "",
  items: [createEmptyItem()],
  tax: 0,
  discount: 0,
  dueDate: "",
};

function InvoiceForm({
  invoice = null,
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customerError, setCustomerError] = useState("");

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    async function loadCustomers() {
      try {
        setCustomersLoading(true);

        const result = await getCustomers();

        if (!result.success) {
          throw new Error(
            result.message || "Failed to load customers",
          );
        }

        setCustomers(result.data || []);
      } catch (error) {
        setCustomerError(
          error.response?.data?.message ||
            error.message ||
            "Unable to load customers",
        );
      } finally {
        setCustomersLoading(false);
      }
    }

    loadCustomers();
  }, []);

  useEffect(() => {
    if (!invoice) {
      setForm(initialForm);
      return;
    }

    setForm({
      customer:
        typeof invoice.customer === "object"
          ? invoice.customer._id
          : invoice.customer || "",
      invoiceNumber: invoice.invoiceNumber || "",
      items:
        invoice.items?.length > 0
          ? invoice.items.map((item) => ({
              name: item.name || "",
              quantity: Number(item.quantity) || 1,
              price: Number(item.price) || 0,
            }))
          : [createEmptyItem()],
      tax: Number(invoice.tax) || 0,
      discount: Number(invoice.discount) || 0,
      dueDate: invoice.dueDate
        ? invoice.dueDate.substring(0, 10)
        : "",
    });
  }, [invoice]);

  const subtotal = useMemo(() => {
    return form.items.reduce((total, item) => {
      return (
        total +
        (Number(item.quantity) || 0) *
          (Number(item.price) || 0)
      );
    }, 0);
  }, [form.items]);

  const total = useMemo(() => {
    return Math.max(
      0,
      subtotal +
        (Number(form.tax) || 0) -
        (Number(form.discount) || 0),
    );
  }, [subtotal, form.tax, form.discount]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleItemChange(index, field, value) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    }));
  }

  function addItem() {
    setForm((current) => ({
      ...current,
      items: [...current.items, createEmptyItem()],
    }));
  }

  function removeItem(index) {
    setForm((current) => {
      if (current.items.length === 1) {
        return current;
      }

      return {
        ...current,
        items: current.items.filter(
          (_, itemIndex) => itemIndex !== index,
        ),
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.customer) {
      return;
    }

    if (!form.items.length) {
      return;
    }

    const payload = {
      customer: form.customer,
      invoiceNumber: form.invoiceNumber.trim(),
      items: form.items.map((item) => ({
        name: item.name.trim(),
        quantity: Number(item.quantity),
        price: Number(item.price),
      })),
      tax: Number(form.tax) || 0,
      discount: Number(form.discount) || 0,
      dueDate: form.dueDate,
    };

    await onSubmit(payload);
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-500 dark:focus:ring-slate-800";

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {customerError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {customerError}
        </div>
      )}

      {/* Basic information */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Invoice Information
        </h2>

        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Customer *
            <select
              name="customer"
              value={form.customer}
              onChange={handleChange}
              required
              disabled={customersLoading}
              className={inputClass}
            >
              <option value="">
                {customersLoading
                  ? "Loading customers..."
                  : "Select customer"}
              </option>

              {customers.map((customer) => (
                <option
                  key={customer._id}
                  value={customer._id}
                >
                  {customer.name}
                  {customer.businessName
                    ? ` — ${customer.businessName}`
                    : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Invoice Number *
            <input
              name="invoiceNumber"
              value={form.invoiceNumber}
              onChange={handleChange}
              required
              placeholder="INV-1005"
              className={inputClass}
            />
          </label>

          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Due Date *
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </label>
        </div>
      </section>

      {/* Items */}
      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Invoice Items
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Add the products or services included in this invoice.
            </p>
          </div>

          <button
            type="button"
            onClick={addItem}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            + Add Item
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {form.items.map((item, index) => {
            const itemTotal =
              (Number(item.quantity) || 0) *
              (Number(item.price) || 0);

            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_120px_160px_auto] sm:items-end">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Item / Service
                    <input
                      value={item.name}
                      onChange={(event) =>
                        handleItemChange(
                          index,
                          "name",
                          event.target.value,
                        )
                      }
                      required
                      placeholder="Laptop"
                      className={inputClass}
                    />
                  </label>

                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Quantity
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(event) =>
                        handleItemChange(
                          index,
                          "quantity",
                          event.target.value,
                        )
                      }
                      required
                      className={inputClass}
                    />
                  </label>

                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Price
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(event) =>
                        handleItemChange(
                          index,
                          "price",
                          event.target.value,
                        )
                      }
                      required
                      className={inputClass}
                    />
                  </label>

                  <div className="flex items-center justify-between gap-3 sm:block">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Item Total
                      </p>

                      <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(itemTotal)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      disabled={form.items.length === 1}
                      className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tax / discount / summary */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Adjustments
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Tax
              <input
                type="number"
                min="0"
                step="0.01"
                name="tax"
                value={form.tax}
                onChange={handleChange}
                className={inputClass}
              />
            </label>

            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Discount
              <input
                type="number"
                min="0"
                step="0.01"
                name="discount"
                value={form.discount}
                onChange={handleChange}
                className={inputClass}
              />
            </label>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900 p-5 text-white dark:bg-slate-800">
          <p className="text-sm text-slate-300">
            Invoice Summary
          </p>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-300">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-300">Tax</span>
              <span>
                + {formatCurrency(Number(form.tax) || 0)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-300">Discount</span>
              <span>
                - {formatCurrency(Number(form.discount) || 0)}
              </span>
            </div>

            <div className="border-t border-slate-700 pt-3">
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end dark:border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading || customersLoading}
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {loading
            ? "Saving..."
            : invoice
              ? "Update Invoice"
              : "Create Invoice"}
        </button>
      </div>
    </form>
  );
}

export default InvoiceForm;