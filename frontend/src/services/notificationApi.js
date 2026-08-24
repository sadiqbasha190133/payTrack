import api from "./api";

export async function sendOverdueNotifications() {
  const response = await api.post("/notifications/overdue");

  return response.data;
}