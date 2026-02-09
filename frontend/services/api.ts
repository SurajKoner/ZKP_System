const API_BASE = ""; // Uses Next.js rewrites to proxy to backend

export const api = {
    issuer: {
        /**
         * Initialize the issuer service.
         * @param issuerName - Name of the issuer to initialize.
         * @returns Object containing public key and issuer ID.
         */
        init: async (issuerName: string) => {
            const res = await fetch(`${API_BASE}/api/issuer/init`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ issuerName }),
            });
            if (!res.ok) throw new Error("Failed to init issuer");
            return await res.json();
        },

        /**
         * Get the current issuer's public key.
         * @returns The public key string (BBS+).
         */
        getPublicKey: async (): Promise<string> => {
            const res = await fetch(`${API_BASE}/api/issuer/public-key`);
            if (!res.ok) throw new Error("Failed to fetch issuer key");
            const data = await res.json();
            return data.publicKey;
        },

        /**
         * Issue a new credential with the given attributes.
         * @param attributes - Key-value pair of attributes.
         * @returns The signed credential.
         */
        issueCredential: async (attributes: Record<string, string>): Promise<{ credential: { signature: string, issuerPublicKey: string, attributes: Record<string, string> } }> => {
            const res = await fetch(`${API_BASE}/api/issuer/issue`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ attributes }),
            });
            if (!res.ok) throw new Error("Failed to issue credential");
            return await res.json();
        },

        /**
         * Helper to get issuer stats.
         */
        getStats: async () => {
            const res = await fetch(`${API_BASE}/api/issuer/stats`);
            if (!res.ok) return { totalIssued: 0, activeCredentials: 0 };
            return await res.json();
        }
    },

    verifier: {
        /**
         * Create a new verification request.
         * @param verifierId - ID of the verifier entity.
         * @param predicate - The condition to verify (e.g. "age > 18").
         * @returns Request ID, QR code data, and predicate.
         */
        createRequest: async (verifierId: string, predicate: string) => {
            const res = await fetch(`${API_BASE}/api/verify/request`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ verifierId, predicate }),
            });
            if (!res.ok) throw new Error("Failed to create verification request");
            return await res.json(); // returns { requestId, qrCode, predicate }
        },

        /**
         * Submit a proof for verification.
         * @param requestId - The ID of the request being responded to.
         * @param proof - The generated ZKP (serialized).
         * @param revealed - The attributes revealed in the proof.
         * @param issuerPublicKey - Key used to verify the original credential signature.
         * @returns Verification result.
         */
        submitProof: async (requestId: string, proof: any, revealed: any, issuerPublicKey: string) => {
            const res = await fetch(`${API_BASE}/api/verify/submit`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    requestId,
                    proof, // serialized proof string
                    revealed,
                    issuerPublicKey
                }),
            });
            if (!res.ok) throw new Error("Verification failed");
            return await res.json();
        }
    }
};
