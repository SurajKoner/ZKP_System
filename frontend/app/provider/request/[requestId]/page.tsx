"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { Loader2, CheckCircle, Smartphone } from "lucide-react";

export default function VerifyRequestPage() {
    const params = useParams();
    const requestId = params.requestId as string;
    const [data, setData] = useState<any>(null);
    const [status, setStatus] = useState<"pending" | "verified" | "failed">("pending");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Fetch request details
        if (!requestId) return;

        fetch(`/api/provider/request/${requestId}`)
            .then(res => res.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));

        // 2. Poll for verification status (Simulation)
        const interval = setInterval(() => {
            fetch(`/api/provider/verify/${requestId}/status`) // Poll status endpoint
                .then(res => res.json())
                .then(statusData => {
                    if (statusData.verified) {
                        setStatus("verified");
                        clearInterval(interval);
                    }
                })
                .catch(() => { });
        }, 2000);

        return () => clearInterval(interval);
    }, [requestId]);

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center space-y-8">
            <Card className="max-w-md w-full border-2 border-primary/10 shadow-xl">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4">
                        <Smartphone className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle>Scan to Verify</CardTitle>
                    <p className="text-neutral-500 text-sm">Use your MediGuard Wallet to scan this code.</p>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                    {status === "verified" ? (
                        <div className="animate-in fade-in zoom-in duration-300 flex flex-col items-center gap-4 py-8">
                            <div className="bg-green-100 text-green-600 p-4 rounded-full">
                                <CheckCircle className="w-16 h-16" />
                            </div>
                            <h2 className="text-2xl font-bold text-green-700">Verification Successful!</h2>
                            <p className="text-neutral-500">The proof was valid and unlinkable.</p>
                        </div>
                    ) : (
                        <div className="bg-white p-4 rounded-xl border shadow-inner">
                            <QRCodeSVG
                                value={`mediguard://verify?req=${requestId}&provider=${data?.provider_name}`}
                                size={250}
                                level={"H"}
                                includeMargin={true}
                            />
                        </div>
                    )}

                    <div className="bg-neutral-50 p-4 rounded-lg w-full text-left space-y-2 text-sm border">
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Request ID:</span>
                            <span className="font-mono text-xs">{requestId.slice(0, 8)}...</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Provider:</span>
                            <span>{data?.provider_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-neutral-500">Requirement:</span>
                            <span className="font-medium text-primary">{data?.predicate_human_readable || "Vaccination Status"}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
