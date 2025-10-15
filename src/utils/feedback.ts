import { toast } from "sonner";

/**
 * Safely extract a human readable error message from an unknown error value.
 */
export const extractErrorMessage = (
  error: unknown,
  fallback = "Terjadi kesalahan yang tidak diketahui"
): string => {
  if (!error) return fallback;

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (typeof error === "object" && "message" in (error as Record<string, unknown>)) {
    const message = (error as Record<string, unknown>).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  return fallback;
};

/**
 * Display a success toast with an optional description.
 */
export const showSuccess = (title: string, description?: string) => {
  toast.success(title, description ? { description } : undefined);
};

/**
 * Display an error toast while logging the original error for debugging purposes.
 */
export const showError = (
  title: string,
  error: unknown,
  fallback?: string
) => {
  const message = extractErrorMessage(error, fallback);
  // Always log the raw error to ease debugging in development
  console.error(`${title}:`, error);
  const description = message !== title ? message : undefined;
  toast.error(title, description ? { description } : undefined);
  return message;
};

