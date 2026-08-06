'use client';

const AT_KEY = "admin_at";
const RT_KEY = "admin_rt";

export function setAdminTokens(tokens: { accessToken: string; refreshToken: string }): void {
   if (typeof window === "undefined") return;
   localStorage.setItem(AT_KEY, tokens.accessToken);
   localStorage.setItem(RT_KEY, tokens.refreshToken);
}

export function getAdminAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(AT_KEY);
}

export function clearAdminAuth(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(AT_KEY);
    localStorage.removeItem(RT_KEY);
}
