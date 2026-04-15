from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine
from app.models.models import Base
from app.routers import auth, users, orders, ledger, invoices, deliveries, couriers, stats
from app.seed import seed

Base.metadata.create_all(bind=engine)
seed()

app = FastAPI(title="AQCLI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(orders.router)
app.include_router(ledger.router)
app.include_router(invoices.router)
app.include_router(deliveries.router)
app.include_router(couriers.router)
app.include_router(stats.router)

@app.get("/health")
def health():
    return {"status": "ok"}
