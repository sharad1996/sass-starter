import type { AuthResponse, User } from "./types";

function baseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_API_URL is not set");
  }
  return url.replace(/\/$/, "");
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let recoverAccessToken: (() => Promise<string | null>) | null = null;

/** Wired from the auth provider so API calls can silently rotate expired access tokens once. */
export function registerAuthRecovery(handler: (() => Promise<string | null>) | null): void {
  recoverAccessToken = handler;
}

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit & { accessToken?: string | null } = {},
  options: { allowRecovery?: boolean } = {}
): Promise<T> {
  const allowRecovery = options.allowRecovery ?? true;
  const { accessToken, headers, ...rest } = init;
  const h = new Headers(headers);
  if (!h.has("Content-Type") && rest.body && !(rest.body instanceof FormData)) {
    h.set("Content-Type", "application/json");
  }
  if (accessToken) {
    h.set("Authorization", `Bearer ${accessToken}`);
  }
  const res = await fetch(`${baseUrl()}${path}`, {
    ...rest,
    headers: h,
    credentials: "include",
  });
  if (res.status === 204) {
    return undefined as T;
  }
  const data = await parseJson<{ error?: { message?: string; code?: string } } & T>(res);
  if (!res.ok) {
    const msg = data?.error?.message ?? res.statusText;
    const code = data?.error?.code;
    if (
      allowRecovery &&
      res.status === 401 &&
      code === "TOKEN_INVALID" &&
      recoverAccessToken &&
      accessToken
    ) {
      const next = await recoverAccessToken();
      if (next) {
        return apiRequest<T>(path, { ...init, accessToken: next }, { allowRecovery: false });
      }
    }
    throw new ApiError(msg, res.status, code);
  }
  return data as T;
}

export const authApi = {
  register: (body: { email: string; password: string; name: string }) =>
    apiRequest<AuthResponse>("/v1/auth/register", { method: "POST", body: JSON.stringify(body) }, { allowRecovery: false }),
  login: (body: { email: string; password: string }) =>
    apiRequest<AuthResponse>("/v1/auth/login", { method: "POST", body: JSON.stringify(body) }, { allowRecovery: false }),
  refresh: () =>
    apiRequest<AuthResponse>("/v1/auth/refresh", { method: "POST" }, { allowRecovery: false }),
  logout: () => apiRequest<void>("/v1/auth/logout", { method: "POST" }, { allowRecovery: false }),
  me: (accessToken: string) =>
    apiRequest<{ user: User }>("/v1/auth/me", { method: "GET", accessToken }, { allowRecovery: false }),
};

export const billingApi = {
  checkout: (
    accessToken: string,
    body: { successUrl: string; cancelUrl: string; amount?: number }
  ) =>
    apiRequest<{ sessionId: string; url: string; mock: boolean }>("/v1/billing/checkout-session", {
      method: "POST",
      accessToken,
      body: JSON.stringify(body),
    }),
  completeMock: (accessToken: string, sessionId: string) =>
    apiRequest<{ status: string; customerId: string }>("/v1/billing/complete-mock", {
      method: "POST",
      accessToken,
      body: JSON.stringify({ sessionId }),
    }),
};

export const usersApi = {
  list: (accessToken: string) =>
    apiRequest<{ users: Array<{ id: string; email: string; name: string; role: string; createdAt: string }> }>(
      "/v1/users",
      { method: "GET", accessToken }
    ),
};
