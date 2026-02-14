"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Calendar, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface LogEntry {
    id: string;
    predicate: string;
    verified: boolean;
    timestamp: string;
}

interface Stats {
    total: number;
    successRate: string | number;
}

export default function VerifierDashboard() {
    const [stats, setStats] = useState<Stats>({ total: 0, successRate: 0 });
    const [recentLogs, setRecentLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAudit = async () => {
            try {
                // Since this uses the same backend endpoints as existing ones, let's use the fetch directly
                // However, we should properly add getAuditLog to api.verifier in api.ts first
                // For now, we manually fetch to decouple strict api.ts changes in this step
                const res = await fetch("/api/verify/audit-log");
                const data = await res.json();

                setRecentLogs(data.verifications);

                // Calculate quick stats
                const total = data.verifications.length;
                const successes = data.verifications.filter((l: LogEntry) => l.verified).length;
                setStats({
                    total,
                    successRate: total > 0 ? ((successes / total) * 100).toFixed(1) : 0
                });

            } catch (e) {
                console.error("Failed to load audit logs", e);
            } finally {
                setLoading(false);
            }
        };

        fetchAudit();
        const interval = setInterval(fetchAudit, 5000); // Live update
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="container mx-auto p-8 max-w-6xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <ShieldCheck className="text-indigo-600" />
                        Verifier Dashboard
                    </h1>
                    <p className="text-neutral-500 mt-2">Real-time audit log of all verification attempts.</p>
                </div>
                <Button asChild>
                    <Link href="/verify/global">New Verify Request</Link>
                </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-500 uppercase">Recent Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{stats.total || 0}</div>
                        <p className="text-xs text-neutral-500">Last 50 entries</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-500 uppercase">Success Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{stats.successRate || 0}%</div>
                        <p className="text-xs text-neutral-500">Valid Proofs</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-neutral-500 uppercase">System Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                            <span className="font-bold text-green-700">Online</span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-1">Accepting Proofs</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Audit Log</CardTitle>
                    <CardDescription>Chronological list of verification attempts across all verifiers.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-neutral-400">Loading logs...</div>
                    ) : recentLogs.length === 0 ? (
                        <div className="text-center py-8 text-neutral-400">No verification history found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left text-neutral-500">
                                        <th className="pb-3 pl-2">Status</th>
                                        <th className="pb-3">Verification ID</th>
                                        <th className="pb-3">Predicate Checked</th>
                                        <th className="pb-3 text-right pr-2">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {recentLogs.map((log) => (
                                        <tr key={log.id} className="hover:bg-neutral-50 transition-colors">
                                            <td className="py-3 pl-2">
                                                {log.verified ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <CheckCircle className="w-3 h-3 mr-1" /> Success
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        <XCircle className="w-3 h-3 mr-1" /> Failed
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 font-mono text-neutral-600">{log.id.substring(0, 8)}...</td>
                                            <td className="py-3 font-mono bg-neutral-50/50 px-2 rounded w-fit">{log.predicate}</td>
                                            <td className="py-3 text-right text-neutral-500 pr-2">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
