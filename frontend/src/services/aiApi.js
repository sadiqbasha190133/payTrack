import api from "./api";

export async function generateReminder(data) {
  const response = await api.post("/ai/reminder", data);
  return response.data;
}

export async function generateInsights() {
  const response = await api.post("/ai/insights");
  return response.data;
}

export async function askAI(question) {
  const response = await api.post("/ai/chat", {
    question: question.trim(),
  });

  return response.data;
}