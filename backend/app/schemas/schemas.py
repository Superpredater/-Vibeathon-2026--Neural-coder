from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# ── Auth ──────────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: str
    extra: Optional[dict] = {}

class UserLogin(BaseModel):
    email: str
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}

# ── Orders ────────────────────────────────────────────────────────────────────
class OrderCreate(BaseModel):
    customer: str
    address: str
    store: str
    items: int
    value: float = 0
    eta: str = "—"

class OrderUpdate(BaseModel):
    status: Optional[str] = None
    courier_id: Optional[str] = None
    eta: Optional[str] = None

class OrderOut(BaseModel):
    id: str
    customer: str
    address: str
    store: str
    items: int
    status: str
    courier_id: Optional[str]
    value: float
    eta: str
    created_at: datetime
    model_config = {"from_attributes": True}

# ── Ledger ────────────────────────────────────────────────────────────────────
class LedgerCreate(BaseModel):
    type: str          # credit | debit
    account: str
    description: str
    order_id: str = "—"
    store: str
    amount: float

class LedgerOut(BaseModel):
    id: str
    type: str
    account: str
    description: str
    order_id: str
    store: str
    amount: float
    currency: str
    created_at: datetime
    model_config = {"from_attributes": True}

# ── Invoices ──────────────────────────────────────────────────────────────────
class InvoiceCreate(BaseModel):
    vendor: str
    store: str
    category: str
    amount: float
    issued: str
    due: str

class InvoiceUpdate(BaseModel):
    status: str

class InvoiceOut(BaseModel):
    id: str
    vendor: str
    store: str
    category: str
    amount: float
    issued: str
    due: str
    status: str
    model_config = {"from_attributes": True}

# ── Deliveries ────────────────────────────────────────────────────────────────
class DeliveryCreate(BaseModel):
    order_id: str
    customer: str
    address: str
    store: str
    items: int
    value: str = "₹ 0"
    eta: str = "—"

class DeliveryUpdate(BaseModel):
    status: Optional[str] = None
    courier_id: Optional[str] = None
    eta: Optional[str] = None

class DeliveryOut(BaseModel):
    id: str
    order_id: str
    customer: str
    address: str
    store: str
    items: int
    status: str
    courier_id: Optional[str]
    value: str
    eta: str
    created_at: datetime
    model_config = {"from_attributes": True}

# ── Couriers ──────────────────────────────────────────────────────────────────
class CourierCreate(BaseModel):
    name: str
    email: str
    phone: str
    vehicle: str

class CourierUpdate(BaseModel):
    status: Optional[str] = None
    active_orders: Optional[int] = None
    on_time_rate: Optional[str] = None
    rating: Optional[float] = None
    completed_today: Optional[int] = None

class CourierOut(BaseModel):
    id: str
    name: str
    email: str
    phone: str
    vehicle: str
    status: str
    active_orders: int
    on_time_rate: str
    rating: float
    completed_today: int
    batch_limit: int
    hours_today: str
    model_config = {"from_attributes": True}
