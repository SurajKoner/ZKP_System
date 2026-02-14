"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { api } from "@/services/api";
import { cryptoService } from "@/services/crypto";
import { useWalletStore } from "@/stores/useWalletStore";
import { CheckCircle, XCircle, ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface Credential {
    id: string;
    issuer: string;
    attributes: Record<string, string | number>;
    issuerPublicKey: string;
}

interface VerificationResult {
    verified: boolean;
    timestamp: number;
    revealed_attributes?: Record<string, string | number>;
    message?: string;
}

const SCENARIOS = {
    "bar": {
        name: "The Cyber Bar",
        predicate: "age > 21",
        requiredAttributes: ["age"],
        description: "Prove you are over 21 to enter."
    },
    "liquor-store": {
        name: "Crypto Liquor",
        predicate: "age > 18",
        requiredAttributes: ["age"],
        description: "Prove you are over 18 to purchase."
    },
    "club": {
        name: "VIP Club",
        predicate: "membership == 'gold'",
        requiredAttributes: ["membership"],
        description: "Prove you have Gold membership."
    },
    "global": {
        name: "Standard Verifier",
        predicate: "any",
        requiredAttributes: ["name", "age", "membership"],
        description: "Generic verification request."
    },
    "wallet-demo": {
        name: "Wallet Self-Check",
        predicate: "validity",
        requiredAttributes: ["name", "issuer"],
        description: "Verify your own credential validity."
    }
};

export default function VerifierPage() {
    const params = useParams();
    const id = params.id as string;
    // Fallback if scenario not found
    const scenario = SCENARIOS[id] || SCENARIOS["global"];

    const [requestId, setRequestId] = useState("");
    const [qrValue, setQrValue] = useState("");

    // Missing state variables
    // Missing state variables
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const credentials = useWalletStore((state: any) => state.credentials || []) as Credential[];
    const [selectedCredentialId, setSelectedCredentialId] = useState("");
    const [status, setStatus] = useState("idle");
    const [proofTime, setProofTime] = useState(0);
    const [result, setResult] = useState<VerificationResult | null>(null);

    // Initialize verification session
    useEffect(() => {
        const initSession = async () => {
            try {
                const res = await api.verifier.createRequest(id, scenario.predicate);
                setRequestId(res.requestId);
                setQrValue(res.qrCode);
            } catch {
                console.error("Failed to init verification session");
            }
        };
        initSession();
    }, [id, scenario.predicate]);

    const handleVerify = async () => {
        if (!selectedCredentialId) {
            alert("Please select a credential from your wallet");
            return;
        }

        setStatus("proving");
        const startTime = performance.now();

        try {
            const cred = credentials.find(c => c.id === selectedCredentialId);
            if (!cred) throw new Error("Credential not found");

            // 1. Generate Proof (Client Side)
            // We need a nonce from the request usually, but for now we generate/use local nonce or use requestId as context
            // In a real flow, the wallet scans the QR, gets the request ID (nonce), and generates proof

            const proof = await cryptoService.generateProof(
                cred,
                scenario.requiredAttributes,
                requestId // Using requestId as nonce context
            );

            // 2. Submit to Verifier (Server Side)
            setStatus("verifying");

            // revealed are the attributes we chose to disclose
            const revealed = proof.revealed_attributes;

            const verification = await api.verifier.submitProof(
                requestId,
                JSON.stringify(proof), // serialize full proof object
                revealed,
                cred.issuerPublicKey
            );

            const endTime = performance.now();
            setProofTime(endTime - startTime);
            setResult(verification); // verified: bool, timestamp

            if (verification.verified) {
                // Client side check of revealed attributes against scenario logic (optional double check)
                if (scenario.requiredAttributes.includes("age") && revealed.age) {
                    const age = parseInt(revealed.age);
                    if (id === "bar" && age < 21) {
                        setStatus("failed");
                        setResult({ ...verification, message: "Age verification failed: Under 21" });
                        return;
                    }
                }
                if (scenario.requiredAttributes.includes("membership") && revealed.membership) {
                    if (id === "club" && revealed.membership !== "gold") {
                        setStatus("failed");
                        setResult({ ...verification, message: "Membership verification failed: Not Gold" });
                        return;
                    }
                }

                setStatus("success");
            } else {
                setStatus("failed");
            }

        } catch (e) {
            console.error(e);
            setStatus("failed");
        }
    };

    const reset = async () => {
        setStatus("idle");
        setResult(null);
        // New session
        try {
            const res = await api.verifier.createRequest(id, scenario.predicate);
            setRequestId(res.requestId);
            setQrValue(res.qrCode);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <div className="mb-8 flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-full">
                    <ShieldCheck className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">{scenario.name}</h1>
                    <p className="text-neutral-500">{scenario.description}</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Left: Verifier Request */}
                <Card className="border-blue-200 shadow-md">
                    <CardHeader>
                        <CardTitle>Verification Request</CardTitle>
                        <CardDescription>
                            We are requesting proof of: <span className="font-mono bg-neutral-100 px-1 rounded">{scenario.predicate}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-white p-4 border rounded-lg flex flex-col items-center">
                            {qrValue ? (
                                <>
                                    <QRCodeSVG value={qrValue} size={180} />
                                    <p className="text-xs text-neutral-400 mt-2 font-mono">Req: {requestId.substring(0, 8)}...</p>
                                </>
                            ) : (
                                <Loader2 className="animate-spin text-neutral-400" />
                            )}
                        </div>

                        <div className="bg-neutral-50 p-4 rounded-lg">
                            <h3 className="text-sm font-semibold mb-2">Requested Attributes:</h3>
                            <div className="flex gap-2 flex-wrap">
                                {scenario.requiredAttributes.map(attr => (
                                    <span key={attr} className="bg-white border px-2 py-1 rounded text-xs font-mono">{attr}</span>
                                ))}
                            </div>
                            <p className="text-xs text-neutral-500 mt-2">
                                * Other attributes will remain hidden.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Right: Wallet Interaction (Demo) */}
                <Card className="border-neutral-200">
                    <CardHeader>
                        <CardTitle>Wallet Demo Interaction</CardTitle>
                        <CardDescription>Select a credential to prove request</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {status === "idle" && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Select Credential:</label>
                                    <select
                                        className="w-full p-2 border rounded-md"
                                        value={selectedCredentialId}
                                        onChange={(e) => setSelectedCredentialId(e.target.value)}
                                    >
                                        <option value="">-- Choose --</option>
                                        {credentials.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.issuer} ({Object.values(c.attributes).join(", ")})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <Button
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    onClick={handleVerify}
                                    disabled={!selectedCredentialId}
                                >
                                    Generate Proof & Verify
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        )}

                        {status === "proving" && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                                <p className="text-sm font-medium">Generating Zero-Knowledge Proof...</p>
                                <p className="text-xs text-neutral-400">Calculations happening on client device</p>
                            </div>
                        )}

                        {status === "verifying" && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                                <p className="text-sm font-medium">Verifying Proof on Server...</p>
                                <p className="text-xs text-neutral-400">Checking BBS+ signature validity</p>
                            </div>
                        )}

                        {status === "success" && (
                            <div className="flex flex-col items-center justify-center py-6 animate-in zoom-in duration-300">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="w-10 h-10 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold text-green-700 mb-2">Verified!</h3>
                                <p className="text-sm text-neutral-500 mb-6">Proof accepted by {scenario.name}</p>

                                <div className="w-full bg-neutral-50 p-4 rounded-lg border text-left">
                                    <p className="text-xs text-neutral-400 uppercase font-bold mb-2">Revealed to Verifier:</p>
                                    {Object.entries(result?.revealed_attributes || {}).map(([k, v]) => (
                                        <div key={k} className="flex justify-between border-b last:border-0 border-neutral-200 py-1">
                                            <span className="font-medium text-sm">{k}</span>
                                            <span className="font-mono text-sm">{v as string}</span>
                                        </div>
                                    ))}
                                    <div className="mt-4 pt-2 border-t border-dashed border-neutral-300">
                                        <p className="text-xs text-neutral-400 uppercase font-bold mb-1">Performance:</p>
                                        <p className="text-xs font-mono">Proof Gen + Verify: {proofTime.toFixed(2)}ms</p>
                                    </div>
                                </div>

                                <Button variant="outline" className="mt-6 w-full" onClick={reset}>
                                    Verify Another
                                </Button>
                            </div>
                        )}

                        {status === "failed" && (
                            <div className="flex flex-col items-center justify-center py-6 animate-in zoom-in duration-300">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                    <XCircle className="w-10 h-10 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-red-700 mb-2">Verification Failed</h3>
                                <p className="text-sm text-neutral-500 mb-6">{result?.message || "Invalid proof submitted"}</p>

                                <Button variant="outline" className="mt-6 w-full" onClick={reset}>
                                    Try Again
                                </Button>
                            </div>
                        )}

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
