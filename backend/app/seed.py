"""Seed the database with demo data matching the frontend mock data."""
import uuid
from app.database import SessionLocal, engine
from app.models.models import Base, User, Order, LedgerEntry, Invoice, Delivery, Courier
from app.auth import hash_password

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(User).count() > 0:
        print("Already seeded."); db.close(); return

    # Users
    users = [
        User(id=str(uuid.uuid4()), name="Jane Smith",   email="admin@aqcli.dev",    password_hash=hash_password("Admin@1234"),    role="company_admin"),
        User(id=str(uuid.uuid4()), name="Alex Johnson", email="delivery@aqcli.dev", password_hash=hash_password("Delivery@1234"), role="delivery_staff"),
        User(id=str(uuid.uuid4()), name="Sam Patel",    email="courier@aqcli.dev",  password_hash=hash_password("Courier@1234"),  role="courier"),
        User(id=str(uuid.uuid4()), name="Priya Sharma", email="finance@aqcli.dev",  password_hash=hash_password("Finance@1234"),  role="finance_staff"),
    ]
    db.add_all(users); db.flush()

    # Couriers
    couriers = [
        Courier(id="C1", name="Sam Patel",    email="sam@aqcli.dev",     phone="+91 98765 43210", vehicle="Bike",    status="active",    active_orders=2, on_time_rate="94.2%", rating=4.8, completed_today=11, batch_limit=3, hours_today="3h 24m"),
        Courier(id="C2", name="Riya Mehta",   email="riya@aqcli.dev",    phone="+91 87654 32109", vehicle="Scooter", status="active",    active_orders=1, on_time_rate="97.1%", rating=4.9, completed_today=8,  batch_limit=3, hours_today="2h 10m"),
        Courier(id="C3", name="Arjun Das",    email="arjun@aqcli.dev",   phone="+91 76543 21098", vehicle="Bike",    status="active",    active_orders=2, on_time_rate="91.5%", rating=4.7, completed_today=14, batch_limit=3, hours_today="4h 05m"),
        Courier(id="C4", name="Neha Gupta",   email="neha@aqcli.dev",    phone="+91 65432 10987", vehicle="Scooter", status="resting",   active_orders=0, on_time_rate="96.8%", rating=4.9, completed_today=9,  batch_limit=3, hours_today="4h 00m"),
        Courier(id="C5", name="Vikram Singh", email="vikram@aqcli.dev",  phone="+91 54321 09876", vehicle="Van",     status="suspended", active_orders=0, on_time_rate="72.3%", rating=3.9, completed_today=3,  batch_limit=1, hours_today="1h 20m"),
    ]
    db.add_all(couriers); db.flush()

    # Orders
    orders = [
        Order(id="ORD-001", customer="Customer A", address="12 MG Road, Bengaluru",    store="DS-North", items=3, status="in_transit", courier_id="C1", value=420,  eta="6 min"),
        Order(id="ORD-002", customer="Customer B", address="45 Park St, Bengaluru",     store="DS-South", items=2, status="picking",    courier_id="C2", value=185,  eta="11 min"),
        Order(id="ORD-003", customer="Customer C", address="7 Brigade Rd, Bengaluru",   store="DS-East",  items=5, status="pending",    courier_id=None, value=540,  eta="—"),
        Order(id="ORD-004", customer="Customer D", address="88 Koramangala, Bengaluru", store="DS-West",  items=1, status="delivered",  courier_id="C3", value=95,   eta="—"),
        Order(id="ORD-005", customer="Customer E", address="22 Indiranagar, Bengaluru", store="DS-North", items=4, status="delayed",    courier_id="C1", value=310,  eta="2 min"),
    ]
    db.add_all(orders); db.flush()

    # Deliveries
    deliveries = [
        Delivery(id="DEL-001", order_id="ORD-001", customer="Customer A", address="12 MG Road, Bengaluru",    store="DS-North", items=3, status="in_transit", courier_id="C1", value="₹ 420", eta="6 min"),
        Delivery(id="DEL-002", order_id="ORD-002", customer="Customer B", address="45 Park St, Bengaluru",     store="DS-South", items=2, status="picking",    courier_id="C2", value="₹ 185", eta="11 min"),
        Delivery(id="DEL-003", order_id="ORD-003", customer="Customer C", address="7 Brigade Rd, Bengaluru",   store="DS-East",  items=5, status="pending",    courier_id=None, value="₹ 540", eta="—"),
        Delivery(id="DEL-004", order_id="ORD-004", customer="Customer D", address="88 Koramangala, Bengaluru", store="DS-West",  items=1, status="delivered",  courier_id="C3", value="₹ 95",  eta="—"),
    ]
    db.add_all(deliveries); db.flush()

    # Ledger entries
    ledger = [
        LedgerEntry(id="LE-001", type="credit", account="gmv",         description="Order revenue",     order_id="ORD-001", store="DS-North", amount=420),
        LedgerEntry(id="LE-002", type="debit",  account="cogs",        description="Cost of goods",     order_id="ORD-001", store="DS-North", amount=280),
        LedgerEntry(id="LE-003", type="debit",  account="fulfillment", description="Delivery cost",     order_id="ORD-001", store="DS-North", amount=42),
        LedgerEntry(id="LE-004", type="credit", account="gmv",         description="Order revenue",     order_id="ORD-002", store="DS-South", amount=185),
        LedgerEntry(id="LE-005", type="debit",  account="cogs",        description="Cost of goods",     order_id="ORD-002", store="DS-South", amount=120),
        LedgerEntry(id="LE-006", type="debit",  account="refund",      description="Customer refund",   order_id="ORD-003", store="DS-East",  amount=320),
        LedgerEntry(id="LE-007", type="credit", account="refund",      description="Refund offset",     order_id="ORD-003", store="DS-East",  amount=320),
        LedgerEntry(id="LE-008", type="debit",  account="write_off",   description="Inventory expiry",  order_id="—",       store="DS-West",  amount=85),
        LedgerEntry(id="LE-009", type="credit", account="gmv",         description="Order revenue",     order_id="ORD-004", store="DS-West",  amount=2100),
        LedgerEntry(id="LE-010", type="debit",  account="cogs",        description="Cost of goods",     order_id="ORD-004", store="DS-West",  amount=1540),
    ]
    db.add_all(ledger); db.flush()

    # Invoices
    invoices = [
        Invoice(id="INV-001", vendor="Amul Dairy",      store="DS-North", category="Inventory", amount=48000, issued="Apr 10, 2026", due="Apr 20, 2026", status="pending"),
        Invoice(id="INV-002", vendor="Britannia Foods", store="DS-South", category="Inventory", amount=32000, issued="Apr 8, 2026",  due="Apr 18, 2026", status="paid"),
        Invoice(id="INV-003", vendor="Cold Chain Co.",  store="DS-East",  category="Logistics", amount=12500, issued="Apr 5, 2026",  due="Apr 15, 2026", status="overdue"),
        Invoice(id="INV-004", vendor="Packaging Plus",  store="DS-West",  category="Operations",amount=8400,  issued="Apr 12, 2026", due="Apr 22, 2026", status="pending"),
    ]
    db.add_all(invoices)
    db.commit()
    print("✅ Database seeded successfully.")
    db.close()

if __name__ == "__main__":
    seed()
