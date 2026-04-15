# Implementation Plan: Autonomous Quick-Commerce & Logistics Infrastructure (AQCLI)

## Overview

Sequential implementation of the 14-subsystem AQCLI platform in Python (FastAPI) with a React/TypeScript frontend. Each phase builds on the previous: infrastructure first, then auth, then data models, then subsystems in dependency order, then frontend, then testing and hardening.

## Tasks

- [ ] 1. Project scaffolding and infrastructure setup
  - [ ] 1.1 Initialise monorepo directory structure
    - Create top-level directories: `services/`, `frontend/`, `shared/`, `infra/`, `tests/`
    - Create per-service directories under `services/` for each of the 14 subsystems plus `auth_service`
    - Add root `pyproject.toml` (or `requirements.txt`) with shared dev dependencies: FastAPI, uvicorn, kafka-python, psycopg2-binary, redis, sqlalchemy, alembic, hypothesis, pytest, locust
    - _Requirements: 1, 10, 11_

  - [ ] 1.2 Write Docker Compose for local development
    - Define services: `postgres` (PostgreSQL 16 + PostGIS + TimescaleDB), `redis` (Redis 7), `kafka` + `zookeeper`, `minio` (S3-compatible)
    - Add health checks and named volumes for each stateful service
    - Expose standard ports; add `.env.example` with all required environment variables
    - _Requirements: 10, 11_

  - [ ] 1.3 Create shared FastAPI application factory and middleware skeleton
    - Implement `shared/app_factory.py`: creates a FastAPI app, registers CORS, registers OpenTelemetry middleware, registers error handler that returns the standard error envelope (`code`, `message`, `fields`, `request_id`, `timestamp`)
    - Implement `shared/kafka_client.py`: thin wrapper around `kafka-python` producer/consumer with exponential-backoff retry (attempts 1–5 at 0 s, 1 s, 4 s, 16 s, 64 s) and DLQ routing after attempt 5
    - Implement `shared/redis_client.py`: connection pool wrapper
    - _Requirements: 10.1, 10.2, 10.3_

  - [ ] 1.4 Create Alembic migration environment
    - Initialise Alembic under `infra/migrations/`
    - Configure `env.py` to read `DATABASE_URL` from environment
    - Add initial empty migration as baseline
    - _Requirements: 2, 18_

  - [ ] 1.5 Scaffold each service as a minimal FastAPI app
    - For each of the 15 services (auth + 14 subsystems): create `services/<name>/main.py` with `app = create_app()`, a `/health` GET endpoint returning `{"status": "ok"}`, and a `Dockerfile`
    - Add each service to Docker Compose
    - _Requirements: 10.4_


- [ ] 2. Auth_Service — signup, login, JWT, RBAC middleware
  - [ ] 2.1 Implement database models for auth tables
    - Write SQLAlchemy ORM models for: `tenants`, `users`, `company_profiles`, `delivery_department_profiles`, `delivery_man_profiles`, `finance_profiles`, `audit_log`
    - Write Alembic migration creating all auth tables with correct constraints, FK relationships, and `audit_log` monthly range partition
    - _Requirements: 31.3, 31.6, 35.1_

  - [ ] 2.2 Implement four role-specific signup endpoints
    - Implement `POST /auth/signup/company`, `/auth/signup/delivery-staff`, `/auth/signup/courier`, `/auth/signup/finance-staff`
    - Each endpoint: validates required fields for that role, hashes password with bcrypt cost 12, creates `users` + role profile records in a single DB transaction, rejects duplicate email with `DUPLICATE_EMAIL` 409
    - Return confirmation response; trigger email verification event if enabled
    - _Requirements: 31.1, 31.2, 31.3, 31.4, 31.5, 31.6, 31.7, 35.1, 35.4_

  - [ ]* 2.3 Write property test for signup atomicity and bcrypt storage
    - **Property 77: Signup creates both user and profile records atomically**
    - **Property 78: Duplicate email is rejected before record creation**
    - **Property 79: Passwords are stored as bcrypt hashes**
    - **Validates: Requirements 31.3, 31.4, 31.5, 35.1**

  - [ ] 2.4 Implement unified login endpoint and JWT issuance
    - Implement `POST /auth/login`: verify bcrypt hash, issue signed JWT (HS256 default, RS256 configurable) containing `user_id`, `role`, `tenant_id`, `exp` (default 24 h)
    - Return generic `AUTHENTICATION_FAILED` 401 on bad credentials (no field disclosure)
    - Implement Redis-backed rate limiter: block IP after 10 failed attempts in 15-minute window, emit alert to Ops_Dashboard
    - _Requirements: 32.1, 32.2, 32.3, 35.2, 35.3, 35.5_

  - [ ]* 2.5 Write property tests for login and JWT
    - **Property 80: JWT contains required claims**
    - **Property 81: Invalid credentials produce generic error**
    - **Property 84: Login rate limiting blocks after threshold**
    - **Validates: Requirements 32.2, 32.3, 35.5**

  - [ ] 2.6 Implement RBAC middleware as shared package
    - Implement `shared/rbac_middleware.py`: FastAPI dependency that validates JWT signature + expiry (returns 401 if invalid/expired), extracts `role` claim, checks role against per-endpoint permission matrix (from design RBAC table), returns 403 + audit log entry on violation
    - Register middleware in `shared/app_factory.py` so all services import and apply it
    - _Requirements: 33.1, 33.2, 33.3, 33.4, 33.5, 33.6, 33.7_

  - [ ]* 2.7 Write property test for RBAC enforcement
    - **Property 25: Unauthenticated requests are rejected**
    - **Property 82: RBAC middleware enforces role-endpoint permissions**
    - **Validates: Requirements 11.2, 32.5, 33.1–33.6**

  - [ ] 2.8 Implement optional auth enhancements
    - Implement `POST /auth/forgot-password` and `POST /auth/reset-password`: single-use 1-hour token, reject used/expired tokens
    - Implement `GET /auth/verify-email`: activate account on valid 24-hour token
    - Gate both flows behind Config_Engine feature flag; return 404 when disabled
    - Implement audit logging for every login attempt, token issuance, and access violation
    - _Requirements: 35.6, 35.7, 36.1, 36.2, 36.4, 36.5_

  - [ ]* 2.9 Write property tests for auth edge cases
    - **Property 85: Auth events are fully audited**
    - **Property 86: Used or expired password reset tokens are rejected**
    - **Property 87: Disabled features return 404**
    - **Validates: Requirements 35.7, 36.2, 36.5**

  - [ ] 2.10 Checkpoint — auth service
    - Ensure all auth tests pass, signup and login endpoints respond correctly, RBAC middleware rejects forbidden requests. Ask the user if questions arise.


- [ ] 3. Core data models and database migrations
  - [ ] 3.1 Write ORM models and migrations for tenant and dark store tables
    - SQLAlchemy models: `tenants`, `dark_stores` (with PostGIS `GEOGRAPHY` column and `geohash6`)
    - Alembic migration; add PostGIS extension creation
    - _Requirements: 11, 5.1, 25.3_

  - [ ] 3.2 Write ORM models and migrations for order and inventory tables
    - SQLAlchemy models: `orders`, `order_lines`, `skus` (with `regulated_flag`, `temperature_profile`, `shelf_life_hours`), `inventory`, `sku_substitution_map`
    - Alembic migration with all CHECK constraints and UNIQUE constraints
    - _Requirements: 1, 2, 12.5, 20.1, 28.3_

  - [ ] 3.3 Write ORM models and migrations for financial ledger tables
    - SQLAlchemy models: `ledger_entries` (immutable — no UPDATE/DELETE), `order_economics` (with generated `net_contribution_margin` and `is_margin_negative` columns)
    - Alembic migration; add DB-level trigger or application-layer guard preventing UPDATE/DELETE on `ledger_entries`
    - _Requirements: 18.1, 18.6, 18.7, 29.1_

  - [ ] 3.4 Write ORM models and migrations for supplier and replenishment tables
    - SQLAlchemy models: `suppliers`, `replenishment_events`
    - Alembic migration
    - _Requirements: 17.1, 4_

  - [ ] 3.5 Write ORM models and migrations for courier and slot tables
    - SQLAlchemy models: `courier_time_ledger`, `delivery_slots`, `courier_performance`
    - Alembic migration
    - _Requirements: 6, 23, 30_

  - [ ] 3.6 Write TimescaleDB hypertable migrations for cold chain and forecast tables
    - SQLAlchemy models: `temperature_readings`, `cold_chain_breaches`, `demand_forecasts`, `config_versions`
    - Alembic migration calling `create_hypertable` for `temperature_readings` and `demand_forecasts`
    - _Requirements: 15.4, 3.1, 22.4_

  - [ ] 3.7 Apply row-level security policies for tenant isolation
    - Write SQL migration adding PostgreSQL RLS policies on all tenant-scoped tables: `orders`, `order_lines`, `inventory`, `ledger_entries`, `order_economics`, `suppliers`, `replenishment_events`, `delivery_slots`, `config_versions`
    - Policy: `tenant_id = current_setting('app.tenant_id')::uuid`
    - _Requirements: 11.1_

  - [ ]* 3.8 Write property test for tenant data isolation
    - **Property 24: Tenant data isolation**
    - **Property 27: Tenant identity present in every audit entry**
    - **Validates: Requirements 11.1, 11.5**


- [ ] 4. Order_Orchestrator — ingestion, validation, routing, SLA monitoring
  - [ ] 4.1 Implement order ingestion and schema validation
    - Implement `POST /orders`: validate payload against Pydantic schema within 100 ms, reject with `VALIDATION_FAILED` 400 on failure, check 24-hour idempotency window (Redis key), reject duplicate with `DUPLICATE_ORDER` 409
    - On valid order: persist to `orders` table, emit `order.accepted` Kafka event within 200 ms
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 4.2 Write property tests for order validation and idempotency
    - **Property 1: Order validation is total and deterministic**
    - **Property 2: Order idempotency**
    - **Property 3: Order acceptance triggers event emission**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

  - [ ] 4.3 Implement dark store routing logic
    - Implement routing function: query eligible dark stores (stock available, picker capacity), call Google Maps Distance Matrix API for real-time travel time, select store with minimum travel time, log all candidates + rationale to `audit_log`
    - Handle split-order case: assign minimum number of stores to cover all SKUs
    - Enforce age-restricted SKU validation (verified DOB check) and jurisdiction restriction check before routing
    - _Requirements: 5.1, 5.2, 5.5, 20.2, 20.3, 20.6, 27.3_

  - [ ]* 4.4 Write property tests for routing correctness
    - **Property 10: Dark store routing satisfies constraints**
    - **Property 11: Order split uses minimum stores**
    - **Property 13: Routing decisions are audited**
    - **Property 50: Age-restricted orders require verified DOB**
    - **Property 51: Jurisdiction restrictions prevent order acceptance**
    - **Validates: Requirements 5.1, 5.2, 5.5, 20.2, 20.3, 20.6, 27.3**

  - [ ] 4.5 Implement SKU reservation and re-routing on store failure
    - After routing: call Inventory_Manager `POST /inventory/reserve`; on success emit `order.routed`
    - Implement re-routing watchdog: if assigned store becomes unavailable before pick completion, re-route within 60 s and emit updated `order.routed`
    - _Requirements: 5.3, 5.4_

  - [ ]* 4.6 Write property test for reservation concurrency
    - **Property 12: SKU reservation prevents double-allocation**
    - **Validates: Requirements 5.3**

  - [ ] 4.7 Implement SLA monitoring and breach prevention
    - Implement background task that continuously evaluates projected completion time for every active order
    - At 80% of SLA window: trigger escalation (re-route / courier reassignment / operator alert), log to `audit_log`
    - On breach: record breach event with root-cause tier (Tier 1/2/3) in `audit_log`; if on-time rate drops below 95% in rolling 1-hour window emit `network-health-degraded` alert
    - Implement `GET /orders/active`, `GET /orders/{order_id}`, `GET /orders/{order_id}/audit`, `PATCH /orders/{order_id}/override`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 21.5_

  - [ ]* 4.8 Write property tests for SLA and manual override
    - **Property 20: SLA escalation at 80% threshold**
    - **Property 21: SLA breach is classified and logged**
    - **Property 52: Manual override is applied and audited**
    - **Property 53: MANUAL mode suspends automated progression**
    - **Validates: Requirements 8.2, 8.3, 8.6, 21.5, 21.7**

  - [ ] 4.9 Implement replenishment PO creation and supplier escalation
    - Consume `replenishment.event` from Kafka; query Supplier_Registry for highest-ranked available supplier; create PO record; if no acknowledgement within 15 min escalate to next supplier
    - Implement B2B Direct Fulfilment: on `order.confirmed` for B2B SKUs, place JIT PO with designated supplier
    - _Requirements: 4.2, 4.4, 4.5, 17.2, 28.4_

  - [ ]* 4.10 Write property tests for replenishment and B2B fulfilment
    - **Property 9: Supplier escalation on timeout**
    - **Property 41: Highest-scored supplier is selected for replenishment**
    - **Property 67: B2B Direct Fulfilment places JIT purchase order**
    - **Validates: Requirements 4.2, 4.4, 4.5, 17.2, 28.4**

  - [ ] 4.11 Implement partial fulfilment and substitution orchestration
    - Consume `inventory.out-of-stock` events mid-pick; evaluate substitution map (price delta ≤ ±15%); auto-approve if eligible and emit customer notification; else offer partial fulfilment
    - Respect customer "no substitutions" preference flag
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [ ]* 4.12 Write property tests for substitution and partial fulfilment
    - **Property 28: Substitute auto-approval within price delta**
    - **Property 29: No-substitution preference is respected**
    - **Validates: Requirements 12.1, 12.2, 12.4**

  - [ ] 4.13 Checkpoint — Order_Orchestrator
    - Ensure all order ingestion, routing, SLA, and replenishment tests pass. Ask the user if questions arise.


- [ ] 5. Inventory_Manager — stock tracking, reservations, substitution map
  - [ ] 5.1 Implement real-time stock tracking endpoints
    - Implement `GET /inventory/{store_id}/{sku_id}`, `GET /inventory/{store_id}/out-of-stock`, `GET /inventory/{store_id}/perishable-waste`
    - Implement `POST /inventory/reserve`: atomic decrement of `available_qty` + increment of `reserved_qty`; reject with `STOCK_INTEGRITY_VIOLATION` 409 if decrement would go negative
    - Implement `POST /inventory/release`: reverse reservation on cancellation
    - _Requirements: 2.1, 2.2, 2.3, 2.6_

  - [ ]* 5.2 Write property tests for stock arithmetic
    - **Property 4: Inventory stock arithmetic invariant**
    - **Property 5: Out-of-stock flag consistency**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.5, 2.6**

  - [ ] 5.3 Implement expiry management and replenishment trigger
    - Implement scheduled job: scan `inventory` for SKUs past `shelf_life_hours`; remove expired units, emit `inventory.expiry` event
    - Implement replenishment threshold check (consume `forecast.updated`): if `available_qty` < 2-hour projected demand emit `replenishment.event` with 30-minute deduplication window (Redis key)
    - _Requirements: 2.4, 4.1, 4.3_

  - [ ]* 5.4 Write property tests for replenishment trigger and deduplication
    - **Property 7: Replenishment threshold trigger**
    - **Property 8: Replenishment deduplication**
    - **Validates: Requirements 4.1, 4.3**

  - [ ] 5.5 Implement substitution map and perishable confidence suppression
    - Implement `PUT /inventory/substitution-map`: upsert `sku_substitution_map` records per tenant
    - Consume `forecast.updated`: if `perishable_confidence_score` < 70 for a perishable SKU, suppress auto-replenishment and raise manual review advisory
    - Consume `cold-chain.breach`: mark affected SKU units non-sellable, emit `replenishment.event` for quarantined quantity
    - _Requirements: 12.5, 15.3, 28.1, 28.2_

  - [ ]* 5.6 Write property test for perishable confidence suppression
    - **Property 66: Perishable confidence score suppresses auto-replenishment**
    - **Property 37: Cold chain breach triggers quarantine**
    - **Validates: Requirements 15.2, 15.3, 28.1, 28.2**


- [ ] 6. Demand_Forecaster — forecast cycles, external signals, confidence scores
  - [ ] 6.1 Implement 15-minute forecast cycle and TimescaleDB persistence
    - Implement APScheduler job running every 15 minutes: compute per-SKU per-store forecast, write rows to `demand_forecasts` hypertable with `forecast_qty`, `lower_bound`, `upper_bound`, `confidence_score`, `signal_breakdown`
    - Emit `forecast.updated` Kafka event within 60 s of cycle completion
    - _Requirements: 3.1, 3.2, 26.2_

  - [ ]* 6.2 Write property test for forecast output completeness
    - **Property 61: Demand forecast includes confidence bounds**
    - **Validates: Requirements 26.2**

  - [ ] 6.2 Implement external signal ingestion
    - Integrate weather API client (real-time conditions + 48-hour forecast), event calendar API client, and geohash demand density aggregation from historical order data
    - Include signals in `signal_breakdown` JSONB column; expose via `GET /forecast/{store_id}/{sku_id}/signals`
    - _Requirements: 3.3, 26.1_

  - [ ] 6.3 Implement demand deviation recalculation trigger
    - After each cycle: compare actual demand vs forecast for the past hour; if deviation > 30% emit `forecast.recalculation-triggered` and run unscheduled recalculation for affected SKUs
    - _Requirements: 3.4_

  - [ ]* 6.4 Write property test for deviation-triggered recalculation
    - **Property 6: Demand deviation triggers recalculation**
    - **Validates: Requirements 3.4**

  - [ ] 6.5 Implement confidence-based stocking rules and perishable waste feedback
    - If `confidence_score` < 60: cap recommended stock at 110% of 7-day average daily demand
    - Compute `perishable_confidence_score` for SKUs with `shelf_life_hours` ≤ 48
    - If perishable waste > 10% of units received in rolling 7-day window: reduce recommended stock by 15%, raise auto-replenishment threshold to 80
    - Expose `GET /forecast/{store_id}/{sku_id}`, `GET /forecast/{store_id}`, `GET /forecast/underserved-zones`
    - _Requirements: 26.4, 26.5, 26.6, 26.7, 28.1, 28.6_

  - [ ]* 6.6 Write property tests for confidence-based stocking and waste feedback
    - **Property 62: Conservative stocking when confidence is low**
    - **Property 68: Perishable waste triggers stock reduction**
    - **Validates: Requirements 26.5, 28.6**

  - [ ] 6.7 Implement geohash underserved zone detection
    - Aggregate demand signals at geohash-6 level; identify zones where SLA breach rate or rejection rate > 10% in rolling 7-day window; emit `capacity-gap.detected` event
    - _Requirements: 25.1, 25.2_


- [ ] 7. Route_Optimizer — Google Maps integration, batch formation, courier performance
  - [ ] 7.1 Implement Google Maps integration and map refresh
    - Implement `maps_client.py`: wrap Routes API, Distance Matrix API, Traffic API with rate limiting and quota tracking
    - Implement 30-second map refresh scheduler: detect travel time changes > 90 s on active route segments, trigger immediate recomputation
    - Cache most recent map graph snapshot in Redis; use cached data during API outage up to 5 min; emit degraded-mode alert after 5 min
    - _Requirements: 27.1, 27.2, 27.6, 27.7_

  - [ ]* 7.2 Write property tests for map refresh and cache fallback
    - **Property 63: Route recomputation triggered on significant travel time change**
    - **Property 65: Cached map graph used during API outage**
    - **Validates: Requirements 27.2, 27.6**

  - [ ] 7.3 Implement batch formation and route computation
    - Implement `POST /routes/compute`: group orders within 500 m radius and 3-minute pick-time window into batches; compute optimised delivery sequence for all addresses in batch within 2 s; ensure every batch address appears exactly once in route
    - Cap batch size at courier's `batch_size_limit` (default 3)
    - _Requirements: 7.1, 7.3, 30.6_

  - [ ]* 7.4 Write property tests for batch and route correctness
    - **Property 17: Computed route covers all batch addresses**
    - **Property 18: Batch formation respects proximity constraints**
    - **Property 75: Concurrent order cap per courier**
    - **Validates: Requirements 7.1, 7.3, 30.6**

  - [ ] 7.5 Implement route recomputation on traffic delay and undeliverable orders
    - Consume `delivery.undeliverable`: remove order from active route, recompute remaining sequence within 10 s
    - On traffic delay > 2 min detected during map refresh: recompute affected courier route within 30 s
    - _Requirements: 7.2, 7.5_

  - [ ]* 7.6 Write property test for undeliverable order removal
    - **Property 19: Undeliverable order is absent from recomputed route**
    - **Validates: Requirements 7.5**

  - [ ] 7.7 Implement courier performance profiles and batch assignment preference
    - Implement `GET /couriers/{courier_id}/performance`, `GET /routes/congestion/{zone_id}`, `GET /routes/{courier_id}/active`
    - Track `on_time_rate_7d`, `avg_delivery_vs_eta`, `customer_rating_avg`, `undeliverable_rate`, `no_show_rate_7d` in `courier_performance` table
    - Prefer higher-scored couriers for orders near SLA deadline; reduce `batch_size_limit` by 1 when on-time rate < 80%, restore when > 90%
    - Emit `courier.suspended` when no-show rate > 10% in 7-day window
    - _Requirements: 23.1, 23.2, 23.3, 23.4_

  - [ ]* 7.8 Write property tests for courier performance enforcement
    - **Property 56: Courier batch size reduced on poor on-time rate**
    - **Property 57: Courier suspended on excessive no-show rate**
    - **Validates: Requirements 23.2, 23.3**

  - [ ] 7.9 Implement congestion index and margin-aware batching
    - Maintain live congestion index per zone (updated each map refresh); expose via `GET /routes/congestion/{zone_id}`; push to Slot_Scheduler via `congestion.index-updated` event
    - Prefer batching orders in same zone when per-order delivery cost falls below single-order threshold
    - _Requirements: 27.4, 29.5_

  - [ ]* 7.10 Write property test for margin-aware batching
    - **Property 71: Batching preferred when it reduces per-order delivery cost**
    - **Validates: Requirements 29.5**


- [ ] 8. Slot_Scheduler — slot assignment, gig worker time limits, surge handling
  - [ ] 8.1 Implement slot assignment and locking
    - Implement `POST /slots/assign`: assign delivery slot within SLA window based on courier availability and estimated pick time; use Redis distributed lock to prevent concurrent allocation conflicts
    - Implement `POST /slots/{slot_id}/lock`: set `is_locked = TRUE` on courier acceptance; prevent reallocation
    - Implement `GET /slots/{store_id}/availability`
    - _Requirements: 6.1, 6.2, 6.4_

  - [ ]* 8.2 Write property tests for slot assignment invariants
    - **Property 14: Assigned slot is within SLA window**
    - **Property 15: Locked slot cannot be reallocated**
    - **Validates: Requirements 6.1, 6.4**

  - [ ] 8.3 Implement slot rebalancing and surge mode extension
    - Implement 60-second rebalancing background task: redistribute slots across courier pool
    - In surge mode (order volume ≥ 150% of baseline): extend max slot window by up to 5 min
    - Consume `congestion.index-updated`: if zone travel time increased > 40% vs baseline, extend SLA window for new orders in that zone by up to 3 min
    - _Requirements: 6.3, 6.5, 27.5_

  - [ ]* 8.4 Write property tests for surge and congestion slot extension
    - **Property 16: Surge mode extends slot window by at most 5 minutes**
    - **Property 64: Congestion index drives slot extension**
    - **Validates: Requirements 6.5, 27.5**

  - [ ] 8.5 Implement gig worker time ledger and rest period enforcement
    - Implement `GET /couriers/{courier_id}/time-ledger`
    - Track active minutes in `courier_time_ledger`; suspend courier when daily limit (default 10 h) or weekly limit (default 48 h) reached
    - Enforce 30-minute mandatory rest after every 4 hours of continuous active time; block assignment offers until rest completed
    - Emit `courier-pool.expansion-needed` when order volume > 130% of baseline for 15 min
    - _Requirements: 30.1, 30.2, 30.3, 30.4, 30.5, 30.8_

  - [ ]* 8.6 Write property tests for gig worker time enforcement
    - **Property 72: Courier daily hour limit enforced**
    - **Property 73: Courier weekly hour limit enforced**
    - **Property 74: Mandatory rest period enforced**
    - **Validates: Requirements 30.2, 30.3, 30.4**

  - [ ] 8.7 Implement cold SKU bag temperature verification before assignment
    - Before confirming courier assignment for orders containing cold SKUs: query Cold_Chain_Monitor for courier bag sensor reading within last 10 min; reject assignment if reading absent or out of range
    - _Requirements: 15.5_

  - [ ]* 8.8 Write property test for cold delivery bag verification
    - **Property 38: Cold delivery requires valid bag temperature**
    - **Validates: Requirements 15.5**


- [ ] 9. Picker_Ops_Manager — pick lists, barcode scanning, bin discrepancy
  - [ ] 9.1 Implement pick task list generation
    - Consume `order.routed` event; generate pick task list within 500 ms sequenced to minimise picker travel distance using store zone layout (aisle/shelf/position bin coordinates)
    - Assign task to available picker based on workload, zone proximity, and cold-zone certification
    - Implement `GET /pick-tasks/{order_id}`
    - _Requirements: 16.1, 16.2, 16.7_

  - [ ]* 9.2 Write property test for pick list travel optimisation
    - **Property 39: Pick list minimises travel distance**
    - **Validates: Requirements 16.1**

  - [ ] 9.3 Implement barcode scan validation and pick progress tracking
    - Implement `POST /pick-tasks/{task_id}/scan`: validate scanned SKU matches pick task; reject with alert + `pick.mismatch` audit log entry on mismatch
    - Track real-time pick progress; emit `pick.delay` to Order_Orchestrator if estimated completion would miss SLA with < 5 min buffer
    - Emit `pick.started` and `pick.completed` events
    - _Requirements: 16.3, 16.4_

  - [ ]* 9.4 Write property test for barcode mismatch rejection
    - **Property 40: Barcode mismatch is rejected**
    - **Validates: Requirements 16.3**

  - [ ] 9.5 Implement bin discrepancy handling and picker metrics
    - Implement `POST /pick-tasks/{task_id}/bin-discrepancy`: emit `bin.discrepancy` event, trigger physical stock audit task, remove SKU from available stock pending audit
    - Implement `GET /pickers/{picker_id}/metrics`: picks per hour, mismatch rate, average pick time per SKU
    - _Requirements: 16.5, 16.6_

  - [ ] 9.6 Checkpoint — core subsystems (Inventory, Forecaster, Route, Slot, Picker)
    - Ensure all tests for subsystems 5–9 pass. Ask the user if questions arise.


- [ ] 10. Supplier_Registry — profiles, performance tracking, probation logic
  - [ ] 10.1 Implement supplier CRUD and profile endpoints
    - Implement `POST /suppliers` (onboard with probationary status, 30-day probation period, human review task), `GET /suppliers`, `GET /suppliers/{supplier_id}`, `PATCH /suppliers/{supplier_id}/status`
    - Enforce probationary period: ineligible for priority-one routing during first 30 days
    - _Requirements: 17.1, 17.6, 17.7_

  - [ ] 10.2 Implement supplier performance tracking and auto-demotion
    - Implement `GET /suppliers/{supplier_id}/performance`: on-time delivery rate, fill rate, avg lead time, rejection rate
    - Consume `replenishment.po-acknowledged`, `replenishment.completed`, `replenishment.failed` events to update metrics
    - Auto-demote supplier priority rank when on-time rate < 85% over rolling 30-day window; emit operator notification
    - Suspend supplier after 3 consecutive failed POs; route their SKU categories to secondary suppliers
    - _Requirements: 17.2, 17.3, 17.4, 17.5_

  - [ ]* 10.3 Write property tests for supplier demotion and suspension
    - **Property 42: Underperforming supplier is auto-demoted**
    - **Property 43: Supplier suspended after three consecutive failures**
    - **Validates: Requirements 17.3, 17.4**


- [ ] 11. Financial_Ledger — double-entry, unit economics, reconciliation
  - [ ] 11.1 Implement double-entry ledger event recording
    - Consume Kafka events: `order.confirmed`, `order.partial-fulfilled`, `refund.approved`, `inventory.expiry`, `cold-chain.breach`, `replenishment.po-created`, `delivery.completed`
    - For each event: write paired debit/credit `ledger_entries` rows; write/update `order_economics` row
    - Enforce immutability: application-layer guard prevents UPDATE/DELETE on `ledger_entries`
    - _Requirements: 18.1, 18.2, 18.7_

  - [ ]* 11.2 Write property tests for double-entry consistency and immutability
    - **Property 44: Financial event recorded for every order confirmation**
    - **Property 45: Double-entry consistency**
    - **Property 46: Ledger records are immutable**
    - **Validates: Requirements 18.1, 18.2, 18.6, 18.7**

  - [ ] 11.3 Implement unit economics computation and margin alerting
    - Compute `net_contribution_margin` at order confirmation; tag `is_margin_negative = TRUE` and emit `margin-alert` event when negative
    - Implement `GET /ledger/{store_id}/unit-economics`, `GET /ledger/orders/{order_id}`, `GET /ledger/{store_id}/daily`
    - _Requirements: 18.3, 29.1, 29.2_

  - [ ]* 11.4 Write property tests for margin computation and alerting
    - **Property 69: Net_Contribution_Margin computed at confirmation**
    - **Property 70: Margin-negative orders are tagged and alerted**
    - **Validates: Requirements 29.1, 29.2**

  - [ ] 11.5 Implement reconciliation, SLA credits, and courier earnings
    - Implement `GET /ledger/reconciliation`: daily per-tenant report (GMV, refunds, net revenue, outstanding payment failures)
    - Implement SLA credit computation for Tier 1 and Tier 2 breaches; emit `sla-credit.computed`
    - Compute per-courier earnings per shift window; emit `below-minimum-earnings.alert` when effective hourly rate < configured minimum
    - Implement `GET /ledger/couriers/{courier_id}/earnings`
    - Handle COD payment failure: emit `payment-failure.escalated`, mark order financially unresolved, escalate within 15 min
    - _Requirements: 8.7, 18.4, 18.5, 29.6, 30.7_

  - [ ]* 11.6 Write property tests for SLA credits and earnings alerts
    - **Property 30: Partial fulfillment triggers proportional refund**
    - **Property 76: Below-minimum earnings alert is emitted**
    - **Validates: Requirements 12.6, 30.7**

  - [ ] 11.7 Implement pricing rule financial recording
    - On orders with active promotional rules: record both pre-promotion and post-promotion price on each affected `order_lines` row
    - Enforce MRP ceiling: reject any pricing rule application that would set an order line above SKU MRP
    - _Requirements: 19.6, 29.7_

  - [ ]* 11.8 Write property test for MRP ceiling enforcement
    - **Property 47: Surge pricing respects MRP ceiling**
    - **Validates: Requirements 19.3, 29.7**


- [ ] 12. Returns_Manager — return classification, auto-approval, quality incidents
  - [ ] 12.1 Implement return request intake and classification
    - Implement `POST /returns`: accept requests up to 24 h after delivery confirmation timestamp; classify reason into one of five categories within 30 s
    - Implement `GET /returns/{return_id}`, `GET /returns/orders/{order_id}`
    - Log every return event to `audit_log` with customer ID, order ID, SKU, reason, resolution
    - _Requirements: 13.1, 13.2, 13.7_

  - [ ]* 12.2 Write property test for return acceptance window
    - **Property 31: Return requests within 24 hours are accepted**
    - **Validates: Requirements 13.1, 13.2**

  - [ ] 12.3 Implement auto-approval and quality incident triggering
    - Auto-approve refund (no physical retrieval) for: wrong item, damaged item, quality issue, quantity short; emit `refund.approved` to Financial_Ledger
    - Evaluate change-of-mind returns against tenant return policy config
    - Emit `quality-incident.raised` to Inventory_Manager when ≥ 3 quality-issue returns against same SKU batch within 2-hour window
    - _Requirements: 13.3, 13.4, 13.6_

  - [ ]* 12.4 Write property tests for auto-approval and quality incidents
    - **Property 32: Non-change-of-mind returns are auto-approved**
    - **Property 33: Quality incident triggered on batch threshold**
    - **Validates: Requirements 13.3, 13.6**


- [ ] 13. Fraud_Engine — scoring rules, holds, soft blocks, feedback API
  - [ ] 13.1 Implement fraud scoring and order hold/rejection
    - Implement `POST /fraud/evaluate` (sync, < 200 ms): compute fraud score from current active rule set (order velocity, address clustering, payment method velocity, order value outliers)
    - High-risk score: place order in manual review hold, notify operator within 30 s
    - Critical score: auto-reject, emit `fraud.rejection` to audit log, soft-block originating account
    - Implement `GET /fraud/rules`
    - _Requirements: 14.1, 14.2, 14.3_

  - [ ]* 13.2 Write property tests for fraud scoring and enforcement
    - **Property 34: Fraud score is computed for every order**
    - **Property 35: High-risk orders are held, critical orders are rejected**
    - **Validates: Requirements 14.1, 14.2, 14.3**

  - [ ] 13.3 Implement address flagging and feedback API
    - Track cancelled/returned orders per delivery address; flag address for elevated scrutiny after ≥ 5 in 7-day window
    - Implement `POST /fraud/feedback`: accept confirmed-fraud / false-positive operator feedback for model calibration
    - Consume `config.rule-updated` from Config_Engine; apply new rule set within 60 s without restart
    - Ensure no raw payment instrument data is persisted (tokenised representations only)
    - _Requirements: 14.4, 14.5, 14.6, 14.7_

  - [ ]* 13.4 Write property test for address flagging
    - **Property 36: Address flagging after repeated cancellations**
    - **Validates: Requirements 14.4**


- [ ] 14. Cold_Chain_Monitor — sensor ingestion, breach detection, quarantine
  - [ ] 14.1 Implement sensor reading ingestion and TimescaleDB persistence
    - Implement `POST /cold-chain/readings`: ingest temperature readings from store zone and courier bag sensors; write to `temperature_readings` hypertable
    - Implement `GET /cold-chain/{zone_id}/status`, `GET /cold-chain/couriers/{courier_id}/bag-status`, `GET /cold-chain/logs/{zone_id}` (paginated, 12-month retention)
    - _Requirements: 15.1, 15.4, 15.6_

  - [ ] 14.2 Implement breach detection and quarantine emission
    - Implement sliding-window check: if temperature exceeds safe range for SKU category for > 5 consecutive minutes, emit `cold-chain.breach` event and alert Ops_Dashboard
    - Emit `cold-chain.sensor-offline` when courier bag sensor fails to report for > 10 min during active cold delivery; flag delivery for priority resolution
    - _Requirements: 15.2, 15.7_

  - [ ]* 14.3 Write property test for breach detection and quarantine
    - **Property 37: Cold chain breach triggers quarantine**
    - **Validates: Requirements 15.2, 15.3**

- [ ] 15. Config_Engine — runtime config, pricing rules, versioned history, RBAC
  - [ ] 15.1 Implement config read/write API with schema validation
    - Implement `GET /config/{key}`, `PUT /config/{key}`: validate against schema and permissible value range; reject invalid changes with `CONFIG_INVALID` 400
    - Write new `config_versions` row on each accepted change; set previous version `is_current = FALSE`
    - Propagate change to all affected subsystems via `config.updated` Kafka event within 30 s; confirm propagation
    - _Requirements: 22.1, 22.2, 22.3_

  - [ ]* 15.2 Write property tests for config validation and RBAC
    - **Property 54: Invalid config changes are rejected**
    - **Property 55: Config RBAC enforcement**
    - **Validates: Requirements 22.2, 22.6**

  - [ ] 15.3 Implement versioned history, rollback, and degradation alert
    - Implement `GET /config/history` (90-day retention), `POST /config/rollback/{version_id}`
    - Monitor key metrics after config change; if SLA breach rate increases > 5 pp within 15 min, alert operator and offer one-click rollback
    - _Requirements: 22.4, 22.5_

  - [ ] 15.4 Implement pricing rules and promotion scheduling
    - Implement `GET /config/pricing-rules`, `PUT /config/pricing-rules`: support fixed price overrides, percentage discounts, surge multipliers at SKU/category/basket level
    - Auto-activate/deactivate promotions at scheduled timestamps; enforce MRP hard ceiling on all rules
    - Emit `config.pricing-rule-updated`; log every change to `audit_log` with rule content, operator identity, activation timestamp
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 29.7_

  - [ ]* 15.5 Write property tests for pricing rules
    - **Property 48: Promotion auto-activates and deactivates at scheduled times**
    - **Property 49: Pricing rule changes are audited**
    - **Validates: Requirements 19.4, 19.5**


- [ ] 16. Notification_Service — milestone events, deduplication, inbound classification
  - [ ] 16.1 Implement outbound notification delivery
    - Consume Kafka events: `order.accepted`, `pick.started`, `delivery.out-for-delivery`, `delivery.completed`, `order.sla-at-risk`, `refund.initiated`
    - Deliver notification via customer's preferred channel (push/SMS/email) within 60 s
    - Implement 5-minute deduplication window per (order_id, milestone) using Redis key
    - _Requirements: 24.1, 24.2, 24.3_

  - [ ]* 16.2 Write property tests for notification emission and deduplication
    - **Property 58: Notification emitted at every order milestone**
    - **Property 59: Duplicate notifications are suppressed**
    - **Validates: Requirements 24.1, 24.3**

  - [ ] 16.3 Implement inbound message classification and resolution
    - Implement `POST /notifications/inbound`: classify message intent (delivery query, quality complaint, cancellation request, other) for messages referencing active order IDs; route to automated resolution flow; close thread without human agent if resolved; log resolution to `audit_log`
    - _Requirements: 24.4, 24.5_

  - [ ]* 16.4 Write property test for inbound message classification
    - **Property 60: Inbound message intent is classified**
    - **Validates: Requirements 24.4**

  - [ ] 16.5 Implement tenant-configurable templates
    - Implement `GET /notifications/templates`, `PUT /notifications/templates/{template_id}`: support personalisation tokens (customer name, order ID, item list, ETA)
    - Implement `POST /notifications/send` (internal)
    - _Requirements: 24.6_

  - [ ] 16.6 Checkpoint — extended subsystems (Supplier, Ledger, Returns, Fraud, Cold Chain, Config, Notifications)
    - Ensure all tests for subsystems 10–16 pass. Ask the user if questions arise.


- [ ] 17. React Frontend — signup pages, login, role dashboards, protected routes
  - [ ] 17.1 Initialise React + TypeScript project and shared layout
    - Bootstrap with Vite + React 18 + TypeScript under `frontend/`
    - Install dependencies: react-router-dom, axios, vitest, @testing-library/react
    - Create shared `Layout` component, `ProtectedRoute` component (checks JWT in memory/httpOnly cookie; redirects to `/login` if absent or expired), and `AuthContext`
    - _Requirements: 34.4, 32.6_

  - [ ]* 17.2 Write frontend test for protected route redirect
    - **Property 83: Protected routes redirect unauthenticated users**
    - **Validates: Requirements 34.4**

  - [ ] 17.3 Implement Registration landing page (separate from Login)
    - Create `Registration` page component at route `/register` (unauthenticated only; redirect authenticated users to their dashboard)
    - Render four role cards — Company (Admin), Delivery Department Staff, Delivery Personnel, Financial Department Staff — each with a name and brief description
    - On role card click: navigate to the corresponding signup route (`/register/company`, `/register/delivery-staff`, `/register/courier`, `/register/finance`) without submitting any data
    - Display a "Already have an account? Log in" link pointing to `/login`
    - _Requirements: 37.1, 37.2, 37.3, 37.5, 37.7_

  - [ ] 17.4 Implement four role-specific signup page components
    - Create `SignupCompany`, `SignupDeliveryStaff`, `SignupCourier`, `SignupFinanceStaff` components, each rendering only the fields required for that role
    - Implement client-side validation (required fields, email format, password ≥ 8 chars) with inline error messages
    - Sanitize all user-supplied input before rendering; no raw HTML from API responses injected into DOM
    - _Requirements: 34.1, 34.5, 34.6_

  - [ ] 17.5 Implement shared Login page and role-based redirect
    - Create `Login` component: contains only email/password fields + submit button; NO signup fields, NO role selector, NO inline registration flow
    - Display a "Don't have an account? Register" link pointing to `/register`
    - On successful JWT receipt, decode role claim and redirect without additional API call: Company → `/admin`, Delivery Staff → `/delivery`, Courier → `/courier`, Finance → `/finance`
    - Clear stored token and redirect to `/login` on JWT expiry
    - Authenticated users who visit `/login` are redirected to their role dashboard
    - _Requirements: 32.4, 32.6, 34.2, 37.4, 37.7_

  - [ ] 17.6 Implement role-specific dashboards and navigation
    - Create four dashboard components: `AdminDashboard`, `DeliveryDashboard`, `CourierDashboard`, `FinanceDashboard`
    - Each renders only navigation items permitted for that role (per RBAC matrix)
    - Admin Dashboard includes analytics view: total registered users per role, login activity last 7 days, failed login attempts per day
    - _Requirements: 33.2, 33.3, 33.4, 33.5, 34.3, 36.3_

  - [ ]* 17.7 Write frontend tests for registration page, role navigation and XSS prevention
    - Test Registration landing page: render unauthenticated, assert four role cards visible; assert authenticated user is redirected to dashboard
    - Test role card navigation: click each role card, assert navigation to correct `/register/<role>` route
    - Test signup success redirect: mock successful signup API response, assert redirect to `/login` with success message
    - Test role-specific navigation: render nav with each role's JWT, assert only permitted menu items visible
    - Test XSS prevention: inject `<script>` tag via API response mock, assert it is not executed
    - _Requirements: 34.3, 34.6, 37.1, 37.3, 37.5, 37.6_

  - [ ] 17.8 Implement Ops_Dashboard real-time metrics view
    - Create `OpsDashboard` component: display active order count, orders-in-pick, orders-in-transit, SLA breach rate, per-store stock health (refreshed ≤ 10 s via polling or WebSocket)
    - Display degraded-mode banner when system is in DEGRADED mode
    - Display manual override controls (assign order to store, assign courier, approve/reject held order)
    - Display network health map view (per-store SLA performance, stock health, order volume)
    - Display rolling margin health view (% margin-negative orders, avg NCM, top 5 margin-loss SKUs)
    - _Requirements: 9.1, 9.5, 9.6, 21.3, 21.4, 25.5, 29.3_


- [ ] 18. Property-based tests — Hypothesis, all 87 properties
  - [ ] 18.1 Write Hypothesis tests for Properties 1–10 (order validation, inventory, forecasting, routing)
    - Implement `tests/property/test_order_orchestrator.py`: Properties 1, 2, 3, 9, 10, 11, 12, 13
    - Implement `tests/property/test_inventory_manager.py`: Properties 4, 5, 7, 8
    - Implement `tests/property/test_demand_forecaster.py`: Property 6
    - Each test annotated: `# Feature: quick-commerce-logistics-infrastructure, Property N: <text>`
    - Use `@settings(max_examples=100)`; stateful inventory tests use `RuleBasedStateMachine`
    - _Requirements: 1.1–1.4, 2.1–2.6, 3.4, 4.1, 4.3, 4.5, 5.1–5.5_

  - [ ] 18.2 Write Hypothesis tests for Properties 14–30 (slots, routes, SLA, substitution, returns)
    - Implement `tests/property/test_slot_scheduler.py`: Properties 14, 15, 16
    - Implement `tests/property/test_route_optimizer.py`: Properties 17, 18, 19
    - Implement `tests/property/test_sla.py`: Properties 20, 21
    - Implement `tests/property/test_event_durability.py`: Properties 22, 23
    - Implement `tests/property/test_tenant_isolation.py`: Properties 24, 25, 26, 27
    - Implement `tests/property/test_substitution.py`: Properties 28, 29, 30
    - _Requirements: 6, 7, 8, 10, 11, 12_

  - [ ] 18.3 Write Hypothesis tests for Properties 31–50 (returns, fraud, cold chain, picker, supplier, ledger, config, age/jurisdiction)
    - Implement `tests/property/test_returns_manager.py`: Properties 31, 32, 33
    - Implement `tests/property/test_fraud_engine.py`: Properties 34, 35, 36
    - Implement `tests/property/test_cold_chain.py`: Properties 37, 38
    - Implement `tests/property/test_picker_ops.py`: Properties 39, 40
    - Implement `tests/property/test_supplier_registry.py`: Properties 41, 42, 43
    - Implement `tests/property/test_financial_ledger.py`: Properties 44, 45, 46
    - Implement `tests/property/test_config_engine.py`: Properties 47, 48, 49
    - Implement `tests/property/test_compliance.py`: Properties 50, 51
    - _Requirements: 13, 14, 15, 16, 17, 18, 19, 20_

  - [ ] 18.4 Write Hypothesis tests for Properties 51–87 (override, config RBAC, courier, notifications, forecasting, maps, perishable, margin, gig worker, auth)
    - Implement `tests/property/test_operational_modes.py`: Properties 52, 53
    - Implement `tests/property/test_courier_performance.py`: Properties 56, 57, 71, 72, 73, 74, 75, 76
    - Implement `tests/property/test_notifications.py`: Properties 58, 59, 60
    - Implement `tests/property/test_forecaster_advanced.py`: Properties 61, 62, 63, 64, 65, 66, 67, 68
    - Implement `tests/property/test_margin.py`: Properties 69, 70
    - Implement `tests/property/test_auth_properties.py`: Properties 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87
    - _Requirements: 21, 22, 23, 24, 26, 27, 28, 29, 30, 31–36_

  - [ ] 18.5 Checkpoint — all 87 property tests pass
    - Run `pytest tests/property/ --tb=short`. Ensure all 87 property tests pass. Ask the user if questions arise.


- [ ] 19. Integration and load tests
  - [ ] 19.1 Write pytest integration test suite with Docker Compose environment
    - Create `tests/integration/conftest.py`: spin up Kafka, PostgreSQL, Redis, TimescaleDB via Docker Compose; run all migrations; seed baseline data
    - Write integration tests covering:
      - Order throughput: 10,000 orders/minute ingestion (Req 1.5)
      - Forecast publication latency: forecasts published within 60 s of cycle (Req 3.2)
      - Replenishment PO creation within 5 min (Req 4.2)
      - Dark store re-routing on store failure within 60 s (Req 5.4)
      - Slot rebalancing every 60 s (Req 6.3)
      - Route recomputation on traffic delay within 30 s (Req 7.2)
      - Config propagation within 30 s (Req 22.3)
      - Google Maps 30-second map refresh (Req 27.1)
      - Notification delivery within 60 s (Req 24.2)
      - Refund processing within 2 business days (Req 13.5)
    - _Requirements: 1.5, 3.2, 4.2, 5.4, 6.3, 7.2, 13.5, 22.3, 24.2, 27.1_

  - [ ] 19.2 Write pytest unit tests for specific example-based scenarios
    - `DUPLICATE_EMAIL` and `AGE_VERIFICATION_REQUIRED` error code responses
    - Role-specific dashboard redirect logic (Req 32.4)
    - Email verification flow (Req 36.1)
    - Admin analytics view data (Req 36.3)
    - Supplier PO acknowledgment state update (Req 4.4)
    - Slot capacity notification when all slots full (Req 6.2)
    - On-time delivery rate aggregate metric (Req 8.4, 8.5)
    - Real-time metrics refresh ≤ 10 s (Req 9.1)
    - Courier leaderboard (Req 23.5)
    - _Requirements: 4.4, 6.2, 8.4, 8.5, 9.1, 23.5, 31.5, 32.4, 36.1, 36.3_

  - [ ] 19.3 Write Locust load test scenarios
    - Create `tests/load/locustfile.py` with tasks:
      - Order ingestion: 10,000 orders/minute sustained for 5 min; assert p99 validation latency < 100 ms (Req 1.1, 1.5)
      - Route computation: assert p99 < 2 s per batch (Req 7.1)
      - Pick list generation: assert p99 < 500 ms (Req 16.1)
    - _Requirements: 1.1, 1.5, 7.1, 16.1_

  - [ ] 19.4 Write smoke tests for configuration and infrastructure checks
    - Verify four signup endpoints exist and return correct response shapes (Req 31.1)
    - Verify single login endpoint exists (Req 32.1)
    - Verify RBAC middleware registered on all protected routes (Req 33.7)
    - Verify JWT signing algorithm is HS256 or RS256 (Req 35.2)
    - Verify HTTPS enforcement (Req 35.6)
    - Verify audit log replication to two storage locations (Req 10.5)
    - Verify 90-day event data retention policy (Req 9.4)
    - Verify cold chain temperature profiles configured (Req 15.6)
    - Verify regulated product flags present in SKU schema (Req 20.1)
    - Verify four operational modes defined (Req 21.1)
    - Verify Config_Engine versioned history accessible (Req 22.4)
    - Verify supplier probationary period enforced (Req 17.6)
    - Verify B2B_Direct_Fulfilment mode flag present in SKU schema (Req 28.3)
    - Verify external signal sources configured in Demand_Forecaster (Req 26.1)
    - _Requirements: 9.4, 10.5, 15.6, 17.6, 20.1, 21.1, 22.4, 26.1, 28.3, 31.1, 32.1, 33.7, 35.2, 35.6_


- [ ] 20. Operational hardening — circuit breakers, graceful degradation, status page, Parquet export
  - [ ] 20.1 Implement circuit breakers on all inter-subsystem synchronous calls
    - Implement Redis-backed circuit breaker in `shared/circuit_breaker.py`: Closed → Open after 3 consecutive failures within 30 s; Open → Half-Open after 30 s cooldown; Half-Open → Closed on successful probe; return `CIRCUIT_OPEN` 503 degraded-mode response when open
    - Apply circuit breaker decorator to all synchronous inter-service HTTP calls across all 15 services
    - _Requirements: 10.6_

  - [ ]* 20.2 Write property test for circuit breaker state transitions
    - **Property 23: Circuit breaker opens after three consecutive failures**
    - **Validates: Requirements 10.6**

  - [ ] 20.3 Implement graceful degradation behaviours
    - Implement per-subsystem degradation handlers (as defined in design Graceful Degradation table):
      - Route_Optimizer failure: queue orders, alert operator, enable manual assignment
      - Demand_Forecaster failure: use last known forecast, apply conservative stocking
      - Fraud_Engine failure: proceed with default hold flag, require operator review
      - Slot_Scheduler failure: enable manual slot assignment via Ops_Dashboard
      - Cold_Chain_Monitor failure: hold cold SKU orders pending sensor recovery
      - Financial_Ledger failure: queue financial events in Kafka for replay
    - Implement DEGRADED mode transition: auto-check subsystem health every 60 s; transition back to NORMAL and drain queued orders when all subsystems healthy
    - _Requirements: 10.4, 21.1, 21.2, 21.3, 21.6_

  - [ ] 20.4 Implement public status page endpoint
    - Implement `GET /status`: return per-subsystem health state (healthy/degraded/offline) updated within 30 s of any health state change; consumable by tenant monitoring systems
    - _Requirements: 10.7_

  - [ ] 20.5 Implement Parquet export for raw event streams
    - Implement scheduled export job: write raw event streams from Kafka (or PostgreSQL event tables) to Parquet files in MinIO/S3-compatible storage
    - Implement `GET /ledger/reconciliation` export endpoint supporting Parquet format
    - _Requirements: 9.7_

  - [ ] 20.6 Implement per-tenant rate limiting and 90-day data retention
    - Apply per-tenant rate limits on order ingestion, API calls, and event emissions using Redis token bucket
    - Implement data retention policy: raw operational event data retained for minimum 90 days; cold chain temperature logs retained for minimum 12 months
    - _Requirements: 9.4, 11.3, 15.4_

  - [ ] 20.7 Implement courier excellence webhook and dark store commissioning workflow
    - Implement Config_Engine webhook emission when courier performance score crosses excellence threshold (Req 23.6)
    - Implement dark store onboarding workflow: provision inventory zones, picker layout, supplier assignments, tenant config without platform engineering intervention; initialise Demand_Forecaster model from nearest existing store (Req 25.3, 25.4)
    - _Requirements: 23.6, 25.3, 25.4_

  - [ ] 20.8 Final checkpoint — all tests pass, system hardened
    - Run full test suite: `pytest tests/ --tb=short`. Ensure all property, unit, integration, and smoke tests pass. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at phase boundaries
- Property tests validate all 87 universal correctness properties using Hypothesis (`@settings(max_examples=100)`)
- Unit tests validate specific examples, error codes, and edge cases using pytest + FastAPI TestClient
- Integration tests use a Docker Compose environment with real Kafka, PostgreSQL, Redis, and TimescaleDB
- Load tests use Locust for throughput and latency validation
- Frontend tests use Vitest + React Testing Library
