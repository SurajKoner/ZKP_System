"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Plus, ScanLine } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

interface Credential {
    id: string;
    type: string;
    iss: string;
    issuedAt: string;
}

export default function WalletPage() {
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        // Load credentials from IndexedDB or local storage
        const stored = localStorage.getItem("mediguard_credentials");
        if (stored) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCredentials(JSON.parse(stored));
        }
    }, []);

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-lg min-h-screen relative pb-20">
            <header className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold">My Wallet</h1>
                </div>
            </header>

            <div className="space-y-6">
                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <Button asChild className="w-full h-24 flex flex-col gap-2 bg-gradient-to-br from-neutral-900 to-neutral-800 hover:from-black hover:to-neutral-900 text-white shadow-xl rounded-xl border border-neutral-700">
                        <Link href="/wallet/scan">
                            <ScanLine className="w-8 h-8 mb-1" />
                            <span className="text-lg font-semibold">Scan QR Code</span>
                            <span className="text-xs text-neutral-400 font-normal">Add Credential or Verify</span>
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full h-24 flex flex-col gap-2 border-dashed border-2 hover:bg-neutral-50 rounded-xl">
                        <Link href="/hospital">
                            <Plus className="w-6 h-6 text-neutral-400 mb-1" />
                            <span className="font-medium text-neutral-600">Get New Credential</span>
                            <span className="text-xs text-neutral-400 font-normal">(Go to Hospital Portal)</span>
                        </Link>
                    </Button>
                </div>

                {/* Credentials List */}
                <div>
                    <h2 className="text-lg font-semibold mb-4 text-neutral-500 uppercase tracking-wider text-xs">Your Credentials</h2>

                    <div className="space-y-4">
                        {credentials.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed rounded-xl bg-neutral-50">
                                <p className="text-neutral-400">No credentials yet.</p>
                                <Link href="/hospital/issue" className="text-primary text-sm font-medium hover:underline">
                                    Get your first credential
                                </Link>
                            </div>
                        ) : (
                            credentials.map((cred) => (
                                <Card key={cred.id} className="relative overflow-hidden group hover:shadow-md transition-all border-l-4 border-l-primary">
                                    <CardContent className="p-4 flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg capitalize">{cred.type.replace("_", " ")}</h3>
                                            <p className="text-sm text-neutral-500 mb-2">Issued by {cred.iss}</p>
                                            <div className="flex gap-2">
                                                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Verified</span>
                                                <span className="bg-neutral-100 text-neutral-600 text-xs px-2 py-1 rounded-full">{new Date(cred.issuedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <ShieldCheck className="w-8 h-8 text-neutral-100 group-hover:text-primary/10 transition-colors" />
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="py-8 flex justify-center border-t mt-8">
                <Button
                    variant="ghost"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 text-xs"
                    onClick={() => {
                        if (confirm("Reset wallet and delete all credentials?")) {
                            localStorage.removeItem("mediguard_credentials");
                            setCredentials([]);
                            toast({ title: "Wallet Reset", description: "All credentials deleted." });
                        }
                    }}
                >
                    Reset / Clear Wallet (Demo)
                </Button>
            </div>
        </div >
    );
}
