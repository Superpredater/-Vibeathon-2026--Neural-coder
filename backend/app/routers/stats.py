from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Order, Delivery, LedgerEntry, User, Courier
from app.auth import get_current_user

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/dashboard")
def dashboard_stats(db: Session = Depends(get_db), current=Depends(get_current_user)):
    orders     = db.query(Order).all()
    deliveries = db.query(Delivery).all()
    users      = db.query(User).all()
    couriers   = db.query(Courier).all()
    entries    = db.query(LedgerEntry).all()

    active_orders  = [o for o in orders if o.status in ("pending","picking","in_transit")]
    delayed_orders = [o for o in orders if o.status == "delayed"]
    delivered      = [d for d in deliveries if d.status == "delivered"]
    unassigned     = [d for d in deliveries if not d.courier_id and d.status == "pending"]

    gmv     = sum(e.amount for e in entries if e.type == "credit" and e.account == "gmv")
    refunds = sum(e.amount for e in entries if e.account == "refund" and e.type == "debit")
    cogs    = sum(e.amount for e in entries if e.account == "cogs" and e.type == "debit")
    fulfill = sum(e.amount for e in entries if e.account == "fulfillment" and e.type == "debit")
    net     = gmv - cogs - fulfill - refunds

    return {
        "total_orders":       len(orders),
        "active_orders":      len(active_orders),
        "delayed_orders":     len(delayed_orders),
        "delivered_today":    len(delivered),
        "unassigned_deliveries": len(unassigned),
        "total_users":        len(users),
        "active_couriers":    len([c for c in couriers if c.status == "active"]),
        "gmv":                gmv,
        "net_revenue":        net,
        "refund_liability":   refunds,
        "ledger_entries":     len(entries),
    }
