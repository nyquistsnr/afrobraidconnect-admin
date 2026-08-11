// Shared fetch primitive for every backend API call in the app. Centralizing
// this here — rather than each domain client rolling its own fetch wrapper —
// is what guarantees Accept-Language (and Authorization / envelope / error
// handling) is applied consistently everywhere, including endpoints added in
// the future: any new domain client should be built on top of `apiFetch`
// rather than calling `fetch` directly.
import type { ApiEnvelope } from "@/lib/api/types";
import type { Locale } from "@/lib/i18n";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: unknown[],
    public headers?: Headers
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  accessToken?: string;
  // Required, not optional — every call site must state which locale the
  // request is for, so the backend's Accept-Language-resolved content
  // (validation messages, localized names, etc.) always matches the UI.
  lang: Locale;
  headers?: Record<string, string>;
}

export async function apiFetch<TRes>(
  path: string,
  { method = "GET", body, accessToken, lang, headers: extraHeaders }: ApiRequestOptions
): Promise<TRes> {
  if (!API_BASE) {
    throw new ApiError(
      "API_BASE_NOT_CONFIGURED",
      "NEXT_PUBLIC_API_BASE_URL is not set.",
      500
    );
  }

  const headers: Record<string, string> = {
    "Accept-Language": lang,
    ...extraHeaders,
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("NETWORK_ERROR", "Could not reach the server.", 0);
  }

  if (res.status === 204) {
    return null as unknown as TRes;
  }

  const json: ApiEnvelope<TRes> = await res.json();

  if (json.status === "error" || !json.data) {
    const error = json.error ?? {
      code: "UNKNOWN_ERROR",
      message: "Something went wrong.",
    };
    throw new ApiError(error.code, error.message, res.status, error.details, res.headers);
  }

  return json.data;
}
