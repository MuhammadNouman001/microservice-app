'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  CheckCircle2,
  Database,
  Fingerprint,
  Layers,
  Mail,
  Server,
  ShieldCheck,
  Workflow,
} from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();

  const services = [
    {
      name: 'Authentication Service',
      port: 'Port 8001',
      tech: 'FastAPI + PostgreSQL + PyJWT',
      icon: Fingerprint,
      color: 'from-indigo-500 to-blue-600',
      description: 'Google & GitHub OAuth 2.0 SSO, token rotation mutex, and bcrypt identity security.',
    },
    {
      name: 'Notification Service',
      port: 'Port 8002',
      tech: 'NestJS + Resend SMTP + EJS',
      icon: Mail,
      color: 'from-purple-500 to-pink-600',
      description: 'Automated HTML email dispatch on login, ticket creation, and manager approvals.',
    },
    {
      name: 'Request Service',
      port: 'Port 8003',
      tech: 'FastAPI + MongoDB (Docker)',
      icon: Database,
      color: 'from-emerald-500 to-teal-600',
      description: 'High-throughput async MongoDB engine managing corporate approval tickets & state.',
    },
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 py-20 flex flex-col items-center text-center">
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs mb-8 shadow-sm"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Enterprise Polyglot Microservices Platform
        </motion.div>

        {/* Main Hero Header */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-3xl bg-gradient-to-r from-slate-100 via-indigo-200 to-purple-300 bg-clip-text text-transparent"
        >
          Corporate Requests &amp; Manager Approvals Gateway
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base sm:text-lg text-slate-400 max-w-2xl mt-4 leading-relaxed"
        >
          Built with modern decoupled microservices architecture featuring single sign-on, automated asynchronous email dispatches, and MongoDB event management.
        </motion.p>

        {/* Primary Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 mt-8"
        >
          {isAuthenticated ? (
            <Link href="/dashboard">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-8 h-12 shadow-lg shadow-indigo-600/30 group">
                Open Workspace Dashboard
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-8 h-12 shadow-lg shadow-indigo-600/30 group">
                  Sign In with SSO
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800 h-12 px-6">
                  Create Profile
                </Button>
              </Link>
            </>
          )}
        </motion.div>

        {/* Architecture Service Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-20 text-left"
        >
          {services.map((svc) => {
            const Icon = svc.icon;
            return (
              <div
                key={svc.name}
                className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-xl relative overflow-hidden group hover:border-slate-700 transition-all hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="border-slate-700 font-mono text-[11px] text-slate-400">
                    {svc.port}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-slate-100">{svc.name}</h3>
                <p className="text-xs text-indigo-400 font-mono mt-0.5">{svc.tech}</p>
                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">{svc.description}</p>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
