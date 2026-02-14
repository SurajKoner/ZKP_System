"use client";

import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";


interface Credential {
    id: string;
    type: string;
    issuedAt: string;
}

export default function IssuedCredentialsPage() {
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // ideally this would fetch from a real backend endpoint listing issuedcreds
        // for now we mock it or fetch from the stats endpoint if available
        const timer = setTimeout(() => {
            setCredentials([
                { id: "mock-1", type: "Vaccination", issuedAt: new Date().toISOString() }
            ]);
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Issued Credentials History</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Issuances</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Credential ID</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8">
                                        <Loader2 className="animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : credentials.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-neutral-500 py-8">
                                        No credentials issued yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                credentials.map((cred) => (
                                    <TableRow key={cred.id}>
                                        <TableCell className="font-mono">{cred.id.slice(0, 8)}...</TableCell>
                                        <TableCell className="capitalize">{cred.type}</TableCell>
                                        <TableCell>{new Date(cred.issuedAt).toLocaleDateString()}</TableCell>
                                        <TableCell><Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Active</Badge></TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
