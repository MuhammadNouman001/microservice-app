'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { requestApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    CheckSquare,
    FileText,
    LogOut,
    Menu,
    ShieldCheck,
    User,
    X,
} from 'lucide-react';

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, isAuthenticated } = useAuthStore();
    const [pendingCount, setPendingCount] = useState(0);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            requestApi.getPendingApprovals()
                .then((approvals) => setPendingCount(approvals.length))
                .catch(() => setPendingCount(0));
        }
    }, [isAuthenticated, pathname]);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const navLinks = [
        {
            name: 'My Requests',
            href: '/dashboard',
            icon: FileText,
            badge: null,
        },
        {
            name: 'Manager Approvals',
            href: '/approvals',
            icon: CheckSquare,
            badge: pendingCount > 0 ? pendingCount : null,
        },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
                {/* Left: Brand Logo & Navigation Links */}
                <div className="flex items-center gap-8">
                    <Link href="/dashboard" className="flex items-center gap-2.5 group">
                        <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-slate-100 via-indigo-100 to-slate-300 bg-clip-text text-transparent">
                                Microservice Hub
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase -mt-0.5">
                                Enterprise Gateway
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-1.5">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${isActive
                                            ? 'bg-slate-900 border border-slate-800 text-indigo-400 shadow-sm'
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{link.name}</span>
                                    {link.badge !== null && (
                                        <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-950 font-bold shadow-sm animate-pulse">
                                            {link.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Right: User Identity & Actions */}
                <div className="flex items-center gap-3">
                    {isAuthenticated && (
                        <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800/80">
                            <div className="h-6 w-6 rounded-full bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-indigo-300">
                                <User className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-xs font-semibold text-slate-200 truncate max-w-[150px]">
                                    {user?.full_name || user?.email}
                                </span>
                                <span className="text-[10px] text-slate-400 truncate max-w-[150px] font-mono">
                                    {user?.email}
                                </span>
                            </div>
                            {pendingCount > 0 ? (
                                <Badge variant="outline" className="ml-1 text-[10px] py-0 px-2 border-amber-500/50 text-amber-300 bg-amber-500/10 font-bold">
                                    Approver
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="ml-1 text-[10px] py-0 px-2 border-indigo-500/40 text-indigo-300 bg-indigo-500/10">
                                    Employee
                                </Badge>
                            )}
                        </div>
                    )}

                    {isAuthenticated ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLogout}
                            className="text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors h-9 px-3 text-xs"
                        >
                            <LogOut className="h-4 w-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">Logout</span>
                        </Button>
                    ) : (
                        <Link href="/login">
                            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9 px-4">
                                Sign In
                            </Button>
                        </Link>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        type="button"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    >
                        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown */}
            {mobileOpen && (
                <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-3 space-y-2">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold ${isActive ? 'bg-slate-900 text-indigo-400' : 'text-slate-400'
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <Icon className="h-4 w-4" />
                                    {link.name}
                                </span>
                                {link.badge !== null && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-slate-950 font-bold">
                                        {link.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            )}
        </header>
    );
}
