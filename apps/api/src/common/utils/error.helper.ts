/** Safely extracts a message from an unknown thrown value. */
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Returns the Node.js error code (e.g. 'ENOENT') of an unknown thrown value, if any. */
export function getErrorCode(error: unknown): string | undefined {
  return typeof error === 'object' && error !== null && 'code' in error
    ? String(error.code)
    : undefined;
}
