const statusMessages: Record<number, string> = {
  400: "The request was invalid. Please check your input and try again.",
  401: "Your session has expired or you're not signed in. Please log in again.",
  403: "You don't have permission to perform this action.",
  404: "The requested resource could not be found.",
  409: "This conflicts with existing data. Please review and try again.",
  422: "Some information provided is incorrect. Please check your input.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "Something went wrong on our end. Please try again later.",
  502: "The service is temporarily unavailable. Please try again shortly.",
  503: "The service is temporarily unavailable. Please try again shortly.",
};

const commonFallbacks: Record<string, string> = {
  "Failed to fetch": "Unable to connect to the server. Please check your internet connection.",
  "Network Error": "Unable to connect to the server. Please check your internet connection.",
  "timeout": "The request took too long. Please try again.",
  "CORS": "A security error occurred while connecting to the server.",
};

export function toHumanReadableError(err: unknown): string {
  if (!err) return "An unexpected error occurred. Please try again.";

  const axiosError = err as {
    response?: { data?: { detail?: unknown; error?: { message?: string; code?: string } }; status?: number };
    message?: string;
    code?: string;
  };

  const status = axiosError.response?.status;
  const detail = axiosError.response?.data?.detail;
  const errorMessage = axiosError.response?.data?.error?.message;

  // Handle { error: { message } } format
  if (typeof errorMessage === "string" && errorMessage.length < 300) {
    return errorMessage;
  }

  // If we have a status code, use our friendly message
  if (status && statusMessages[status]) {
    // For 422, include specific validation details if available
    if (status === 422 && typeof detail === "string") {
      return detail;
    }
    // For 400, prefer the backend's detail if it's a sensible string
    if (status === 400 && typeof detail === "string" && detail.length < 200) {
      return detail;
    }
    // For 400, prefer the backend's error.message if available
    if (status === 400 && typeof errorMessage === "string") {
      return errorMessage;
    }
    return statusMessages[status];
  }

  // If the backend provided a detailed message, use it directly
  if (typeof detail === "string" && detail.length < 300) {
    return detail;
  }

  // Handle array validation errors (FastAPI style)
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { msg?: string; loc?: string[] };
    if (first?.msg) {
      const field = first.loc?.slice(1).join(".") ?? "";
      return field ? `${field}: ${first.msg}` : first.msg;
    }
  }

  const message = axiosError.message || "";

  // Check for common network/fetch errors
  for (const [key, friendly] of Object.entries(commonFallbacks)) {
    if (message.includes(key)) {
      return friendly;
    }
  }

  // Fallback: return a generic message if we can't make sense of the error
  return "An unexpected error occurred. Please try again.";
}
