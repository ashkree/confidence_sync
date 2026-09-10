// src/lib/auth-token.ts

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

let onAuthFailure: (() => void) | null = null;

export function setAuthFailureHandler(handler: (() => void) | null): void {
  onAuthFailure = handler;
}

export function notifyAuthFailure(): void {
  onAuthFailure?.();
}
