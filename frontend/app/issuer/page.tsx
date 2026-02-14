"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { api } from "@/services/api";
import { useWalletStore } from "@/stores/useWalletStore";
import { Loader2, Plus, CheckCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface IssuedCredential {
    id: string;
    issuer: string;
    subject: string;
    attributes: Record<string, string>;
    signature: string;
    issuerPublicKey: string;
    issuanceDate: string;
    metadata: {
        issuerName: string;
        credentialType: string;
    };
}

export default function IssuerPage() {
    const [attributes, setAttributes] = useState({ name: "", age: "", membership: "basic" });
    const [loading, setLoading] = useState(false);
    const [issuedCredential, setIssuedCredential] = useState<IssuedCredential | null>(null);
    const addCredential = useWalletStore((state) => state.addCredential);

    const handleIssue = async () => {
        setLoading(true);
        try {
            // In a real app, authentication would be required here
            const result = await api.issuer.issueCredential(attributes);

            const credential = {
                id: crypto.randomUUID(),
                issuer: "ZKP Demo Issuer",
                subject: attributes.name,
                attributes,
                signature: result.credential.signature,
                issuerPublicKey: result.credential.issuerPublicKey,
                issuanceDate: new Date().toISOString(),
                metadata: {
                    issuerName: "ZKP Demo Issuer",
                    credentialType: "IdentityCredential"
                }
            };

            setIssuedCredential(credential);
        } catch (e) {
            console.error(e);
            alert("Failed to issue credential");
        } finally {
            setLoading(false);
        }
    };

    const handleAddToWallet = () => {
        if (issuedCredential) {
            addCredential(issuedCredential);
            alert("Credential added to your wallet locally!");
            setIssuedCredential(null);
            setAttributes({ name: "", age: "", membership: "basic" });
        }
    };

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Issuer Portal</h1>
            <div className="grid md:grid-cols-2 gap-8">

                <Card>
                    <CardHeader>
                        <CardTitle>Issue New Credential</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <input
                                className="w-full p-2 border rounded-md"
                                value={attributes.name}
                                onChange={(e) => setAttributes({ ...attributes, name: e.target.value })}
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Age</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded-md"
                                value={attributes.age}
                                onChange={(e) => setAttributes({ ...attributes, age: e.target.value })}
                                placeholder="25"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Membership</label>
                            <select
                                className="w-full p-2 border rounded-md"
                                value={attributes.membership}
                                onChange={(e) => setAttributes({ ...attributes, membership: e.target.value })}
                            >
                                <option value="basic">Basic</option>
                                <option value="silver">Silver</option>
                                <option value="gold">Gold</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        <Button className="w-full mt-4" onClick={handleIssue} disabled={loading || !attributes.name || !attributes.age}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            Issue Credential
                        </Button>
                    </CardContent>
                </Card>

                <Card className={issuedCredential ? "border-green-500 bg-green-50/50" : "opacity-50"}>
                    <CardHeader>
                        <CardTitle>Issued Credential</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center space-y-4">
                        {issuedCredential ? (
                            <>
                                <div className="bg-white p-4 rounded-lg shadow-sm">
                                    <QRCodeSVG value={JSON.stringify(issuedCredential)} size={150} />
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-green-700">Signed with BBS+</p>
                                    <p className="text-xs text-neutral-500 break-all max-w-[250px] mt-2">
                                        Sig: {issuedCredential.signature.substring(0, 20)}...
                                    </p>
                                </div>
                                <Button variant="outline" className="w-full border-green-600 text-green-700 hover:bg-green-100" onClick={handleAddToWallet}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Add to Wallet
                                </Button>
                            </>
                        ) : (
                            <div className="text-center py-12 text-neutral-400">
                                <p>Credential will appear here after issuance.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
