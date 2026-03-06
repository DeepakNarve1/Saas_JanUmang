import { toast } from "react-toastify";
import { isAxiosError } from "axios";

/**
 * Extracts a user-friendly error message from an API error object.
 * Handles common HTTP status codes and specific error patterns (like duplicates).
 *
 * @param error - The error object from catch block
 * @param defaultMessage - Fallback message if no specific error is found
 * @returns A string containing the user-friendly error message
 */
export const getErrorMessage = (
  error: unknown,
  defaultMessage: string = "Something went wrong",
): string => {
  if (!error) return defaultMessage;

  if (isAxiosError(error)) {
    // 1. Handle Network Errors
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      return "Network error. Please check your internet connection.";
    }

    // 2. Handle Response Errors (Server responded with error status)
    if (error.response) {
      const { status, data } = error.response;
      const backendMessage = (data as any)?.message || (data as any)?.error;

      // Check for Duplicate Entry (often 409 or 400/500 with specific message)
      if (
        status === 409 ||
        (backendMessage &&
          typeof backendMessage === "string" &&
          (backendMessage.toLowerCase().includes("duplicate") ||
            backendMessage.includes("E11000")))
      ) {
        if (backendMessage && typeof backendMessage === "string") {
          if (backendMessage.toLowerCase().includes("email")) {
            return "This email address is already registered.";
          }
          if (backendMessage.toLowerCase().includes("mobile")) {
            return "This mobile number is already registered.";
          }
          if (backendMessage.toLowerCase().includes("username")) {
            return "This username is already taken.";
          }
        }
        return "This record already exists. Please check for duplicates.";
      }

      const url = error.config?.url || "";
      const isAuthRequest =
        url.includes("/auth/login") ||
        url.includes("/auth/google-login") ||
        url.includes("/auth/change-password");

      // Handle other statuses
      switch (status) {
        case 400:
          return backendMessage || "Invalid request. Please check your inputs.";
        case 401:
          if (isAuthRequest) return backendMessage || defaultMessage;
          return "Session expired. Please login again.";
        case 403:
          return (
            backendMessage ||
            "You do not have permission to perform this action."
          );
        case 404:
          return backendMessage || "Requested resource not found.";
        case 413:
          return "File size is too large. Please upload a smaller file.";
        case 422:
          return backendMessage || "Validation failed. Please check your data.";
        case 429:
          return "Too many requests. Please try again later.";
        case 500:
          return (
            backendMessage || "Internal server error. Please try again later."
          );
        case 503:
          return "Service unavailable. Please try again later.";
        default:
          return backendMessage || defaultMessage;
      }
    }

    // 3. Handle Request Errors (Request made but no response)
    if (error.request) {
      return "No response from server. Please try again later.";
    }
  }

  // 4. Fallback to generic error message
  return (error as any)?.message || defaultMessage;
};

/**
 * Helper function to directly display the error toast.
 * Usage:
 *    try { ... }
 *    catch (error) { handleError(error, "Failed to create user"); }
 */
export const handleError = (
  error: unknown,
  defaultMessage: string = "An error occurred",
) => {
  const message = getErrorMessage(error, defaultMessage);
  toast.error(message);
};
