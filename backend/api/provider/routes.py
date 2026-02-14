from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from database.db import get_db
from database.models import VerificationRequest, VerificationResult
from .schemas import ProviderRequest, ProviderRequestResponse, VerifyProofRequest, VerifyProofResponse
from crypto.bbs_mock import BbsMock
import uuid
from datetime import datetime, timedelta
import json

router = APIRouter()

@router.post("/request", response_model=ProviderRequestResponse)
async def create_verification_request(req: ProviderRequest, db: AsyncSession = Depends(get_db)):
    """Provider (Pharmacy/Insurance) creates a proof request"""
    req_id = f"req_{uuid.uuid4().hex[:8]}"
    expires = datetime.now() + timedelta(minutes=15)
    
    # Simple human readable generator (for demo)
    desc = "Proof Request"
    if req.predicate.get("type") == "COMPARISON":
        v = req.predicate.get("value")
        desc = f"Verify {req.predicate.get('attribute')} is {v}"
    
    request = VerificationRequest(
        id=str(uuid.uuid4()),
        request_id=req_id,
        provider_id=req.provider_id,
        provider_name=req.provider_name,
        provider_type=req.provider_type,
        predicate=req.predicate,
        predicate_human_readable=desc,
        expires_at=expires
    )
    db.add(request)
    await db.commit()
    await db.refresh(request)
    
    qr_data = f"mediguard://verify?req={req_id}&provider={req.provider_id}"
    
    return ProviderRequestResponse(
        request_id=req_id,
        provider_id=req.provider_id,
        predicate_human_readable=desc,
        qr_code_data=qr_data,
        created_at=request.created_at,
        expires_at=expires
    )

@router.get("/request/{request_id}")
async def get_request(request_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(VerificationRequest).where(VerificationRequest.request_id == request_id))
    req = result.scalars().first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
        
    return {
        "request_id": req.request_id,
        "provider_name": req.provider_name,
        "predicate": req.predicate,
        "expires_at": req.expires_at
    }

@router.post("/verify", response_model=VerifyProofResponse)
async def verify_proof(req: VerifyProofRequest, db: AsyncSession = Depends(get_db)):
    """Verify the submitted ZK proof"""
    # 1. Fetch request to get predicate
    result = await db.execute(select(VerificationRequest).where(VerificationRequest.request_id == req.request_id))
    request = result.scalars().first()
    
    if not request:
        raise HTTPException(status_code=404, detail="Request expired or not found")
        
    # 2. Verify Proof (Crypto)
    # Using mock for now, replace with actual BBS verify
    verified = BbsMock.verify_proof(req.proof, req.issuer_public_key, req.revealed_attributes)
    
    # 3. Log Result
    ver_id = f"ver_{uuid.uuid4().hex[:8]}"
    
    res = VerificationResult(
        id=str(uuid.uuid4()),
        verification_id=ver_id,
        request_id=request.id,
        provider_id=request.provider_id,
        verified=verified,
        proof_hash=uuid.uuid4().hex # Randomize to simulate unlinkability (different proof per request)
    )
    db.add(res)
    await db.commit()
    
    return VerifyProofResponse(
        verified=verified,
        request_id=req.request_id,
        verification_id=ver_id,
        provider_id=request.provider_id,
        timestamp=datetime.now()
    )

@router.get("/{provider_id}/audit")
async def get_audit_log(provider_id: str, db: AsyncSession = Depends(get_db)):
    """Get verification history for a provider"""
    # Join results with requests
    query = select(VerificationResult, VerificationRequest).join(
        VerificationRequest, VerificationResult.request_id == VerificationRequest.id
    ).where(VerificationResult.provider_id == provider_id).order_by(VerificationResult.verified_at.desc())
    
    result = await db.execute(query)
    rows = result.all()
    
    return {
        "total": len(rows),
        "verifications": [
            {
                "verification_id": row[0].verification_id,
                "verified": row[0].verified,
                "predicate": row[1].predicate_human_readable,
                "timestamp": row[0].verified_at
            }
            for row in rows
        ]
    }
