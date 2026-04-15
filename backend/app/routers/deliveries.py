import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import Delivery, Courier
from app.schemas.schemas import DeliveryCreate, DeliveryUpdate, DeliveryOut
from app.auth import get_current_user

router = APIRouter(prefix="/deliveries", tags=["deliveries"])

@router.get("", response_model=List[DeliveryOut])
def list_deliveries(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Delivery).order_by(Delivery.created_at.desc()).all()

@router.post("", response_model=DeliveryOut, status_code=201)
def create_delivery(body: DeliveryCreate, db: Session = Depends(get_db), current=Depends(get_current_user)):
    if current.role not in ("company_admin", "delivery_staff"):
        raise HTTPException(403)
    d = Delivery(id=f"DEL-{str(uuid.uuid4())[:6].upper()}", **body.model_dump())
    db.add(d); db.commit(); db.refresh(d)
    return d

@router.patch("/{del_id}", response_model=DeliveryOut)
def update_delivery(del_id: str, body: DeliveryUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    d = db.query(Delivery).filter(Delivery.id == del_id).first()
    if not d: raise HTTPException(404)
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(d, k, v)
    # update courier active_orders count
    if body.courier_id:
        c = db.query(Courier).filter(Courier.id == body.courier_id).first()
        if c: c.active_orders = min(c.active_orders + 1, c.batch_limit)
    db.commit(); db.refresh(d)
    return d
