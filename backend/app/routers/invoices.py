import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import Invoice
from app.schemas.schemas import InvoiceCreate, InvoiceUpdate, InvoiceOut
from app.auth import get_current_user

router = APIRouter(prefix="/invoices", tags=["invoices"])

@router.get("", response_model=List[InvoiceOut])
def list_invoices(db: Session = Depends(get_db), current=Depends(get_current_user)):
    if current.role not in ("finance_staff", "company_admin"):
        raise HTTPException(403)
    return db.query(Invoice).all()

@router.post("", response_model=InvoiceOut, status_code=201)
def create_invoice(body: InvoiceCreate, db: Session = Depends(get_db), current=Depends(get_current_user)):
    if current.role not in ("finance_staff", "company_admin"):
        raise HTTPException(403)
    inv = Invoice(id=f"INV-{str(uuid.uuid4())[:6].upper()}", **body.model_dump())
    db.add(inv); db.commit(); db.refresh(inv)
    return inv

@router.patch("/{inv_id}", response_model=InvoiceOut)
def update_invoice(inv_id: str, body: InvoiceUpdate, db: Session = Depends(get_db), current=Depends(get_current_user)):
    if current.role not in ("finance_staff", "company_admin"):
        raise HTTPException(403)
    inv = db.query(Invoice).filter(Invoice.id == inv_id).first()
    if not inv: raise HTTPException(404)
    inv.status = body.status
    db.commit(); db.refresh(inv)
    return inv
