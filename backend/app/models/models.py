from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, Enum
from sqlalchemy.sql import func
from app.database import Base
import enum

class RoleEnum(str, enum.Enum):
    company_admin  = "company_admin"
    delivery_staff = "delivery_staff"
    courier        = "courier"
    finance_staff  = "finance_staff"

class User(Base):
    __tablename__ = "users"
    id           = Column(String, primary_key=True, index=True)
    name         = Column(String, nullable=False)
    email        = Column(String, unique=True, index=True, nullable=False)
    password_hash= Column(String, nullable=False)
    role         = Column(String, nullable=False)
    is_active    = Column(Boolean, default=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())

class Order(Base):
    __tablename__ = "orders"
    id          = Column(String, primary_key=True, index=True)
    customer    = Column(String, nullable=False)
    address     = Column(String, nullable=False)
    store       = Column(String, nullable=False)
    items       = Column(Integer, nullable=False)
    status      = Column(String, default="pending")
    courier_id  = Column(String, nullable=True)
    value       = Column(Float, default=0)
    eta         = Column(String, default="—")
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

class LedgerEntry(Base):
    __tablename__ = "ledger_entries"
    id          = Column(String, primary_key=True, index=True)
    type        = Column(String, nullable=False)   # credit | debit
    account     = Column(String, nullable=False)
    description = Column(String, nullable=False)
    order_id    = Column(String, default="—")
    store       = Column(String, nullable=False)
    amount      = Column(Float, nullable=False)
    currency    = Column(String, default="₹")
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

class Invoice(Base):
    __tablename__ = "invoices"
    id       = Column(String, primary_key=True, index=True)
    vendor   = Column(String, nullable=False)
    store    = Column(String, nullable=False)
    category = Column(String, nullable=False)
    amount   = Column(Float, nullable=False)
    issued   = Column(String, nullable=False)
    due      = Column(String, nullable=False)
    status   = Column(String, default="pending")  # paid | pending | overdue

class Delivery(Base):
    __tablename__ = "deliveries"
    id          = Column(String, primary_key=True, index=True)
    order_id    = Column(String, nullable=False)
    customer    = Column(String, nullable=False)
    address     = Column(String, nullable=False)
    store       = Column(String, nullable=False)
    items       = Column(Integer, nullable=False)
    status      = Column(String, default="pending")
    courier_id  = Column(String, nullable=True)
    value       = Column(String, default="₹ 0")
    eta         = Column(String, default="—")
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

class Courier(Base):
    __tablename__ = "couriers"
    id              = Column(String, primary_key=True, index=True)
    name            = Column(String, nullable=False)
    email           = Column(String, unique=True, nullable=False)
    phone           = Column(String, nullable=False)
    vehicle         = Column(String, nullable=False)
    status          = Column(String, default="active")
    active_orders   = Column(Integer, default=0)
    on_time_rate    = Column(String, default="100%")
    rating          = Column(Float, default=5.0)
    completed_today = Column(Integer, default=0)
    batch_limit     = Column(Integer, default=3)
    hours_today     = Column(String, default="0h 00m")
