'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { GuestGuard } from '@/components/auth/GuestGuard';
import { useAuthStore } from '@/stores/useAuthStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
    AlertCircle,
    ArrowRight,
    Check,
    Eye,
    EyeOff,
    Loader2,
    Lock,
    Mail,
    ShieldPlus,
    User as UserIcon,
} from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuthStore();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dynamic password strength scoring (0 to 4)
    const passwordStrength = useMemo(() => {
        if (!password) return 0;
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score;
    }, [password]);

    const strengthLabel = useMemo(() => {
        if (!password) return '';
        if (passwordStrength <= 1) return 'Weak';
        if (passwordStrength <= 3) return 'Moderate';
        return 'Strong';
    }, [password, passwordStrength]);

    const strengthColor = useMemo(() => {
        if (passwordStrength <= 1) return 'bg-red-500';
        if (passwordStrength <= 3) return 'bg-amber-500';
        return 'bg-emerald-500';
    }, [passwordStrength]);

    const passwordsMatch = password && confirmPassword && password === confirmPassword;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password.length < 8) {
            setError('Password must be at least 8 characters in length.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsSubmitting(true);

        try {
            await register({
                email: email.trim().toLowerCase(),
                password,
                full_name: fullName.trim() || undefined,
            });
            router.push('/dashboard');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
            setError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <GuestGuard>
            <div className="relative min-h-screen flex items-center justify-center p-4 bg-slate-950 overflow-hidden text-slate-100 py-12">
                {/* Ambient Radial Mesh & Glowing Orbs */}
                <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />

                <motion.div
                    animate={{
                        scale: [1, 1.25, 1],
                        x: [0, -35, 0],
                        y: [0, 45, 0],
                    }}
                    transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute -top-40 -right-40 w-96 h-96 bg-purple-600/25 rounded-full blur-[120px] pointer-events-none"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        x: [0, 40, 0],
                        y: [0, -30, 0],
                    }}
                    transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/25 rounded-full blur-[120px] pointer-events-none"
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
                        <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-400 mb-3 shadow-lg shadow-purple-600/10">
                            <ShieldPlus className="h-6 w-6" />
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-purple-200 to-indigo-300 bg-clip-text text-transparent">
                            Join the Platform
                        </h1>
                        <p className="text-sm text-slate-400 mt-1.5">
                            Create your corporate account to submit and review tickets
                        </p>
                    </div>

                    {/* Glassmorphic Card */}
                    <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur-2xl shadow-[0_0_50px_-10px_rgba(168,85,247,0.2)]">
                        <CardHeader className="space-y-1 pb-4">
                            <CardTitle className="text-xl font-bold text-slate-100">Create Account</CardTitle>
                            <CardDescription className="text-slate-400 text-xs">
                                Set up your profile credentials for SSO and direct access
                            </CardDescription>
                        </CardHeader>

                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4">
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

                                {/* Full Name */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="fullName" className="text-xs text-slate-300 font-medium">
                                        Full Name <span className="text-slate-500">(Optional)</span>
                                    </Label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                        <Input
                                            id="fullName"
                                            type="text"
                                            placeholder="Alex Morgan"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="pl-9 h-10 bg-slate-950/80 border-slate-800 text-slate-100 text-sm placeholder:text-slate-600 focus-visible:ring-purple-500 focus-visible:border-purple-500"
                                        />
                                    </div>
                                </div>

                                {/* Work Email */}
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" className="text-xs text-slate-300 font-medium">
                                        Corporate Email
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@company.com"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-9 h-10 bg-slate-950/80 border-slate-800 text-slate-100 text-sm placeholder:text-slate-600 focus-visible:ring-purple-500 focus-visible:border-purple-500"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password" className="text-xs text-slate-300 font-medium">
                                            Password
                                        </Label>
                                        {password && (
                                            <span className={`text-[10px] font-semibold uppercase tracking-wider ${passwordStrength <= 1 ? 'text-red-400' : passwordStrength <= 3 ? 'text-amber-400' : 'text-emerald-400'
                                                }`}>
                                                {strengthLabel}
                                            </span>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Minimum 8 characters"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="pl-9 pr-10 h-10 bg-slate-950/80 border-slate-800 text-slate-100 text-sm placeholder:text-slate-600 focus-visible:ring-purple-500 focus-visible:border-purple-500"
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

                                    {/* Strength Bars */}
                                    {password && (
                                        <div className="grid grid-cols-4 gap-1.5 pt-1">
                                            {[1, 2, 3, 4].map((step) => (
                                                <div
                                                    key={step}
                                                    className={`h-1 rounded-full transition-all duration-300 ${passwordStrength >= step ? strengthColor : 'bg-slate-800'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="confirmPassword" className="text-xs text-slate-300 font-medium">
                                            Confirm Password
                                        </Label>
                                        {passwordsMatch && (
                                            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                                                <Check className="h-3 w-3" /> Passwords match
                                            </span>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Re-enter password"
                                            required
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className={`pl-9 pr-10 h-10 bg-slate-950/80 border-slate-800 text-slate-100 text-sm placeholder:text-slate-600 focus-visible:ring-purple-500 focus-visible:border-purple-500 ${passwordsMatch ? 'border-emerald-500/50' : ''
                                                }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-10 bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition-all shadow-lg shadow-purple-600/30 group mt-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Registering workspace profile...
                                        </>
                                    ) : (
                                        <span className="flex items-center justify-center gap-1.5">
                                            Create Account <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                        </span>
                                    )}
                                </Button>
                            </CardContent>

                            <CardFooter className="flex justify-center border-t border-slate-800/60 py-3.5 bg-slate-950/30">
                                <p className="text-xs text-slate-400">
                                    Already have an account?{' '}
                                    <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium underline underline-offset-4">
                                        Sign in
                                    </Link>
                                </p>
                            </CardFooter>
                        </form>
                    </Card>
                </motion.div>
            </div>
        </GuestGuard>
    );
}
