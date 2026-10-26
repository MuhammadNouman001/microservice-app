'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { GuestGuard } from '@/components/auth/GuestGuard';
import { useAuthStore } from '@/stores/useAuthStore';
import { authApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck } from 'lucide-react';

// Brand SVG Icons
function GoogleIcon() {
    return (
        <svg className="h-4 w-4 mr-2 shrink-0" viewBox="0 0 24 24">
            <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
        </svg>
    );
}

function GithubIcon() {
    return (
        <svg className="h-4 w-4 mr-2 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
    );
}

// Internal component reading useSearchParams()
function LoginFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, loginWithGoogle, loginWithGithub } = useAuthStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOAuthLoading, setIsOAuthLoading] = useState(false);

    // 1. Initialize Google Identity Services
    const initializeGoogle = () => {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (typeof window !== 'undefined' && (window as unknown as { google?: any }).google && clientId) {
            try {
                (window as unknown as { google: any }).google.accounts.id.initialize({
                    client_id: clientId,
                    callback: async (response: { credential: string }) => {
                        if (response.credential) {
                            setIsOAuthLoading(true);
                            setError(null);
                            try {
                                await loginWithGoogle(response.credential);
                                window.location.href = '/dashboard';
                            } catch (err: unknown) {
                                const msg = err instanceof Error ? err.message : 'Google authentication failed';
                                setError(msg);
                                setIsOAuthLoading(false);
                            }
                        }
                    },
                });
            } catch (e) {
                console.error('Google Auth Init Error:', e);
            }
        }
    };

    // Re-check Google SDK if already loaded in window
    useEffect(() => {
        if (typeof window !== 'undefined' && (window as unknown as { google?: any })?.google) {
            initializeGoogle();
        }
    }, []);

    const processedCodeRef = useRef<string | null>(null);

    // 2. Handle GitHub OAuth Callback (?code=...)
    useEffect(() => {
        const code = searchParams.get('code');
        if (code && processedCodeRef.current !== code) {
            processedCodeRef.current = code;
            setIsOAuthLoading(true);
            setError(null);
            loginWithGithub(code)
                .then(() => {
                    window.location.href = '/dashboard';
                })
                .catch((err: unknown) => {
                    const msg = err instanceof Error ? err.message : 'GitHub authentication failed';
                    setError(msg);
                    setIsOAuthLoading(false);
                });
        }
    }, [searchParams, router]);

    const handleGoogleClick = () => {
        setError(null);
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId) {
            setError('Google Client ID is not loaded. Please restart your Next.js dev server.');
            return;
        }

        const g = (window as unknown as { google?: any })?.google;
        if (g?.accounts?.id) {
            initializeGoogle();
            g.accounts.id.prompt((notification: any) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    console.warn('Google One Tap suppressed:', notification.getNotDisplayedReason?.());
                }
            });
        } else {
            setError('Google Identity Service is loading, please try again in a moment.');
        }
    };

    const handleGithubClick = () => {
        setError(null);
        const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
        if (!clientId) {
            setError('GitHub Client ID is not loaded. Please restart your Next.js dev server.');
            return;
        }
        const redirectUri = encodeURIComponent(`${window.location.origin}/login`);
        window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await login({ email, password });
            router.push('/dashboard');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
            setError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Google Identity Services Script */}
            <Script
                src="https://accounts.google.com/gsi/client"
                strategy="afterInteractive"
                onLoad={initializeGoogle}
            />

            <div className="relative min-h-screen flex items-center justify-center p-4 bg-slate-950 overflow-hidden text-slate-100">
                {/* Ambient Radial Mesh & Glowing Orbs */}
                <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />

                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 30, 0],
                        y: [0, -40, 0],
                    }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/25 rounded-full blur-[120px] pointer-events-none"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.25, 1],
                        x: [0, -40, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/25 rounded-full blur-[120px] pointer-events-none"
                />

                {/* Central Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="relative z-10 w-full max-w-md"
                >
                    {/* Header Branding */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-3 shadow-lg shadow-indigo-600/10">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                            Microservice Hub
                        </h1>
                        <p className="text-sm text-slate-400 mt-1.5">Enterprise Requests &amp; Approvals Gateway</p>
                    </div>

                    {/* Glassmorphic Card */}
                    <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur-2xl shadow-[0_0_50px_-10px_rgba(99,102,241,0.2)]">
                        <CardHeader className="space-y-1 pb-4">
                            <CardTitle className="text-xl font-bold text-slate-100">Welcome Back</CardTitle>
                            <CardDescription className="text-slate-400 text-xs">
                                Continue with single sign-on or use your email credentials
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-5">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2"
                                >
                                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                                    <span>{error}</span>
                                </motion.div>
                            )}

                            {/* Social Login Buttons (Google + GitHub) */}
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleGoogleClick}
                                    disabled={isOAuthLoading || isSubmitting}
                                    className="border-slate-700/80 bg-slate-950/80 text-slate-200 hover:bg-slate-800/80 hover:text-white hover:border-slate-600 transition-all text-xs font-medium h-10"
                                >
                                    <GoogleIcon />
                                    Google
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleGithubClick}
                                    disabled={isOAuthLoading || isSubmitting}
                                    className="border-slate-700/80 bg-slate-950/80 text-slate-200 hover:bg-slate-800/80 hover:text-white hover:border-slate-600 transition-all text-xs font-medium h-10"
                                >
                                    <GithubIcon />
                                    GitHub
                                </Button>
                            </div>

                            {/* Divider */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-800" />
                                </div>
                                <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                                    <span className="bg-slate-900/90 px-3 text-slate-400 font-medium rounded-full">
                                        Or sign in with email
                                    </span>
                                </div>
                            </div>

                            {/* Email Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-xs text-slate-300 font-medium">Work Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@company.com"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-9 h-10 bg-slate-950/80 border-slate-800 text-slate-100 text-sm placeholder:text-slate-600 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="password" className="text-xs text-slate-300 font-medium">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-9 pr-10 h-10 bg-slate-950/80 border-slate-800 text-slate-100 text-sm placeholder:text-slate-600 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting || isOAuthLoading}
                                    className="w-full h-10 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30 group"
                                >
                                    {isSubmitting || isOAuthLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Authenticating...
                                        </>
                                    ) : (
                                        <span className="flex items-center justify-center gap-1.5">
                                            Sign In to Workspace <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                        </span>
                                    )}
                                </Button>
                            </form>
                        </CardContent>

                        <CardFooter className="flex justify-center border-t border-slate-800/60 py-3.5 bg-slate-950/30">
                            <p className="text-xs text-slate-400">
                                New to the platform?{' '}
                                <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-4">
                                    Create account
                                </Link>
                            </p>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        </>
    );
}

// Default export wrapped in Suspense for Next.js prerendering compliance
export default function LoginPage() {
    return (
        <GuestGuard>
            <Suspense
                fallback={
                    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                            <p className="text-xs text-slate-400">Loading gateway...</p>
                        </div>
                    </div>
                }
            >
                <LoginFormContent />
            </Suspense>
        </GuestGuard>
    );
}
