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

export function getAdminRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(RT_KEY);
}

export function clearAdminAuth(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(AT_KEY);
    localStorage.removeItem(RT_KEY);
}

function decodeJwtPayload(token: string): { exp: number } | null { 
    try { 
        const payload = token.split('.')[1];
        if(!payload) return null; 
        const decode = atob(payload);
        const data = JSON.parse(decode);

        return data; 
    }catch(err) { 
        console.error('Invalid JWT: ', err);
        return null;
    }
}

function isAccessTokenExpired(token: string,  bufferMs: number): boolean { 
    const data = decodeJwtPayload(token);
    if(data === null)
        return true; 
    return data.exp * 1000 - bufferMs < Date.now();
}

export async function refreshAccessToken(): Promise<string | null> { 
    try{
        const rt = localStorage.getItem('admin_rt');
        if(!rt)
            return null; 

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, { 
            method: "POST",
            headers: {"Content-Type" : "application/json"}, 
            body: JSON.stringify({ refreshToken: rt }), 
        })

        if (!res.ok) {
            const text = await res.text();
            console.error(`[Auth] Refresh failed: ${res.status} ${text}`);
            return null;
        }
        const data = await res.json();
        localStorage.setItem("admin_at", data.accessToken);
        localStorage.setItem("admin_rt", data.refreshToken);
        return data.accessToken;
    }catch(err) { 
        return null; 
    }
}

const PROACTIVE_REFRESH_BUFFER = 60_000;
const REFRESH_CHECK_INTERVAL = 30_000;

if(typeof window !== "undefined")  {
    setInterval(() => {
        const accessToken = getAdminAccessToken(); 
        if(!accessToken)
            return; 
        
        if(isAccessTokenExpired(accessToken, PROACTIVE_REFRESH_BUFFER)) {
            void refreshAccessToken(); 
        }
    }, REFRESH_CHECK_INTERVAL);
}