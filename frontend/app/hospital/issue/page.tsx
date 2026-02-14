"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "@/components/ui/use-toast";
import { Copy, CheckCircle, ShieldCheck } from "lucide-react";

export default function IssuePage() {
    const [formData, setFormData] = useState({
        credential_type: "vaccination",
        patient_name: "Alice Kumar",
        patient_id: "MH12345",
        vaccination_type: "COVID-19 mRNA",
        vaccination_date: "2024-01-15",
        expiry_date: "2025-03-15",
        hospital_id: "apollo_mumbai_001"
    });

    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const handleIssue = async () => {
        setLoading(true);
        try {
            // 1. Prepare attributes for issue API
            const attributes = {
                ...formData,
                credential_type: formData.credential_type // add to attributes payload
            };

            const res = await fetch("/api/hospital/issue", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hospital_id: formData.hospital_id,
                    credential_type: formData.credential_type,
                    attributes
                })
            });

            if (!res.ok) throw new Error("Issue failed");
            const data = await res.json();
            setResult(data);
            toast({ title: "Success", description: "Credential issued successfully!" });

        } catch (e) {
            toast({ title: "Error", description: "Failed to issue credential", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result.qr_code_data);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Issue New Credential</h1>

            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Patient Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Credential Type</Label>
                            <Select
                                value={formData.credential_type}
                                onValueChange={(v) => setFormData({ ...formData, credential_type: v })}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="vaccination">Vaccination Certificate</SelectItem>
                                    <SelectItem value="prescription">Prescription</SelectItem>
                                    <SelectItem value="blood_type">Blood Type Card</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Patient Name</Label>
                            <Input
                                value={formData.patient_name}
                                onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                            />
                        </div>

                        {formData.credential_type === "vaccination" && (
                            <>
                                <div className="space-y-2">
                                    <Label>Vaccine Type</Label>
                                    <Input
                                        value={formData.vaccination_type}
                                        onChange={(e) => setFormData({ ...formData, vaccination_type: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Date Administered</Label>
                                        <Input
                                            type="date"
                                            value={formData.vaccination_date}
                                            onChange={(e) => setFormData({ ...formData, vaccination_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Expiry Date</Label>
                                        <Input
                                            type="date"
                                            value={formData.expiry_date}
                                            onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <Button onClick={handleIssue} disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-lg py-6">
                            {loading ? "Signing..." : "Issue & Sign Credential"}
                        </Button>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    {result ? (
                        <Card className="border-primary/20 bg-primary/5">
                            <CardHeader>
                                <CardTitle className="text-primary flex items-center gap-2">
                                    <CheckCircle className="w-6 h-6" />
                                    Credential Generated
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-6">
                                <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-neutral-100">
                                    <QRCodeSVG value={result.qr_code_data} size={250} level={"L"} includeMargin={true} />
                                    <p className="text-center font-bold text-neutral-900 mt-4">Scan to Receive</p>
                                    <p className="text-center text-xs text-neutral-400">"Show this to patient"</p>
                                </div>
                                <div className="w-full space-y-2">
                                    <Button variant="outline" onClick={handleCopy} className="w-full flex gap-2">
                                        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        {copied ? "Copied!" : "Copy Link"}
                                    </Button>
                                    <Button className="w-full" onClick={() => setResult(null)}>Issue Another</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-neutral-400 border-2 border-dashed rounded-xl p-8 bg-neutral-50/50">
                            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                                <ShieldCheck className="w-8 h-8 text-neutral-300" />
                            </div>
                            <p>Generated credential QR will appear here</p>
                            <p className="text-xs mt-2 text-neutral-300">"Show to patient to receive credential"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
