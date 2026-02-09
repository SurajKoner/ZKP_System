"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Building,
    ShieldCheck,
    Activity,
    UserPlus,
    FileCheck
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

export default function HospitalPortal() {
    const [hospitalId, setHospitalId] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleRegister = async () => {
        setLoading(true);
        try {
            // Direct fetch to match updated backend path
            const res = await fetch("/api/hospital/init", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hospital_id: hospitalId || "apollo_mumbai_001",
                    hospital_name: "Apollo Hospital Mumbai"
                })
            });

            if (!res.ok) throw new Error("Failed to register");

            const data = await res.json();
            toast({
                title: "Hospital Registered",
                description: `Issuer ID: ${data.hospital_id}`,
            });

            localStorage.setItem("hospitalId", data.hospital_id);

        } catch (e) {
            toast({ title: "Error", description: "Registration failed", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary/10 rounded-xl">
                    <Building className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold">Hospital Portal</h1>
                    <p className="text-neutral-500">Manage credential issuance and keys</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/hospital/issue">
                                <Button className="w-full h-24 flex flex-col gap-2 bg-primary hover:bg-primary/90 text-lg">
                                    <UserPlus className="w-6 h-6" />
                                    Issue Credential
                                </Button>
                            </Link>
                            <Link href="/hospital/issued">
                                <Button variant="outline" className="w-full h-24 flex flex-col gap-2 text-lg">
                                    <FileCheck className="w-6 h-6" />
                                    View History
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Hospital Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Hospital ID</Label>
                            <Input
                                placeholder="apollo_mumbai_001"
                                value={hospitalId}
                                onChange={(e) => setHospitalId(e.target.value)}
                            />
                        </div>
                        <Button
                            onClick={handleRegister}
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? "Registering..." : "Initialize / Register"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
