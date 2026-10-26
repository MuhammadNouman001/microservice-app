'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RequestStatus, RequestTicket } from '@/types';
import { requestApi } from '@/lib/api';
import { useAuthStore } from '@/stores/useAuthStore';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    AlertCircle,
    AlertTriangle,
    Briefcase,
    Calendar,
    CheckCircle,
    CheckSquare,
    Clock,
    FileCheck,
    KeyRound,
    Laptop,
    Loader2,
    Search,
    ShieldCheck,
    UserCheck,
    Wallet,
    XCircle,
} from 'lucide-react';

export default function ApprovalsPage() {
    const { user } = useAuthStore();
    const [requests, setRequests] = useState<RequestTicket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

    // Review Dialog State
    const [selectedTicket, setSelectedTicket] = useState<RequestTicket | null>(null);
    const [actionType, setActionType] = useState<RequestStatus | null>(null);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchPendingApprovals = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await requestApi.getPendingApprovals();
            setRequests(data);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to load pending approvals';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingApprovals();
    }, []);

    const openActionDialog = (ticket: RequestTicket, status: RequestStatus) => {
        setSelectedTicket(ticket);
        setActionType(status);
        setComment(status === 'APPROVED' ? 'Approved for fulfillment' : '');
    };

    const handleConfirmAction = async () => {
        if (!selectedTicket || !actionType) return;
        setIsSubmitting(true);
        setError(null);

        try {
            await requestApi.updateStatus(selectedTicket.id, {
                status: actionType,
                comment: comment.trim() || undefined,
            });

            // Remove the reviewed ticket from the pending list
            setRequests((prev) => prev.filter((r) => r.id !== selectedTicket.id));
            setSelectedTicket(null);
            setActionType(null);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to update ticket status';
            setError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filtered items
    const filteredRequests = useMemo(() => {
        return requests.filter((req) => {
            const matchesCat = selectedCategory === 'ALL' || req.type === selectedCategory;
            const query = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !query ||
                req.title.toLowerCase().includes(query) ||
                req.description.toLowerCase().includes(query) ||
                req.requester_email.toLowerCase().includes(query);
            return matchesCat && matchesSearch;
        });
    }, [requests, selectedCategory, searchQuery]);

    // Metrics
    const totalPending = requests.length;
    const urgentCount = requests.filter((r) => r.urgency === 'URGENT' || r.urgency === 'HIGH').length;

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

    return (
        <AuthGuard>
            <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
                <Navbar />

                <main className="container mx-auto px-4 sm:px-8 py-8 space-y-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-md">
                                    <ShieldCheck className="h-5 w-5" />
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-amber-200 to-amber-400 bg-clip-text text-transparent">
                                    Manager Review Center
                                </h1>
                            </div>
                            <p className="text-sm text-slate-400 mt-1">
                                Authorize or decline corporate requests routed to <span className="text-slate-200 font-mono font-medium">{user?.email}</span>.
                            </p>
                        </div>

                        {/* Top Summary Badges */}
                        <div className="flex items-center gap-3">
                            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-amber-400" />
                                <span className="text-xs text-slate-400">Awaiting Decision:</span>
                                <span className="text-xs font-bold text-amber-300 font-mono">{totalPending}</span>
                            </div>
                            {urgentCount > 0 && (
                                <div className="px-3.5 py-1.5 rounded-xl bg-red-950/40 border border-red-800/50 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-red-400 animate-pulse" />
                                    <span className="text-xs text-red-300 font-bold font-mono">{urgentCount} Urgent</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800/60 backdrop-blur">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Search by requester email, title, or reason..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-9 bg-slate-950/80 border-slate-800 text-slate-200 text-xs placeholder:text-slate-500 focus-visible:ring-amber-500"
                            />
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800/80 self-start sm:self-auto overflow-x-auto">
                            {(['ALL', 'EQUIPMENT', 'LEAVE', 'ACCESS', 'BUDGET'] as const).map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${selectedCategory === cat
                                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                                        : 'text-slate-400 hover:text-slate-200'
                                        }`}
                                >
                                    {cat === 'ALL' ? 'All' : cat.charAt(0) + cat.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pending Approvals Table */}
                    <Card className="border-slate-800/80 bg-slate-900/60 backdrop-blur-2xl shadow-xl overflow-hidden">
                        <CardHeader className="border-b border-slate-800/60 py-4 px-6 flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
                                <FileCheck className="h-4 w-4 text-amber-400" />
                                Actionable Queue
                                <Badge variant="outline" className="ml-1 border-slate-700 text-slate-400 text-[10px]">
                                    {filteredRequests.length} pending
                                </Badge>
                            </CardTitle>
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
                                    <Loader2 className="h-7 w-7 animate-spin text-amber-500" />
                                    <p className="text-xs font-medium">Checking pending tickets assigned to your email...</p>
                                </div>
                            ) : filteredRequests.length === 0 ? (
                                <div className="py-20 text-center text-slate-400 space-y-3">
                                    <div className="h-12 w-12 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mx-auto text-emerald-400">
                                        <CheckCircle className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-200">All caught up!</p>
                                        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                            {searchQuery || selectedCategory !== 'ALL'
                                                ? 'No tickets match your search filter.'
                                                : 'There are no pending requests assigned to your email address at this time.'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-slate-950/60 border-b border-slate-800/80">
                                            <TableRow className="border-slate-800/80 hover:bg-transparent">
                                                <TableHead className="text-slate-400 text-xs font-semibold py-3.5 pl-6">Requester</TableHead>
                                                <TableHead className="text-slate-400 text-xs font-semibold py-3.5">Title &amp; Reason</TableHead>
                                                <TableHead className="text-slate-400 text-xs font-semibold py-3.5">Category</TableHead>
                                                <TableHead className="text-slate-400 text-xs font-semibold py-3.5">Urgency</TableHead>
                                                <TableHead className="text-slate-400 text-xs font-semibold py-3.5">Submitted</TableHead>
                                                <TableHead className="text-slate-400 text-xs font-semibold py-3.5 text-right pr-6">Review Action</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <AnimatePresence>
                                                {filteredRequests.map((req) => (
                                                    <TableRow
                                                        key={req.id}
                                                        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                                                    >
                                                        <TableCell className="pl-6 py-4 font-mono text-xs">
                                                            <div className="flex items-center gap-1.5 text-slate-200 bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded w-fit">
                                                                <UserCheck className="h-3 w-3 text-indigo-400" />
                                                                {req.requester_email}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-4 max-w-[320px]">
                                                            <div className="font-semibold text-slate-100 text-sm">{req.title}</div>
                                                            <div className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                                                                {req.description}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-4">
                                                            <Badge variant="outline" className="border-slate-800 bg-slate-950/80 text-slate-300 text-xs flex items-center w-fit font-medium">
                                                                {getTypeIcon(req.type)}
                                                                {req.type}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="py-4">{getUrgencyBadge(req.urgency)}</TableCell>
                                                        <TableCell className="py-4 text-slate-400 text-xs whitespace-nowrap">
                                                            {new Date(req.created_at).toLocaleDateString(undefined, {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                            })}
                                                        </TableCell>
                                                        <TableCell className="py-4 text-right pr-6">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => openActionDialog(req, 'APPROVED')}
                                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white h-8 text-xs font-semibold px-3 shadow-sm transition-transform active:scale-95"
                                                                >
                                                                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => openActionDialog(req, 'REJECTED')}
                                                                    className="bg-rose-700 hover:bg-rose-600 text-white h-8 text-xs font-semibold px-3 shadow-sm transition-transform active:scale-95"
                                                                >
                                                                    <XCircle className="h-3.5 w-3.5 mr-1" />
                                                                    Reject
                                                                </Button>
                                                            </div>
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

                {/* Elevated Action Confirmation Modal */}
                <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
                    <DialogContent className="sm:max-w-[480px] border-slate-800 bg-slate-900/95 backdrop-blur-2xl text-slate-100 shadow-[0_0_50px_-10px_rgba(16,185,129,0.2)]">
                        <DialogHeader className="border-b border-slate-800/60 pb-3">
                            <DialogTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
                                {actionType === 'APPROVED' ? (
                                    <>
                                        <div className="h-7 w-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                            <CheckCircle className="h-4 w-4" />
                                        </div>
                                        Approve Corporate Ticket
                                    </>
                                ) : (
                                    <>
                                        <div className="h-7 w-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                                            <XCircle className="h-4 w-4" />
                                        </div>
                                        Decline Corporate Ticket
                                    </>
                                )}
                            </DialogTitle>
                            <DialogDescription className="text-slate-400 text-xs">
                                Confirm your decision for &ldquo;{selectedTicket?.title}&rdquo;. An automated email will be sent to {selectedTicket?.requester_email}.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-3 py-2">
                            <Label htmlFor="comment" className="text-xs text-slate-300 font-medium">
                                {actionType === 'APPROVED' ? 'Optional Approval Note' : 'Reason for Declining (Required)'}
                            </Label>
                            <Textarea
                                id="comment"
                                placeholder={
                                    actionType === 'APPROVED'
                                        ? 'e.g. Budget approved for Q3 execution; equipment will be delivered on Monday.'
                                        : 'e.g. Please resubmit with project justification and expected budget cost.'
                                }
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                maxLength={500}
                                rows={3}
                                className="bg-slate-950/80 border-slate-800 text-slate-100 placeholder:text-slate-600 text-xs focus-visible:ring-amber-500 resize-none"
                            />
                        </div>

                        <DialogFooter className="pt-2 border-t border-slate-800/60">
                            <Button
                                variant="outline"
                                onClick={() => setSelectedTicket(null)}
                                className="border-slate-800 bg-slate-950/80 text-slate-300 hover:bg-slate-800 h-9 text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmAction}
                                disabled={isSubmitting}
                                className={`h-9 text-xs font-semibold ${actionType === 'APPROVED'
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
                                    : 'bg-rose-700 hover:bg-rose-600 text-white shadow-md shadow-rose-700/20'
                                    }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                        Recording Decision...
                                    </>
                                ) : (
                                    `Confirm ${actionType === 'APPROVED' ? 'Approval' : 'Rejection'}`
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AuthGuard>
    );
}
