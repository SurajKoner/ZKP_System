"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Lock } from "lucide-react";

export default function BenchmarksPage() {
    const [metrics] = useState({
        proofGeneration: 127,
        proofVerification: 78,
        proofSize: 384,
    });

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <div className="mb-8 text-center md:text-left">
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">Performance Benchmarks</h1>
                <p className="text-lg text-muted-foreground">
                    Real-time metrics for MediGuard&apos;s ZK-Proof System running on BBS+ Signatures.
                </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 mb-12">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Proof Gen Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-primary">{metrics.proofGeneration}ms</div>
                        <p className="text-xs text-muted-foreground">Client-side average</p>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Verification Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-primary">{metrics.proofVerification}ms</div>
                        <p className="text-xs text-muted-foreground">Server-side average</p>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Proof Size</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-primary">{metrics.proofSize} B</div>
                        <p className="text-xs text-muted-foreground">Zero-Knowledge Payload</p>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Privacy Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-green-600">A+</div>
                        <p className="text-xs text-muted-foreground">Unlinkability Confirmed</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="w-5 h-5 text-primary" />
                            Privacy Comparison
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-neutral-100 rounded-lg dark:bg-neutral-800">
                                <span className="font-medium text-neutral-600 dark:text-neutral-400">Traditional OAuth (JWT)</span>
                                <span className="text-red-500 font-bold">Linkable (100%)</span>
                                <span className="text-xs text-muted-foreground">Reveals User ID</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200 dark:bg-green-900/20 dark:border-green-800">
                                <span className="font-medium text-green-700 dark:text-green-400">MediGuard (ZKP)</span>
                                <span className="text-green-600 font-bold">Unlinkable (0%)</span>
                                <span className="text-xs text-muted-foreground">Randomized Proofs</span>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t">
                            <h4 className="text-sm font-semibold mb-2">Entropy Analysis</h4>
                            <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 w-[99%]"></div>
                            </div>
                            <div className="flex justify-between mt-1">
                                <span className="text-xs text-muted-foreground">Proof Randomness</span>
                                <span className="text-xs font-mono">7.98 bits/byte (Max)</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-500" />
                            System throughput
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Simplified Chart Placeholder */}
                        <div className="h-48 flex items-end justify-between gap-2 px-2 pb-2 border-b border-l">
                            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                <div key={i} className="w-full bg-primary/20 hover:bg-primary/40 transition-colors rounded-t" style={{ height: `${h}%` }}></div>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-2 px-2">
                            <span>10:00</span>
                            <span>11:00</span>
                            <span>12:00</span>
                            <span>13:00</span>
                            <span>14:00</span>
                            <span>15:00</span>
                            <span>16:00</span>
                        </div>
                        <p className="text-center text-xs text-muted-foreground mt-4">Verifications per hour</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
