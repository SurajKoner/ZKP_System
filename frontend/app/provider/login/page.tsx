"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowRight, Building2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProviderLoginPage() {
    const [providerId, setProviderId] = useState("");
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (providerId) {
            // In a real app, this would verify credentials
            router.push(`/provider/${providerId}`);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-neutral-50 dark:bg-neutral-900">
            <Link href="/" className="mb-8 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-primary" />
                <span className="font-bold text-lg">MediGuard</span>
            </Link>

            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Provider Login</CardTitle>
                    <CardDescription>
                        Access your verification dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="provider_id">Provider ID</Label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" />
                                <Input
                                    id="provider_id"
                                    placeholder="e.g. apollo_pharmacy_001"
                                    value={providerId}
                                    onChange={(e) => setProviderId(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                            Continue <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </form>

                    <div className="mt-4 text-center text-sm">
                        <span className="text-neutral-500">Don&apos;t have an ID? </span>
                        <span className="text-primary cursor-pointer hover:underline" onClick={() => setProviderId("demo_provider")}>Use &apos;demo_provider&apos;</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
