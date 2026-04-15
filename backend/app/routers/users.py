from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import User
from app.schemas.schemas import UserOut
from app.auth import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

@router.get("", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db), current=Depends(get_current_user)):
    if current.role != "company_admin":
        raise HTTPException(403, "Forbidden")
    return db.query(User).all()

@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: str, db: Session = Depends(get_db), current=Depends(get_current_user)):
    if current.role != "company_admin":
        raise HTTPException(403, "Forbidden")
    user = db.query(User).filter(User.id == user_id).first()
    if not user: raise HTTPException(404)
    db.delete(user); db.commit()
