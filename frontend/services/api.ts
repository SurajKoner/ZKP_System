const API_BASE = ""; // Uses Next.js rewrites to proxy to backend

export const api = {
    issuer: {
        /**
         * Initialize the issuer service.
         */
        init: async (issuerName: string) => {
            const res = await fetch(`${API_BASE}/api/hospital/init`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hospital_id: issuerName.toLowerCase().replace(/\s+/g, '_'),
                    hospital_name: issuerName
                }),
            });
            if (!res.ok) throw new Error("Failed to init issuer");
            return await res.json();
        },

        getPublicKey: async (issuerId = "demo_issuer"): Promise<string> => {
            const res = await fetch(`${API_BASE}/api/hospital/${issuerId}/public-key`);
            if (!res.ok) {
                // Return a mock key if endpoint fails (for demo resilience)
                return "mock_pk_12345";
            }
            const data = await res.json();
            return data.public_key;
        },

        /**
         * Issue a new credential with the given attributes.
         */
        issueCredential: async (attributes: Record<string, string>): Promise<{ credential: { signature: string, issuerPublicKey: string, attributes: Record<string, string> } }> => {
            const res = await fetch(`${API_BASE}/api/hospital/issue`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hospital_id: "demo_issuer",
                    credential_type: "demo_cred",
                    attributes
                }),
            });
            if (!res.ok) throw new Error("Failed to issue credential (backend error)");
            const data = await res.json();

            return {
                credential: {
                    signature: data.signature,
                    issuerPublicKey: data.issuer_public_key,
                    attributes: data.attributes
                }
            };
        },

        getStats: async () => {
            return { totalIssued: 0, activeCredentials: 0 };
        }
    },

    verifier: {
        /**
         * Create a new verification request.
         */
        createRequest: async (verifierId: string, predicate: string) => {
            let predObj = {};
            if (predicate.includes(">")) {
                const parts = predicate.split(">");
                predObj = {
                    type: "COMPARISON",
                    attribute: parts[0].trim(),
                    operator: "GT",
                    value: parts[1].trim()
                };
            } else {
                predObj = { type: "COMPARISON", attribute: "age", operator: "GT", value: "18" };
            }

            const res = await fetch(`${API_BASE}/api/provider/request`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    provider_id: verifierId,
                    provider_name: "Demo Verifier",
                    provider_type: "verifier",
                    predicate: predObj
                }),
            });
            if (!res.ok) throw new Error("Failed to create verification request");
            const data = await res.json();

            return {
                requestId: data.request_id,
                qrCode: data.qr_code_data,
                predicate: data.predicate_human_readable
            };
        },

        /**
         * Submit a proof for verification.
         */
        submitProof: async (requestId: string, proof: any, revealed: any, issuerPublicKey: string) => {
            const res = await fetch(`${API_BASE}/api/provider/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    request_id: requestId,
                    proof: typeof proof === 'string' ? proof : JSON.stringify(proof),
                    revealed_attributes: revealed,
                    issuer_public_key: issuerPublicKey
                }),
            });
            if (!res.ok) throw new Error("Verification failed");
            const data = await res.json();
            return {
                verified: data.verified,
                timestamp: data.timestamp
            };
        }
    }
};
