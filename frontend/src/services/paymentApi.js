import api from "./api";

export async function getPayments() {
  const response = await api.get("/payments");
  return response.data;
}

export async function getPayment(id) {
  const response = await api.get(`/payments/${id}`);
  return response.data;
}

export async function createPayment(data) {
  const response = await api.post("/payments", data);
  return response.data;
}

export async function getInvoicePayments(invoiceId) {
  const response = await api.get(
    `/invoices/${invoiceId}/payments`,
  );

  return response.data;
}