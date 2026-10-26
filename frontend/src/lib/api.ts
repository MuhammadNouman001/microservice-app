import { AuthResponse, CreateRequestPayload, RequestTicket, UpdateStatusPayload, User } from '@/types';

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:8001';
const REQUEST_URL = process.env.NEXT_PUBLIC_REQUEST_SERVICE_URL || 'http://localhost:8003';

// 🔒 Token Storage Service
export const tokenStorage = {
    getAccessToken: (): string | null => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('access_token');
    },

    getRefreshToken: (): string | null => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('refresh_token');
    },

    setTokens: (accessToken: string, refreshToken?: string) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem('access_token', accessToken);
        if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
        }
    },

    clearTokens: () => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    },
    removeTokens: () => {
        tokenStorage.clearTokens();
    },
};

// 🔄 Refresh Token Mutex State
let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string | null) => void) => {
    refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string | null) => {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
};

// 🛡️ Centralized Fetch Client
export async function request<T>(
    url: string,
    options: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
    const { skipAuth = false, headers: customHeaders = {}, ...restOptions } = options;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(customHeaders as Record<string, string>),
    };

    if (!skipAuth) {
        const token = tokenStorage.getAccessToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    let response: Response;
    try {
        response = await fetch(url, {
            ...restOptions,
            headers,
            signal: controller.signal,
        });
    } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
            throw new Error('Request timed out after 15 seconds.');
        }
        throw new Error('Network error or server unavailable. Please try again.');
    } finally {
        clearTimeout(timeoutId);
    }

    // 401 Unauthorized Interceptor with Mutex Refresh
    if (response.status === 401 && !skipAuth) {
        const refreshToken = tokenStorage.getRefreshToken();
        if (!refreshToken) {
            tokenStorage.clearTokens();
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('auth:session-expired'));
            }
            throw new Error('Session expired. Please log in again.');
        }

        if (!isRefreshing) {
            isRefreshing = true;
            try {
                const refreshResponse = await fetch(`${AUTH_URL}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refresh_token: refreshToken }),
                });

                if (refreshResponse.ok) {
                    const data: { access_token: string; refresh_token?: string } = await refreshResponse.json();
                    tokenStorage.setTokens(data.access_token, data.refresh_token);
                    onTokenRefreshed(data.access_token);

                    headers['Authorization'] = `Bearer ${data.access_token}`;
                    const retryResponse = await fetch(url, { ...restOptions, headers });
                    if (!retryResponse.ok) {
                        const err = await retryResponse.json().catch(() => ({}));
                        throw new Error(err.detail || 'Request failed after refresh.');
                    }
                    return retryResponse.json();
                } else {
                    tokenStorage.clearTokens();
                    onTokenRefreshed(null);
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('auth:session-expired'));
                    }
                    throw new Error('Session expired. Please log in again.');
                }
            } catch (error) {
                tokenStorage.clearTokens();
                onTokenRefreshed(null);
                throw error;
            } finally {
                isRefreshing = false;
            }
        } else {
            return new Promise<T>((resolve, reject) => {
                subscribeTokenRefresh((newToken) => {
                    if (newToken) {
                        headers['Authorization'] = `Bearer ${newToken}`;
                        fetch(url, { ...restOptions, headers })
                            .then((res) => {
                                if (!res.ok) {
                                    return res.json().then((err) => reject(new Error(err.detail || 'Request failed')));
                                }
                                return res.json();
                            })
                            .then(resolve)
                            .catch(reject);
                    } else {
                        reject(new Error('Session refresh failed.'));
                    }
                });
            });
        }
    }

    if (!response.ok) {
        let errorMessage = `HTTP ${response.status} Error`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
            // response was not JSON
        }
        throw new Error(errorMessage);
    }

    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}

// 🔐 Authentication Endpoints
export const authApi = {
    login: async (credentials: { email: string; password?: string }) => {
        const data = await request<AuthResponse>(`${AUTH_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify(credentials),
            skipAuth: true,
        });
        tokenStorage.setTokens(data.access_token, data.refresh_token);
        return data;
    },

    register: async (payload: { email: string; password?: string; full_name?: string }) => {
        const data = await request<AuthResponse>(`${AUTH_URL}/auth/register`, {
            method: 'POST',
            body: JSON.stringify(payload),
            skipAuth: true,
        });
        tokenStorage.setTokens(data.access_token, data.refresh_token);
        return data;
    },

    getMe: async (): Promise<User> => {
        return request<User>(`${AUTH_URL}/auth/me`);
    },

    logout: async () => {
        try {
            await request(`${AUTH_URL}/auth/logout`, { method: 'POST' });
        } catch {
            // proceed to clear tokens regardless of backend state
        } finally {
            tokenStorage.clearTokens();
        }
    },

    googleLogin: async (idToken: string) => {
        const data = await request<{ access_token: string; refresh_token: string; user: User }>(
            `${AUTH_URL}/auth/google`,
            { method: 'POST', body: JSON.stringify({ id_token: idToken }), skipAuth: true }
        );
        tokenStorage.setTokens(data.access_token, data.refresh_token);
        return data;
    },

    githubLogin: async (code: string) => {
        const data = await request<{ access_token: string; refresh_token: string; user: User }>(
            `${AUTH_URL}/auth/github`,
            { method: 'POST', body: JSON.stringify({ code }), skipAuth: true }
        );
        tokenStorage.setTokens(data.access_token, data.refresh_token);
        return data;
    },
};

// Helper to normalize MongoDB _id to id
function normalizeTicket(ticket: any): RequestTicket {
    const id = ticket.id || ticket._id;
    return {
        ...ticket,
        id: String(id),
        _id: String(id),
    };
}

// 📋 Request Tickets Endpoints
export const requestApi = {
    create: async (payload: CreateRequestPayload): Promise<RequestTicket> => {
        const data = await request<any>(`${REQUEST_URL}/requests/`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return normalizeTicket(data);
    },

    getMyRequests: async (): Promise<RequestTicket[]> => {
        const data = await request<any[]>(`${REQUEST_URL}/requests/my-requests`);
        return (data || []).map(normalizeTicket);
    },

    getPendingApprovals: async (): Promise<RequestTicket[]> => {
        const data = await request<any[]>(`${REQUEST_URL}/requests/pending-approvals`);
        return (data || []).map(normalizeTicket);
    },

    updateStatus: async (requestId: string, payload: UpdateStatusPayload): Promise<RequestTicket> => {
        const data = await request<any>(`${REQUEST_URL}/requests/${requestId}/status`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
        });
        return normalizeTicket(data);
    },
};
