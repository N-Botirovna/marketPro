/**
 * HTTP resilience primitives ported from back-end/bot/api_client/client.py:
 * - CircuitBreaker (closed → open → half_open) on consecutive 5xx
 * - withRetry exponential backoff for idempotent GET requests
 *
 * No external dependencies. Module-scoped state is shared by the axios
 * instance in src/lib/http.js. Tests should call resetCircuit() between cases.
 */

const STATE_CLOSED = "closed";
const STATE_OPEN = "open";
const STATE_HALF_OPEN = "half_open";

const DEFAULT_FAILURE_THRESHOLD = 5;
const DEFAULT_RECOVERY_MS = 30_000;

class CircuitBreaker {
  constructor({
    failureThreshold = DEFAULT_FAILURE_THRESHOLD,
    recoveryMs = DEFAULT_RECOVERY_MS,
  } = {}) {
    this.failureThreshold = failureThreshold;
    this.recoveryMs = recoveryMs;
    this.state = STATE_CLOSED;
    this.failures = 0;
    this.openedAt = 0;
  }

  canPass() {
    if (this.state === STATE_CLOSED) return true;
    if (this.state === STATE_OPEN) {
      if (Date.now() - this.openedAt >= this.recoveryMs) {
        this.state = STATE_HALF_OPEN;
        return true;
      }
      return false;
    }
    // half_open — one probe allowed
    return true;
  }

  recordSuccess() {
    this.failures = 0;
    if (this.state !== STATE_CLOSED) {
      this.state = STATE_CLOSED;
      this.openedAt = 0;
    }
  }

  recordFailure(isServerError) {
    if (!isServerError) return;
    this.failures += 1;
    if (this.state === STATE_HALF_OPEN || this.failures >= this.failureThreshold) {
      this.state = STATE_OPEN;
      this.openedAt = Date.now();
    }
  }

  reset() {
    this.state = STATE_CLOSED;
    this.failures = 0;
    this.openedAt = 0;
  }

  snapshot() {
    return {
      state: this.state,
      failures: this.failures,
      openedAt: this.openedAt,
      msUntilRecovery:
        this.state === STATE_OPEN ? Math.max(0, this.recoveryMs - (Date.now() - this.openedAt)) : 0,
    };
  }
}

export const circuit = new CircuitBreaker();

export function resetCircuit() {
  circuit.reset();
}

export class CircuitOpenError extends Error {
  constructor(snapshot) {
    super(
      `Circuit breaker open — backend has failed ${snapshot.failures} times. ` +
        `Retry in ${Math.ceil(snapshot.msUntilRecovery / 1000)}s.`,
    );
    this.name = "CircuitOpenError";
    this.code = "ECIRCUIT_OPEN";
    this.snapshot = snapshot;
  }
}

export function isServerErrorStatus(status) {
  return typeof status === "number" && status >= 500 && status < 600;
}

export function isNetworkError(error) {
  return !error?.response && (error?.code === "ECONNABORTED" || error?.code === "ERR_NETWORK");
}

/**
 * withRetry — exponential backoff for idempotent GET requests.
 * Only retries on 5xx responses or network errors. Never retries on 4xx.
 */
export async function withRetry(fn, { retries = 3, baseDelayMs = 500, maxDelayMs = 4000 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;
      const shouldRetry = isServerErrorStatus(status) || isNetworkError(error);
      if (!shouldRetry || attempt === retries) {
        throw error;
      }
      const delay = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}
