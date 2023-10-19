export function parseError(error: unknown): string {
  // Check for string
  if (error && typeof error === "string") return error;

  let message: string | undefined;

  // Check for Error object
  if (error instanceof Error) message = error.message;

  // Check for Error-like object
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    message = error.message;
  }

  return message || "Unknown Error";
}
