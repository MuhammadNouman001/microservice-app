import { create } from 'zustand';
import { User } from '@/types';
import { authApi, tokenStorage } from '@/lib/api';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;
    networkError: string | null;
    login: (payload: { email: string; password: string }) => Promise<void>;
    loginWithGoogle: (idToken: string) => Promise<void>;
    loginWithGithub: (code: string) => Promise<void>;
    register: (payload: { email: string; password: string; full_name?: string }) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: (force?: boolean) => Promise<void>;
}

// In-flight promise to deduplicate simultaneous checkAuth calls
let checkAuthPromise: Promise<void> | null = null;

export const useAuthStore = create<AuthState>((set, get) => {
    // Listen for session expiry event dispatched by api.ts
    if (typeof window !== 'undefined') {
        window.addEventListener('auth:session-expired', () => {
            set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
        });
    }

    return {
        user: null,
        isAuthenticated: false,
        isLoading: true,
        isInitialized: false,
        networkError: null,

        checkAuth: async (force = false) => {
            // 1. Agar already initialized hai aur force nahi manga, toh skip karein
            if (get().isInitialized && !force) {
                return;
            }

            // 2. Agar already checkAuth in-flight hai, usi promise ko reuse karein
            if (checkAuthPromise) {
                return checkAuthPromise;
            }

            checkAuthPromise = (async () => {
                const token = tokenStorage.getAccessToken();
                if (!token) {
                    set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true, networkError: null });
                    return;
                }

                try {
                    set({ isLoading: true, networkError: null });
                    const user = await authApi.getMe();
                    set({ user, isAuthenticated: true, isLoading: false, isInitialized: true, networkError: null });
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error ? error.message : '';
                    const isAuthFailure =
                        errorMessage.includes('session has expired') ||
                        errorMessage.includes('401') ||
                        errorMessage.includes('Unauthorized');

                    if (isAuthFailure) {
                        // Sirf genuine auth failure par tokens delete karein
                        tokenStorage.removeTokens();
                        set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true, networkError: null });
                    } else {
                        // Temporary network failure ya 500 par tokens DELETE NAHI karein!
                        set({
                            isLoading: false,
                            isInitialized: true,
                            networkError: errorMessage || 'Network connection error'
                        });
                    }
                } finally {
                    checkAuthPromise = null;
                }
            })();

            return checkAuthPromise;
        },

        login: async (payload) => {
            set({ isLoading: true, networkError: null });
            try {
                const response = await authApi.login(payload);
                set({ user: response.user, isAuthenticated: true, isLoading: false, isInitialized: true, networkError: null });
            } catch (error) {
                set({ isLoading: false });
                throw error;
            }
        },

        loginWithGoogle: async (idToken: string) => {
            set({ isLoading: true, networkError: null });
            try {
                const response = await authApi.googleLogin(idToken);
                set({ user: response.user, isAuthenticated: true, isLoading: false, isInitialized: true, networkError: null });
            } catch (error) {
                set({ isLoading: false });
                throw error;
            }
        },

        loginWithGithub: async (code: string) => {
            set({ isLoading: true, networkError: null });
            try {
                const response = await authApi.githubLogin(code);
                set({ user: response.user, isAuthenticated: true, isLoading: false, isInitialized: true, networkError: null });
            } catch (error) {
                set({ isLoading: false });
                throw error;
            }
        },
        
        register: async (payload) => {
            set({ isLoading: true, networkError: null });
            try {
                const response = await authApi.register(payload);
                set({ user: response.user, isAuthenticated: true, isLoading: false, isInitialized: true, networkError: null });
            } catch (error) {
                set({ isLoading: false });
                throw error;
            }
        },

        logout: async () => {
            await authApi.logout();
            set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true, networkError: null });
        },
    };
});
