'use client';

import { useState } from 'react';
import { CreateRequestPayload, RequestTicket, RequestType, RequestUrgency } from '@/types';
import { requestApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { AlertCircle, Calendar, KeyRound, Laptop, Loader2, Plus, Sparkles, Wallet, HelpCircle } from 'lucide-react';

interface Props {
    onRequestCreated: (ticket: RequestTicket) => void;
}

export function CreateRequestDialog({ onRequestCreated }: Props) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<RequestType>('EQUIPMENT');
    const [urgency, setUrgency] = useState<RequestUrgency>('MEDIUM');
    const [superiorEmail, setSuperiorEmail] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const payload: CreateRequestPayload = {
            title: title.trim(),
            description: description.trim(),
            type,
            urgency,
            superior_email: superiorEmail.trim().toLowerCase(),
        };

        try {
            const created = await requestApi.create(payload);
            onRequestCreated(created);
            setOpen(false);
            // Reset form
            setTitle('');
            setDescription('');
            setType('EQUIPMENT');
            setUrgency('MEDIUM');
            setSuperiorEmail('');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to create request ticket.';
            setError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-600/25 h-10 px-4 text-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
                <Plus className="h-4 w-4 mr-1.5" />
                Submit New Request
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[520px] border-slate-800 bg-slate-900/95 backdrop-blur-2xl text-slate-100 shadow-[0_0_50px_-10px_rgba(99,102,241,0.2)]">
                    <DialogHeader className="border-b border-slate-800/60 pb-3">
                        <DialogTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-indigo-400" />
                            Create Corporate Request
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 text-xs">
                            Submit a ticket for review. An automated email dispatch will notify your manager.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        {error && (
                            <div className="p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Title */}
                        <div className="space-y-1.5">
                            <Label htmlFor="title" className="text-xs text-slate-300 font-medium">Ticket Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g. M3 MacBook Pro replacement for local development"
                                required
                                minLength={3}
                                maxLength={100}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="h-10 bg-slate-950/80 border-slate-800 text-slate-100 placeholder:text-slate-600 text-xs focus-visible:ring-indigo-500"
                            />
                        </div>

                        {/* Category & Urgency */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-300 font-medium">Category</Label>
                                <Select value={type} onValueChange={(val) => setType(val as RequestType)}>
                                    <SelectTrigger className="h-10 bg-slate-950/80 border-slate-800 text-slate-100 text-xs">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                                        <SelectItem value="EQUIPMENT">
                                            <span className="flex items-center gap-1.5"><Laptop className="h-3.5 w-3.5 text-indigo-400" /> Equipment</span>
                                        </SelectItem>
                                        <SelectItem value="LEAVE">
                                            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-emerald-400" /> Leave</span>
                                        </SelectItem>
                                        <SelectItem value="ACCESS">
                                            <span className="flex items-center gap-1.5"><KeyRound className="h-3.5 w-3.5 text-amber-400" /> Access</span>
                                        </SelectItem>
                                        <SelectItem value="BUDGET">
                                            <span className="flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5 text-purple-400" /> Budget</span>
                                        </SelectItem>
                                        <SelectItem value="OTHER">
                                            <span className="flex items-center gap-1.5"><HelpCircle className="h-3.5 w-3.5 text-slate-400" /> Other</span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-300 font-medium">Urgency Level</Label>
                                <Select value={urgency} onValueChange={(val) => setUrgency(val as RequestUrgency)}>
                                    <SelectTrigger className="h-10 bg-slate-950/80 border-slate-800 text-slate-100 text-xs">
                                        <SelectValue placeholder="Select urgency" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
                                        <SelectItem value="LOW">Low (Standard)</SelectItem>
                                        <SelectItem value="MEDIUM">Medium (Normal)</SelectItem>
                                        <SelectItem value="HIGH">High (Priority)</SelectItem>
                                        <SelectItem value="URGENT">Urgent (Immediate)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Superior Email */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="superiorEmail" className="text-xs text-slate-300 font-medium">
                                    Manager / Approver Email
                                </Label>
                                <button
                                    type="button"
                                    onClick={() => setSuperiorEmail('studentnerd2@gmail.com')}
                                    className="text-[10px] text-indigo-400 hover:text-indigo-300 underline"
                                >
                                    Use studentnerd2@gmail.com
                                </button>
                            </div>
                            <Input
                                id="superiorEmail"
                                type="email"
                                placeholder="manager@company.com"
                                required
                                value={superiorEmail}
                                onChange={(e) => setSuperiorEmail(e.target.value)}
                                className="h-10 bg-slate-950/80 border-slate-800 text-slate-100 placeholder:text-slate-600 text-xs focus-visible:ring-indigo-500"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-1.5">
                            <Label htmlFor="description" className="text-xs text-slate-300 font-medium">Detailed Reason</Label>
                            <Textarea
                                id="description"
                                placeholder="Provide context and requirements for the approving manager..."
                                required
                                minLength={5}
                                maxLength={1000}
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="bg-slate-950/80 border-slate-800 text-slate-100 placeholder:text-slate-600 text-xs focus-visible:ring-indigo-500 resize-none"
                            />
                        </div>

                        <DialogFooter className="pt-2 border-t border-slate-800/60">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                className="border-slate-800 bg-slate-950/80 text-slate-300 hover:bg-slate-800 h-9 text-xs"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white h-9 text-xs font-medium shadow-md shadow-indigo-600/20"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                        Submitting Ticket...
                                    </>
                                ) : (
                                    'Submit Request'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
