"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VerificationRequestPage() {
    const [providerId, setProviderId] = useState("pharmacy_001");
    const [predicateType, setPredicateType] = useState("vaccination");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleRequest = async () => {
        setLoading(true);
        setError(null);
        try {
            const pred = {
                type: "COMPARISON",
                attribute: "vaccination_type",
                operator: "CONTAINS",
                value: "COVID"
            };

            const res = await fetch("/api/provider/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider_id: providerId,
                    provider_name: "Apollo Pharmacy",
                    provider_type: "pharmacy",
                    predicate: pred
                })
            });

            if (!res.ok) throw new Error("Request failed");
            const data = await res.json();
            setResult(data);
            router.push(`/provider/request/${data.request_id}`); // Redirect to dedicated page

        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 gap-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Create Verification Request</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Provider ID</Label>
                        <Input value={providerId} onChange={(e) => setProviderId(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Requirement</Label>
                        <div className="p-3 bg-blue-50 text-blue-800 rounded text-sm">
                            Prove: Vaccination contains "COVID"
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded flex items-center gap-2 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <Button onClick={handleRequest} disabled={loading} className="w-full">
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Generate QR Request
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
