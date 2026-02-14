"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, ShieldCheck, TriangleAlert } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function ProvePage() {
    const params = useSearchParams();
    const requestId = params.get("req");
    const router = useRouter();
    const { toast } = useToast();

    const [request, setRequest] = useState<any>(null);
    const [matchingCred, setMatchingCred] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Fetch Request Details
        if (!requestId) {
            router.push("/wallet");
            return;
        }

        const fetchRequest = async () => {
            try {
                const res = await fetch(`/api/provider/request/${requestId}`);
                if (!res.ok) throw new Error("Request not found");
                const data = await res.json();
                setRequest(data);

                // 2. Select Matching Credential
                const creds = JSON.parse(localStorage.getItem("mediguard_credentials") || "[]");
                const match = creds.find(c => {
                    // Basic matching based on predicate attribute checking (e.g. vaccination type)
                    const predAttr = data.predicate.attribute;
                    return c.attributes[predAttr] !== undefined;
                });

                setMatchingCred(match);
            } catch (e) {
                toast({ title: "Error", description: "Request expired" });
                router.push("/wallet");
            } finally {
                setLoading(false);
            }
        };
        fetchRequest();
    }, [requestId, router]);

    const handleProve = async () => {
        setLoading(true);
        try {
            // 3. Generate ZKP Proof (Client-side)
            // For demo, we are mocking the proof generation here but using the real backend endpoint to verify
            // In reality, this would use BBS WASM to generate the proof cryptographically

            const verificationRes = await fetch("/api/provider/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    request_id: requestId,
                    proof: "mock_zkp_proof_payload_xyz", // Must contain 'mock_zkp' for backend mock validation
                    revealed_attributes: {}, // Zero-Knowledge: reveal nothing except predicate satisfaction
                    issuer_public_key: matchingCred.pk // From stored credential
                })
            });

            if (!verificationRes.ok) throw new Error("Verification failed");

            const result = await verificationRes.json();

            if (result.verified) {
                toast({ title: "Proof Verified!", description: "Provider has confirmed." });
                // Redirect back to wallet or show success screen
                setTimeout(() => router.push("/wallet"), 1500);
            } else {
                throw new Error("Proof rejected by provider");
            }
        } catch (e: any) {
            toast({ title: "Error", description: e.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;

    return (
        <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-screen max-w-md">
            <Card className="w-full shadow-xl border-t-4 border-t-primary">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 p-4 rounded-full mb-4">
                        <ShieldCheck className="w-12 h-12 text-primary" />
                    </div>
                    <CardTitle className="text-center text-xl">Verification Request</CardTitle>
                    <p className="text-center text-neutral-500 text-sm">from {request?.provider_name}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="bg-neutral-50 p-4 rounded-lg border text-sm space-y-2">
                        <p className="font-semibold text-neutral-700">Requirement:</p>
                        <div className="p-2 bg-white rounded border border-neutral-200 text-primary font-medium">
                            {request?.predicate_human_readable}
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-blue-800 font-semibold mb-1">
                            <ShieldCheck className="w-5 h-5" />
                            <span>Privacy Protection</span>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="font-semibold text-amber-600 mb-1">⚠️ This will reveal:</p>
                                <ul className="list-disc list-inside text-neutral-600 pl-2">
                                    <li><strong className="text-neutral-900">NOTHING</strong> about your identity</li>
                                    <li>Only that you received a vaccine</li>
                                </ul>
                            </div>

                            <div>
                                <p className="font-semibold text-green-600 mb-1">✓ This will NOT reveal:</p>
                                <ul className="list-disc list-inside text-neutral-600 pl-2">
                                    <li>Your Name ({matchingCred?.attributes?.patient_name || "Alice"})</li>
                                    <li>Vaccine Type ({matchingCred?.attributes?.vaccination_type || "COVID-19"})</li>
                                    <li>Date Administered</li>
                                    <li>Hospital Name</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {matchingCred ? (
                        <div className="text-xs text-center text-neutral-400">
                            Using: <span className="font-medium text-neutral-600">{matchingCred.type}</span> (Issued: {new Date(matchingCred.issuedAt).toLocaleDateString()})
                        </div>
                    ) : (
                        <div className="text-center text-red-500 text-sm font-semibold">
                            No matching credential found for this request.
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <Button onClick={handleProve} disabled={!matchingCred || loading} className="w-full h-12 text-lg shadow-lg shadow-primary/20">
                        {loading ? "Generating Proof..." : "Approve & Prove"}
                    </Button>
                    <Button variant="ghost" onClick={() => router.push("/wallet")} className="w-full text-neutral-500 hover:bg-neutral-50">
                        Deny Request
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
