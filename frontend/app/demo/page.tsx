"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/services/api";
import { cryptoService } from "@/services/crypto";
import { Loader2, CheckCircle, Play, RefreshCw } from "lucide-react";

interface DemoState {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    credential?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    proof?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    verification?: any;
}

export default function DemoWalkthrough() {
    const [step, setStep] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = useCallback((msg: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    }, []);

    const demoData = useRef<DemoState>({});

    const runStep = useCallback(async (currentStep: number) => {
        try {
            if (currentStep === 1) {
                addLog("Step 1: Requesting Credential from Issuer...");
                const attributes = { name: "Alice Demo", age: "25", membership: "gold" };
                const result = await api.issuer.issueCredential(attributes);

                const credential = {
                    id: "demo-cred-" + Date.now(),
                    issuer: "Demo Issuer",
                    subject: attributes.name,
                    attributes: result.credential.attributes,
                    signature: result.credential.signature,
                    issuerPublicKey: result.credential.issuerPublicKey,
                    issuanceDate: new Date().toISOString()
                };

                demoData.current.credential = credential;
                addLog(`Credential Received! Signed with BBS+. Signature: ${result.credential.signature.substring(0, 20)}...`);
                setStep(2);
            }

            if (currentStep === 2) {
                addLog("Step 2: Preparing Proof for 'Bar' (Over 21)...");
                // Simulate delay & scanner interaction
                await new Promise(r => setTimeout(r, 800));

                // Init verification session
                const request = await api.verifier.createRequest("bar", "age > 21");
                addLog(`Verifier Request: ${request.requestId}`);

                const nonce = request.requestId; // Use request ID as nonce in this flow
                const proof = await cryptoService.generateProof(
                    demoData.current.credential,
                    ["age"], // Only reveal age
                    nonce
                );

                demoData.current.proof = { ...proof, nonce, requestId: request.requestId };
                addLog("Proof Generated! Zero-knowledge proof created locally.");
                addLog(`Revealing attributes: ${Object.keys(proof.revealed_attributes).join(", ")}`);
                setStep(3);
            }

            if (currentStep === 3) {
                addLog("Step 3: Sending Proof to Verifier...");

                const verification = await api.verifier.submitProof(
                    demoData.current.proof.requestId,
                    JSON.stringify(demoData.current.proof),
                    demoData.current.proof.revealed_attributes,
                    demoData.current.credential.issuerPublicKey
                );

                demoData.current.verification = verification;
                if (verification.verified) {
                    addLog("Step 4: Verification SUCCESS!");
                    addLog(`Verifier checked proof without seeing name. Verified at: ${verification.timestamp}`);
                    setStep(4);
                } else {
                    addLog("Verification Failed.");
                }
            }

        } catch (e) {
            addLog(`Error: ${e}`);
        }
    }, [addLog]);

    useEffect(() => {
        if (step > 0 && step < 4) {
            const timer = setTimeout(() => runStep(step), 1500);
            return () => clearTimeout(timer);
        }
    }, [step, runStep]);

    return (
        <div className="container mx-auto p-8 max-w-3xl">
            <h1 className="text-3xl font-bold mb-8">Automated ZKP Walkthrough</h1>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <Card className={`transition-all ${step >= 1 ? 'border-indigo-500 shadow-md' : 'opacity-50'}`}>
                        <CardContent className="p-4">
                            <h3 className="font-bold flex items-center gap-2">
                                1. Issuance
                                {step > 1 && <CheckCircle className="w-4 h-4 text-green-500" />}
                                {step === 1 && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
                            </h3>
                            <p className="text-sm text-neutral-500">Issuer signs attributes (Name, Age, Member) with BBS+.</p>
                        </CardContent>
                    </Card>

                    <Card className={`transition-all ${step >= 2 ? 'border-purple-500 shadow-md' : 'opacity-50'}`}>
                        <CardContent className="p-4">
                            <h3 className="font-bold flex items-center gap-2">
                                2. Proving
                                {step > 2 && <CheckCircle className="w-4 h-4 text-green-500" />}
                                {step === 2 && <Loader2 className="w-4 h-4 animate-spin text-purple-500" />}
                            </h3>
                            <p className="text-sm text-neutral-500">Holder generates ZK proof revealing ONLY Age.</p>
                        </CardContent>
                    </Card>

                    <Card className={`transition-all ${step >= 3 ? 'border-pink-500 shadow-md' : 'opacity-50'}`}>
                        <CardContent className="p-4">
                            <h3 className="font-bold flex items-center gap-2">
                                3. Verification
                                {step === 4 && <CheckCircle className="w-4 h-4 text-green-500" />}
                                {step === 3 && <Loader2 className="w-4 h-4 animate-spin text-pink-500" />}
                            </h3>
                            <p className="text-sm text-neutral-500">Verifier checks proof signature valid & Age &gt; 21.</p>
                        </CardContent>
                    </Card>

                    {step === 0 && (
                        <Button onClick={() => setStep(1)} className="w-full">
                            <Play className="mr-2 w-4 h-4" /> Start Demo
                        </Button>
                    )}

                    {step === 4 && (
                        <Button onClick={() => { setStep(0); setLogs([]); demoData.current = {}; }} variant="outline" className="w-full">
                            <RefreshCw className="mr-2 w-4 h-4" /> Restart
                        </Button>
                    )}
                </div>

                <Card className="bg-neutral-900 text-neutral-50 h-full overflow-hidden flex flex-col">
                    <CardContent className="p-4 flex-1 font-mono text-xs space-y-2 overflow-y-auto max-h-[500px]">
                        {logs.length === 0 && <span className="text-neutral-500">Waiting to start...</span>}
                        {logs.map((log, i) => (
                            <div key={i} className="border-l-2 border-green-500 pl-2">
                                {log}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
