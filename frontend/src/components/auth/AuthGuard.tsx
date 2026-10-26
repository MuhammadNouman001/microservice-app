'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
    children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
    const router = useRouter();
    const { isAuthenticated, isLoading, isInitialized, checkAuth } = useAuthStore();

    useEffect(() => {
        if (!isInitialized) {
            checkAuth();
        }
    }, [isInitialized, checkAuth]);

    useEffect(() => {
        if (isInitialized && !isLoading && !isAuthenticated) {
            router.replace('/login');
        }
    }, [isInitialized, isLoading, isAuthenticated, router]);

    if (!isInitialized || isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-4" />
                <p className="text-sm text-slate-400">Verifying session...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
