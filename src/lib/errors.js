/**
 * Structured error mapping — JS port of back-end/bot/api_client/client.py:77-116
 * (`_map_error`). Converts an axios error into a discriminated union so callers
 * (form components, useToast, Sentry breadcrumbs) can branch on `kind`.
 */

export const ERROR_KINDS = {
  AUTH: "auth",
  PERMISSION: "permission",
  NOTFOUND: "notfound",
  VALIDATION: "validation",
  SERVER: "server",
  NETWORK: "network",
  CIRCUIT: "circuit",
  UNKNOWN: "unknown",
};

function extractFieldErrors(data) {
  if (!data || typeof data !== "object") return {};

  // DRF envelope: { result: { field: ["msg"] }, success: false }
  if (data.result && typeof data.result === "object" && !Array.isArray(data.result)) {
    return normalizeFieldShape(data.result);
  }
  // Bare: { field: ["msg"], ... }
  return normalizeFieldShape(data);
}

// Envelope keys that are never field names — they live alongside (or are) the
// general error message, so we must skip them when walking the response body.
const ENVELOPE_KEYS = new Set([
  "detail",
  "code",
  "success",
  "message",
  "result",
  "non_field_errors",
]);

function normalizeFieldShape(obj) {
  const out = {};
  for (const [field, value] of Object.entries(obj)) {
    if (ENVELOPE_KEYS.has(field)) {
      continue;
    }
    if (Array.isArray(value)) {
      out[field] = String(value[0] ?? "");
    } else if (typeof value === "string") {
      out[field] = value;
    } else if (value && typeof value === "object") {
      // Nested: { shop: { name: ["..."] } } → { "shop.name": "..." }
      const nested = normalizeFieldShape(value);
      for (const [nestedKey, nestedVal] of Object.entries(nested)) {
        out[`${field}.${nestedKey}`] = nestedVal;
      }
    }
  }
  return out;
}

function extractMessage(data, fallback) {
  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data.message === "string") return data.message;
  if (typeof data.detail === "string") return data.detail;
  if (typeof data.result === "string") return data.result;
  return fallback;
}

export function mapApiError(error) {
  if (error?.name === "CircuitOpenError" || error?.code === "ECIRCUIT_OPEN") {
    return {
      kind: ERROR_KINDS.CIRCUIT,
      status: 503,
      message: error.message,
      code: "circuit_open",
      fieldErrors: {},
      data: error.snapshot || null,
      raw: error,
    };
  }

  const status = error?.response?.status;
  const data = error?.response?.data;

  if (!status) {
    return {
      kind: ERROR_KINDS.NETWORK,
      status: 0,
      message: error?.message || "Network error",
      code: error?.code || "network_error",
      fieldErrors: {},
      data: null,
      raw: error,
    };
  }

  if (status === 401) {
    return {
      kind: ERROR_KINDS.AUTH,
      status,
      message: extractMessage(data, "Authentication required"),
      code: data?.code || "auth_required",
      fieldErrors: {},
      data,
      raw: error,
    };
  }
  if (status === 403) {
    return {
      kind: ERROR_KINDS.PERMISSION,
      status,
      message: extractMessage(data, "Permission denied"),
      code: data?.code || "permission_denied",
      fieldErrors: {},
      data,
      raw: error,
    };
  }
  if (status === 404) {
    return {
      kind: ERROR_KINDS.NOTFOUND,
      status,
      message: extractMessage(data, "Not found"),
      code: data?.code || "not_found",
      fieldErrors: {},
      data,
      raw: error,
    };
  }
  if (status >= 400 && status < 500) {
    return {
      kind: ERROR_KINDS.VALIDATION,
      status,
      message: extractMessage(data, "Validation error"),
      code: data?.code || "validation_error",
      fieldErrors: extractFieldErrors(data),
      data,
      raw: error,
    };
  }
  if (status >= 500) {
    return {
      kind: ERROR_KINDS.SERVER,
      status,
      message: extractMessage(data, "Server error"),
      code: data?.code || "server_error",
      fieldErrors: {},
      data,
      raw: error,
    };
  }

  return {
    kind: ERROR_KINDS.UNKNOWN,
    status,
    message: extractMessage(data, "Unexpected error"),
    code: "unknown",
    fieldErrors: {},
    data,
    raw: error,
  };
}
