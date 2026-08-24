import api from "./api";

export async function getCustomers() {
  const response = await api.get("/customers");
  return response.data;
}

export async function getCustomer(id) {
  const response = await api.get(`/customers/${id}`);
  return response.data;
}

export async function createCustomer(data) {
  const response = await api.post("/customers", data);
  return response.data;
}

export async function updateCustomer(id, data) {
  const response = await api.put(`/customers/${id}`, data);
  return response.data;
}

export async function deleteCustomer(id) {
  const response = await api.delete(`/customers/${id}`);
  return response.data;
}