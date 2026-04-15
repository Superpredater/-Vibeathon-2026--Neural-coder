import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import Courier
from app.schemas.schemas import CourierCreate, CourierUpdate, CourierOut
from app.auth import get_current_user

router = APIRouter(prefix="/couriers", tags=["couriers"])

@router.get("", response_model=List[CourierOut])
def list_couriers(db: Session = Depends(get_db), _=Depends(get_current_user)):
    return db.query(Courier).all()

@router.post("", response_model=CourierOut, status_code=201)
def create_courier(body: CourierCreate, db: Session = Depends(get_db), current=Depends(get_current_user)):
    if current.role not in ("company_admin", "delivery_staff"):
        raise HTTPException(403)
    c = Courier(id=f"C-{str(uuid.uuid4())[:6].upper()}", **body.model_dump())
    db.add(c); db.commit(); db.refresh(c)
    return c

@router.patch("/{courier_id}", response_model=CourierOut)
def update_courier(courier_id: str, body: CourierUpdate, db: Session = Depends(get_db), current=Depends(get_current_user)):
    if current.role not in ("company_admin", "delivery_staff"):
        raise HTTPException(403)
    c = db.query(Courier).filter(Courier.id == courier_id).first()
    if not c: raise HTTPException(404)
    for k, v in body.model_dump(exclude_none=True).items():
        setattr(c, k, v)
    db.commit(); db.refresh(c)
    return c
