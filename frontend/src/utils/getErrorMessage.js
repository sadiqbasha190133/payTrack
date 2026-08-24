export function getErrorMessage(
  error,
  fallback = "Something went wrong. Please try again.",
) {
  if (!error) {
    return fallback;
  }

  if (!error.response) {
    return "Unable to connect to the server. Please check that the backend is running.";
  }

  const status = error.response.status;
  const data = error.response.data;

  if (status === 400) {
    return (
      data?.message ||
      data?.error ||
      "The request contains invalid information."
    );
  }

  if (status === 404) {
    return (
      data?.message ||
      data?.error ||
      "The requested resource was not found."
    );
  }

  if (status === 503) {
    return (
      data?.message ||
      "The requested service is temporarily unavailable."
    );
  }

  if (status >= 500) {
    return "The server encountered an error. Please try again.";
  }

  return (
    data?.message ||
    data?.error ||
    error.message ||
    fallback
  );
}