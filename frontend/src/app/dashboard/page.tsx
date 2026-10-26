'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { RequestStatus, RequestTicket } from '@/types';
import { requestApi } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Navbar } from '@/components/layout/Navbar';
import { CreateRequestDialog } from '@/components/requests/CreateRequestDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    AlertCircle,
    ArrowRight,
    Briefcase,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    KeyRound,
    Laptop,
    Loader2,
    Search,
    ShieldAlert,
    SlidersHorizontal,
    Wallet,
    XCircle,
} from 'lucide-react';

export default function DashboardPage() {
    const { user } = useAuthStore();
    const [requests, setRequests] = useState<RequestTicket[]>([]);
    const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState<'ALL' | RequestStatus>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [myRequests, approvals] = await Promise.all([
                requestApi.getMyRequests(),
                requestApi.getPendingApprovals().catch(() => []),
            ]);
            setRequests(myRequests);
            setPendingApprovalsCount(approvals.length);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to load dashboard data';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRequestCreated = (newTicket: RequestTicket) => {
        setRequests((prev) => [newTicket, ...prev]);
    };

    // Metrics computation
    const totalCount = requests.length;
    const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
    const approvedCount = requests.filter((r) => r.status === 'APPROVED').length;
    const rejectedCount = requests.filter((r) => r.status === 'REJECTED').length;

    // Filtered requests
    const filteredRequests = useMemo(() => {
        return requests.filter((req) => {
            const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
            const query = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !query ||
                req.title.toLowerCase().includes(query) ||
                req.description.toLowerCase().includes(query) ||
                req.superior_email.toLowerCase().includes(query) ||
                req.type.toLowerCase().includes(query);
            return matchesStatus && matchesSearch;
        });
    }, [requests, statusFilter, searchQuery]);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'EQUIPMENT':
                return <Laptop className="h-3.5 w-3.5 mr-1 text-indigo-400" />;
            case 'LEAVE':
                return <Calendar className="h-3.5 w-3.5 mr-1 text-emerald-400" />;
            case 'ACCESS':
                return <KeyRound className="h-3.5 w-3.5 mr-1 text-amber-400" />;
            case 'BUDGET':
                return <Wallet className="h-3.5 w-3.5 mr-1 text-purple-400" />;
            default:
                return <Briefcase className="h-3.5 w-3.5 mr-1 text-slate-400" />;
        }
    };

    const getUrgencyBadge = (urgency: string) => {
        switch (urgency) {
            case 'URGENT':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950/80 border border-red-700/60 text-red-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                        Urgent
                    </span>
                );
            case 'HIGH':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-950/80 border border-orange-700/60 text-orange-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                        High
                    </span>
                );
            case 'MEDIUM':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-950/70 border border-blue-800/60 text-blue-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                        Medium
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800/80 border border-slate-700 text-slate-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
                        Low
                    </span>
                );
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return (
                    <Badge className="bg-emerald-950/80 text-emerald-300 border-emerald-800/80 flex items-center gap-1 w-fit shadow-sm">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Approved
                    </Badge>
                );
            case 'REJECTED':
                return (
                    <Badge className="bg-rose-950/80 text-rose-300 border-rose-800/80 flex items-center gap-1 w-fit shadow-sm">
                        <XCircle className="h-3 w-3 text-rose-400" /> Rejected
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-amber-950/80 text-amber-300 border-amber-800/80 flex items-center gap-1 w-fit shadow-sm">
                        <Clock className="h-3 w-3 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} /> Pending
                    </Badge>
                );
        }
    };

    return (
        <AuthGuard>
            <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
                <Navbar />

                <main className="container mx-auto px-4 sm:px-8 py-8 space-y-8">
                    {/* Header Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-indigo-200 bg-clip-text text-transparent">
                                    Employee Gateway
                                </h1>
                                <Badge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10 text-xs">
                                    Live Sync
                                </Badge>
                            </div>
                            <p className="text-sm text-slate-400 mt-1">
                                Signed in as <span className="text-slate-200 font-medium">{user?.full_name || user?.email}</span>. Create and manage corporate requests.
                            </p>
                        </div>
                        <CreateRequestDialog onRequestCreated={handleRequestCreated} />
                    </div>

                    {/* Step-06: Manager Action Alert Banner */}
                    {pendingApprovalsCount > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border border-amber-500/30 shadow-[0_0_30px_-5px_rgba(245,158,11,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                            <div className="flex items-start sm:items-center gap-3.5">
                                <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-md">
                                    <ShieldAlert className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-amber-200 flex items-center gap-2">
                                        Action Required: Manager Review Waiting
                                        <span className="px-2 py-0.2 rounded-full text-[10px] bg-amber-500 text-slate-950 font-bold">
                                            {pendingApprovalsCount}
                                        </span>
                                    </h4>
                                    <p className="text-xs text-amber-300/80 mt-0.5">
                                        You are designated as the Superior for {pendingApprovalsCount} pending ticket{pendingApprovalsCount > 1 ? 's' : ''}.
                                    </p>
                                </div>
                            </div>
                            <Link href="/approvals">
                                <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs shadow-md shadow-amber-500/20 group shrink-0">
                                    Open Approvals Center
                                    <ArrowRight className="h-3.5 w-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                                </Button>
                            </Link>
                        </motion.div>
                    )}

                    {/* Interactive Stat Cards (Click to filter table) */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                            <Card
                                onClick={() => setStatusFilter('ALL')}
                                className={`cursor-pointer transition-all border-slate-800/80 bg-slate-900/50 backdrop-blur-xl hover:border-indigo-500/50 ${statusFilter === 'ALL' ? 'ring-2 ring-indigo-500/40 bg-slate-900/80' : ''
                                    }`}
                            >
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                                        <span>Total Tickets</span>
                                        <FileText className="h-4 w-4 text-slate-400" />
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-extrabold text-slate-100">{totalCount}</div>
                                    <p className="text-[11px] text-slate-500 mt-1">All submitted requests</p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                            <Card
                                onClick={() => setStatusFilter('PENDING')}
                                className={`cursor-pointer transition-all border-slate-800/80 bg-slate-900/50 backdrop-blur-xl hover:border-amber-500/50 ${statusFilter === 'PENDING' ? 'ring-2 ring-amber-500/40 bg-slate-900/80' : ''
                                    }`}
                            >
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-semibold text-amber-400 flex items-center justify-between">
                                        <span>Pending Review</span>
                                        <Clock className="h-4 w-4 text-amber-400" />
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-extrabold text-amber-400">{pendingCount}</div>
                                    <p className="text-[11px] text-slate-500 mt-1">Awaiting superior action</p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                            <Card
                                onClick={() => setStatusFilter('APPROVED')}
                                className={`cursor-pointer transition-all border-slate-800/80 bg-slate-900/50 backdrop-blur-xl hover:border-emerald-500/50 ${statusFilter === 'APPROVED' ? 'ring-2 ring-emerald-500/40 bg-slate-900/80' : ''
                                    }`}
                            >
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-semibold text-emerald-400 flex items-center justify-between">
                                        <span>Approved</span>
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-extrabold text-emerald-400">{approvedCount}</div>
                                    <p className="text-[11px] text-slate-500 mt-1">Successfully authorized</p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
                            <Card
                                onClick={() => setStatusFilter('REJECTED')}
                                className={`cursor-pointer transition-all border-slate-800/80 bg-slate-900/50 backdrop-blur-xl hover:border-rose-500/50 ${statusFilter === 'REJECTED' ? 'ring-2 ring-rose-500/40 bg-slate-900/80' : ''
                                    }`}
                            >
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-xs font-semibold text-rose-400 flex items-center justify-between">
                                        <span>Rejected</span>
                                        <XCircle className="h-4 w-4 text-rose-400" />
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-extrabold text-rose-400">{rejectedCount}</div>
                                    <p className="text-[11px] text-slate-500 mt-1">Declined by manager</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 backdrop-blur">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Filter by title, category, description, or manager..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 bg-slate-950/80 border-slate-800 text-slate-200 text-xs placeholder:text-slate-500 focus-visible:ring-indigo-500"
                            />
                        </div>

                        {/* Status Filter Tabs */}
                        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800/80 self-start sm:self-auto overflow-x-auto">
                            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${statusFilter === status
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                >
                                    {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Requests Data Table */}
                    <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur-2xl shadow-xl overflow-hidden">
                        <CardHeader className="border-b border-slate-800/60 py-4 px-6 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
                                    <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
                                    My Submitted Requests
                                    <Badge variant="outline" className="ml-1 border-slate-700 text-slate-400 text-[10px]">
                                        {filteredRequests.length} results
                                    </Badge>
                                </CardTitle>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            {error && (
                                <div className="m-4 p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-200 text-sm flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {isLoading ? (
                                <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                                    <Loader2 className="h-7 w-7 animate-spin text-indigo-500" />
                                    <p className="text-xs font-medium">Synchronizing tickets from database...</p>
                                </div>
                            ) : filteredRequests.length === 0 ? (
                                <div className="py-20 text-center text-slate-400 space-y-3">
                                    <div className="h-12 w-12 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mx-auto text-slate-500">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-300">No requests found</p>
                                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                            {searchQuery || statusFilter !== 'ALL'
                                                ? 'No tickets match your active filter criteria. Try clearing the search query.'
                                                : 'You have not submitted any corporate tickets yet.'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-950/60 border-b border-slate-800/80">
                                            <TableRow className="border-slate-800/80 hover:bg-transparent">
                                                <TableHead className="text-slate-400 text-xs font-semibold py-3.5 pl-6">Title &amp; Notes</TableHead>
                                                <TableHead className="text-slate-400 text-xs font-semibold py-3.5">Category</TableHead>
                                                <TableHead className="text-slate-400 text-xs font-semibold py-3.5">Urgency</TableHead>
                                                <TableHead className="text-slate-400 text-xs font-semibold py-3.5">Designated Superior</TableHead>
                                                <TableHead className="text-slate-400 text-xs font-semibold py-3.5">Status</TableHead>
                                                <TableHead className="text-slate-400 text-xs font-semibold py-3.5 text-right pr-6">Date</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <AnimatePresence>
                                                {filteredRequests.map((req) => (
                                                    <TableRow
                                                        key={req.id}
                                                        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                                                    >
                                                        <TableCell className="pl-6 py-4 max-w-[340px]">
                                                            <div className="font-semibold text-slate-100 text-sm">{req.title}</div>
                                                            <div className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                                                                {req.description}
                                                            </div>
                                                            {req.comment && (
                                                                <div className="text-[11px] text-amber-300/90 mt-1.5 flex items-center gap-1.5 bg-amber-950/30 border border-amber-800/40 rounded px-2 py-0.5 w-fit">
                                                                    <span>Manager feedback: &ldquo;{req.comment}&rdquo;</span>
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="py-4">
                                                            <Badge variant="outline" className="border-slate-800 bg-slate-950/80 text-slate-300 text-xs flex items-center w-fit font-medium">
                                                                {getTypeIcon(req.type)}
                                                                {req.type}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="py-4">{getUrgencyBadge(req.urgency)}</TableCell>
                                                        <TableCell className="py-4">
                                                            <span className="text-xs bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded text-slate-300 font-mono">
                                                                {req.superior_email}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="py-4">{getStatusBadge(req.status)}</TableCell>
                                                        <TableCell className="py-4 text-slate-400 text-right pr-6 text-xs whitespace-nowrap">
                                                            {new Date(req.created_at).toLocaleDateString(undefined, {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                            })}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </AnimatePresence>
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </main>
            </div>
        </AuthGuard>
    );
}
