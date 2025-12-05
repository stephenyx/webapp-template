import { logger } from './logger.js';

export interface RetryOptions {
  retries?: number;
  delayMs?: number;
  backoffFactor?: number;
}

/**
 * Helper for applying the 5-retry error handling protocol to async operations.
 * Logs each failed attempt and rethrows the last error.
 */
export async function withRetries<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { retries = 5, delayMs = 200, backoffFactor = 2 } = options;

  let attempt = 0;
  let lastError: unknown;
  let currentDelay = delayMs;

  while (attempt < retries) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      attempt += 1;
      logger.warn(
        { attempt, retries, error },
        'Operation failed, will retry if attempts remain'
      );

      if (attempt >= retries) break;

      if (currentDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, currentDelay));
        currentDelay *= backoffFactor;
      }
    }
  }

  throw lastError;
}

