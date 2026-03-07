import axios from "axios";

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: unknown;
}

export function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const payload = error.response?.data;
    const message =
      payload?.message ||
      payload?.error ||
      error.message ||
      "Something went wrong while calling the API.";

    return {
      message,
      status,
      code: payload?.code,
      details: payload?.details ?? payload,
    };
  }

  if (error instanceof Error) {
    return { message: error.message, status: 0 };
  }

  return { message: "Unknown error", status: 0 };
}
