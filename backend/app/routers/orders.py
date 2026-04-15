import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import Order
from app.schemas.schemas import OrderCreate, OrderUpdate, OrderOut
from app.auth import get_current_user

router = APIRouter(prefix="/orders", tags=["orders"])

@router.get("", response_model=List[OrderOut])
def list_orders(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Order).order_by(Order.created_at.desc()).all()

@router.post("", response_model=OrderOut, status_code=201)
def create_order(body: OrderCreate, db: Session = Depends(get_db), current=Depends(get_current_user)):
    order = Order(id=f"ORD-{str(uuid.uuid4())[:6].upper()}", **body.model_dump())
    db.add(order); db.commit(); db.refresh(order)
    return order

@router.patch("/{order_id}", response_model=OrderOut)
def update_order(order_id: str, body: OrderUpdate, db: Session = Depends(get_db), _=Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order: raise HTTPException(404)
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(order, k, v)
    db.commit(); db.refresh(order)
    return order

@router.delete("/{order_id}", status_code=204)
def delete_order(order_id: str, db: Session = Depends(get_db), current=Depends(get_current_user)):
    if current.role not in ("company_admin", "delivery_staff"):
        raise HTTPException(403)
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order: raise HTTPException(404)
    db.delete(order); db.commit()
