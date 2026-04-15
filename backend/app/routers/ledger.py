import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import LedgerEntry
from app.schemas.schemas import LedgerCreate, LedgerOut
from app.auth import get_current_user

router = APIRouter(prefix="/ledger", tags=["ledger"])

@router.get("", response_model=List[LedgerOut])
def list_entries(db: Session = Depends(get_db), current=Depends(get_current_user)):
    if current.role not in ("finance_staff", "company_admin"):
        raise HTTPException(403)
    return db.query(LedgerEntry).order_by(LedgerEntry.created_at.desc()).all()

@router.post("", response_model=LedgerOut, status_code=201)
def add_entry(body: LedgerCreate, db: Session = Depends(get_db), current=Depends(get_current_user)):
    if current.role not in ("finance_staff", "company_admin"):
        raise HTTPException(403)
    entry = LedgerEntry(id=f"LE-{str(uuid.uuid4())[:6].upper()}", **body.model_dump())
    db.add(entry); db.commit(); db.refresh(entry)
    return entry

@router.get("/summary")
def summary(db: Session = Depends(get_db), current=Depends(get_current_user)):
    if current.role not in ("finance_staff", "company_admin"):
        raise HTTPException(403)
    entries = db.query(LedgerEntry).all()
    debits  = sum(e.amount for e in entries if e.type == "debit")
    credits = sum(e.amount for e in entries if e.type == "credit")
    return {"total_debits": debits, "total_credits": credits, "balanced": debits == credits, "count": len(entries)}
