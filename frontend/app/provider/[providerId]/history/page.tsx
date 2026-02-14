"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface HistoryEntry {
    verification_id: string;
    verified: boolean;
    predicate: string;
    timestamp: string;
}

export default function HistoryPage() {
    const params = useParams();
    const providerId = params.providerId as string;
    const router = useRouter();
    const { toast } = useToast();

    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch Audit History
        const fetchHistory = async () => {
            try {
                const res = await fetch(`/api/provider/${providerId}/audit`);
                if (!res.ok) throw new Error("Failed to fetch history");
                const data = await res.json();
                setHistory(data.verifications || []);
            } catch (e) {
                const message = e instanceof Error ? e.message : "Could not retrieve audit logs";
                toast({
                    title: "Error Loading History",
                    description: message,
                    variant: "destructive"
                });
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [providerId, toast]);

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <div className="mb-6 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Audit Log History</h1>
                    <p className="text-muted-foreground">All verification attempts recorded for {providerId}</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Verifications</CardTitle>
                    <CardDescription>
                        A tamper-evident log of all zero-knowledge proofs submitted to this provider.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[100px]">Result</TableHead>
                                    <TableHead>Verification ID</TableHead>
                                    <TableHead>Request Requirement</TableHead>
                                    <TableHead className="text-right">Time</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {history.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            No verification history found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    history.map((entry) => (
                                        <TableRow key={entry.verification_id}>
                                            <TableCell>
                                                <Badge
                                                    variant={entry.verified ? "default" : "destructive"}
                                                    className={entry.verified ? "bg-green-600 hover:bg-green-700" : ""}
                                                >
                                                    {entry.verified ? "Verified" : "Failed"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {entry.verification_id.slice(0, 8)}...
                                            </TableCell>
                                            <TableCell>{entry.predicate}</TableCell>
                                            <TableCell className="text-right text-xs text-muted-foreground">
                                                {new Date(entry.timestamp).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
