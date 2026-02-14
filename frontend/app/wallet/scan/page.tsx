"use client";

import { useEffect, useState, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { X, Camera } from "lucide-react";
import { useRouter } from "next/navigation";

export default function QRScanner() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [scanning, setScanning] = useState(true);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        const codeReader = new BrowserMultiFormatReader();

        if (scanning && videoRef.current) {
            codeReader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
                if (result) {
                    handleScan(result.getText());
                    codeReader.reset();
                    setScanning(false);
                }
            });
        }

        return () => {
            codeReader.reset();
        };
    }, [scanning]);

    const handleScan = (data: string) => {
        try {
            // Some scanners might return just the content, others might wrap it.
            // We expect a URL starting with mediguard://
            let urlObj: URL;
            try {
                urlObj = new URL(data);
            } catch {
                // Not a valid URL
                throw new Error("Not a valid MediGuard code");
            }

            if (urlObj.protocol !== "mediguard:") {
                throw new Error("Invalid protocol. Must be mediguard://");
            }

            if (urlObj.pathname.includes("credential") || urlObj.host === "credential") {
                // Handle Credential Import
                const payload = urlObj.searchParams.get("payload");
                if (!payload) throw new Error("No payload found");

                const credential = JSON.parse(payload);
                // Simple validation
                if (!credential.type || !credential.iss || !credential.sig) {
                    throw new Error("Invalid credential format");
                }

                const existing = JSON.parse(localStorage.getItem("mediguard_credentials") || "[]");
                // Avoid duplicates
                if (!existing.some((c: any) => c.id === credential.id)) {
                    existing.push({ ...credential, issuedAt: new Date().toISOString() });
                    localStorage.setItem("mediguard_credentials", JSON.stringify(existing));
                    toast({ title: "Success", description: `Added ${credential.type} credential` });
                } else {
                    toast({ title: "Info", description: "Credential already exists" });
                }

                router.push("/wallet");
            } else if (urlObj.pathname.includes("verify") || urlObj.host === "verify") {
                // Handle Verification Request
                const reqId = urlObj.searchParams.get("req");
                if (!reqId) throw new Error("No request ID found");

                router.push(`/wallet/prove?req=${reqId}`);
            } else {
                throw new Error("Unknown MediGuard action");
            }
        } catch (e: any) {
            toast({ title: "Invalid Code", description: e.message, variant: "destructive" });
            // Small delay before rescanning to avoid alert loop
            setTimeout(() => setScanning(true), 1500);
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center">
            <Button
                variant="ghost"
                className="absolute top-4 right-4 text-white hover:bg-white/20"
                onClick={() => router.back()}
            >
                <X className="w-8 h-8" />
            </Button>

            <div className="relative w-full max-w-sm aspect-square border-2 border-white/50 rounded-lg overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-primary animate-pulse m-8 rounded-lg pointer-events-none"></div>
            </div>

            <p className="text-white mt-8 text-center px-4">
                Point your camera at a MediGuard QR Code to import a credential or verify a request.
            </p>
        </div>
    );
}
