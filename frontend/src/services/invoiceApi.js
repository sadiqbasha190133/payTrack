import api from "./api";

export async function getInvoices() {
  const response = await api.get("/invoices");
  return response.data;
}

export async function getInvoice(id) {
  const response = await api.get(`/invoices/${id}`);
  return response.data;
}

export async function createInvoice(data) {
  const response = await api.post("/invoices", data);
  return response.data;
}

export async function updateInvoice(id, data) {
  const response = await api.put(`/invoices/${id}`, data);
  return response.data;
}

export async function deleteInvoice(id) {
  const response = await api.delete(`/invoices/${id}`);
  return response.data;
}

export async function getInvoicePayments(invoiceId) {
  const response = await api.get(`/invoices/${invoiceId}/payments`);
  return response.data;
}