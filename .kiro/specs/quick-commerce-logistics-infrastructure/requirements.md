# Requirements Document


## Introduction

This document defines requirements for an Autonomous Quick-Commerce & Logistics Infrastructure (AQCLI) system — the B2B operational backbone powering micro-fulfillment centers (dark stores) and sub-15-minute delivery networks. The system manages real-time inventory, autonomous order orchestration, dynamic slot/route optimization, demand forecasting, and operational analytics across a distributed network of dark stores. The goal is to sustain high-throughput, low-latency fulfillment operations profitably without human intervention in the critical path.

## Glossary

- **AQCLI**: Autonomous Quick-Commerce & Logistics Infrastructure — the overall system described in this document.
- **Dark_Store**: A micro-fulfillment center closed to the public, used exclusively for picking and dispatching online orders.
- **Order_Orchestrator**: The subsystem responsible for receiving, validating, routing, and tracking orders end-to-end.
- **Inventory_Manager**: The subsystem responsible for real-time stock tracking, replenishment triggers, and expiry management.
- **Demand_Forecaster**: The subsystem that predicts SKU-level demand using historical sales, time-of-day, weather, and event signals.
- **Route_Optimizer**: The subsystem that computes optimal last-mile delivery routes for couriers given real-time traffic and order batching constraints.
- **Slot_Scheduler**: The subsystem that manages delivery time-slot capacity across dark stores and courier pools.
- **Courier**: A human or autonomous delivery agent assigned to fulfill last-mile delivery of one or more orders.
- **SKU**: Stock Keeping Unit — a unique identifier for a distinct product variant held in inventory.
- **Replenishment_Event**: A system-generated trigger to restock one or more SKUs at a Dark_Store.
- **SLA**: Service Level Agreement — the committed delivery time window for an order (e.g., within 10 minutes of placement).
- **Ops_Dashboard**: The operational monitoring interface consumed by B2B operators and logistics managers.
- **Batch**: A group of orders assigned to a single Courier for concurrent delivery.
- **Dead_Letter_Queue**: A queue holding events that failed processing after maximum retry attempts.
- **Audit_Log**: An immutable, append-only record of all state-changing operations within AQCLI.
- **Financial_Ledger**: The subsystem responsible for recording all financial events, computing unit economics, and producing reconciliation reports.
- **Returns_Manager**: The subsystem that handles post-delivery return requests, classifies return reasons, and orchestrates refund approvals.
- **Fraud_Engine**: The subsystem that evaluates orders for fraud risk using configurable scoring rules and manages account-level abuse controls.
- **Cold_Chain_Monitor**: The subsystem that ingests temperature sensor data and enforces cold chain compliance for perishable SKUs.
- **Picker_Ops_Manager**: The subsystem that generates and assigns pick task lists, tracks picker productivity, and manages warehouse task flow.
- **Supplier_Registry**: The subsystem that maintains supplier profiles, tracks performance metrics, and manages supplier priority rankings.
- **Config_Engine**: The subsystem that manages runtime configuration parameters and business rules, propagating changes to all affected subsystems.
- **Notification_Service**: The subsystem responsible for delivering customer and operator notifications across multiple channels.
- **Confidence_Score**: A 0–100 numeric score produced by the Demand_Forecaster representing certainty in a demand prediction for a given SKU at a given Dark_Store.
- **Perishable_Confidence_Score**: A 0–100 numeric score representing the system's confidence that a perishable SKU (shelf life ≤48h) should be restocked, combining demand certainty, historical waste rate, and current stock levels.
- **B2B_Direct_Fulfilment**: A fulfilment mode in which exact order quantities for a SKU are sourced directly from a registered B2B supplier at order confirmation time, bypassing dark store pre-stocking.
- **Net_Contribution_Margin**: The per-order financial metric defined as basket value minus COGS, fulfillment cost, refund liability estimate, and platform overhead allocation.
- **Auth_Service**: The subsystem responsible for user registration, authentication, JWT issuance, and RBAC middleware enforcement across all platform roles.
- **JWT**: JSON Web Token — a signed, time-limited token issued at login carrying the user's id and role claim, used to authenticate all subsequent API requests.
- **RBAC**: Role-Based Access Control — the access model that restricts API and UI capabilities based on the authenticated user's assigned role.
- **Registration_Page**: The dedicated frontend landing page at `/register` where new users select their role before being routed to the appropriate role-specific signup form.

---

## Requirements

### Requirement 1: Order Ingestion and Validation

**User Story:** As a logistics operator, I want all incoming orders to be validated and acknowledged immediately, so that invalid or duplicate orders never enter the fulfillment pipeline.

#### Acceptance Criteria

1. WHEN an order is received by the Order_Orchestrator, THE Order_Orchestrator SHALL validate the order payload against the defined schema within 100ms.
2. WHEN an order payload fails schema validation, THE Order_Orchestrator SHALL reject the order and return a structured error response containing the field-level validation failures.
3. WHEN a duplicate order ID is received within a 24-hour window, THE Order_Orchestrator SHALL reject the duplicate and return an idempotency conflict response.
4. WHEN a valid order is accepted, THE Order_Orchestrator SHALL emit an order-accepted event to the fulfillment pipeline within 200ms of receipt.
5. THE Order_Orchestrator SHALL support ingestion of at least 10,000 orders per minute across the dark store network without degradation of validation latency.

---

### Requirement 2: Real-Time Inventory Tracking

**User Story:** As a dark store manager, I want inventory levels to reflect every pick, restock, and expiry event in real time, so that orders are never fulfilled against phantom stock.

#### Acceptance Criteria

1. WHEN a SKU is picked for an order, THE Inventory_Manager SHALL decrement the available stock count for that SKU at the relevant Dark_Store within 50ms of the pick event.
2. WHEN a Replenishment_Event is completed, THE Inventory_Manager SHALL increment the available stock count for the restocked SKUs within 50ms of the replenishment confirmation.
3. WHEN a SKU's available stock count reaches zero, THE Inventory_Manager SHALL mark the SKU as out-of-stock and emit an out-of-stock event.
4. WHEN a SKU's expiry date is reached, THE Inventory_Manager SHALL remove the expired units from available stock and emit an expiry event.
5. THE Inventory_Manager SHALL maintain stock count accuracy within ±1 unit compared to physical counts during any rolling 1-hour audit window.
6. IF a stock decrement would result in a negative stock count, THEN THE Inventory_Manager SHALL reject the decrement, emit a stock-integrity-violation event, and preserve the existing stock count.

---

### Requirement 3: Demand Forecasting

**User Story:** As a supply chain planner, I want SKU-level demand forecasts updated continuously, so that replenishment decisions are proactive rather than reactive.

#### Acceptance Criteria

1. THE Demand_Forecaster SHALL produce per-SKU, per-Dark_Store demand forecasts at 15-minute granularity for a rolling 48-hour horizon.
2. WHEN a forecast cycle completes, THE Demand_Forecaster SHALL publish updated forecasts to the Inventory_Manager within 60 seconds of cycle completion.
3. THE Demand_Forecaster SHALL incorporate at minimum the following signals: historical sales velocity, hour-of-day, day-of-week, local weather conditions, and scheduled promotional events.
4. WHEN actual demand deviates from the forecast by more than 30% over a 1-hour window, THE Demand_Forecaster SHALL trigger an unscheduled forecast recalculation for the affected SKUs.
5. THE Demand_Forecaster SHALL achieve a Mean Absolute Percentage Error (MAPE) of 20% or less on a rolling 7-day evaluation window per SKU.

---

### Requirement 4: Automated Replenishment Triggering

**User Story:** As an inventory planner, I want replenishment orders to be raised automatically when stock falls below threshold, so that dark stores never run dry during peak demand.

#### Acceptance Criteria

1. WHEN the Inventory_Manager determines that a SKU's available stock falls below the Demand_Forecaster's projected demand for the next 2 hours, THE Inventory_Manager SHALL emit a Replenishment_Event for that SKU.
2. WHEN a Replenishment_Event is emitted, THE Order_Orchestrator SHALL create a replenishment purchase order and route it to the designated supplier within 5 minutes.
3. THE Inventory_Manager SHALL suppress duplicate Replenishment_Events for the same SKU at the same Dark_Store within a 30-minute deduplication window.
4. WHEN a replenishment purchase order is acknowledged by the supplier, THE Order_Orchestrator SHALL record the expected delivery time and update the Inventory_Manager's inbound stock projection.
5. IF a supplier fails to acknowledge a replenishment purchase order within 15 minutes, THEN THE Order_Orchestrator SHALL escalate the order to the next available supplier in the priority list.

---

### Requirement 5: Order-to-Dark-Store Routing

**User Story:** As an operations engineer, I want each order automatically routed to the optimal dark store, so that delivery SLAs are met with the lowest possible fulfillment cost.

#### Acceptance Criteria

1. WHEN a valid order is accepted, THE Order_Orchestrator SHALL select the fulfilling Dark_Store based on stock availability, proximity to the delivery address, and current picker capacity within 300ms.
2. WHEN no single Dark_Store can fulfill all SKUs in an order, THE Order_Orchestrator SHALL split the order across the minimum number of Dark_Stores required to fulfill all SKUs.
3. WHEN an order is routed to a Dark_Store, THE Order_Orchestrator SHALL reserve the required SKU quantities in the Inventory_Manager to prevent concurrent allocation conflicts.
4. IF the selected Dark_Store becomes unavailable after routing but before pick completion, THEN THE Order_Orchestrator SHALL re-route the order to the next eligible Dark_Store within 60 seconds.
5. THE Order_Orchestrator SHALL log every routing decision, including the evaluated candidates and selection rationale, to the Audit_Log.

---

### Requirement 6: Delivery Slot Scheduling

**User Story:** As a courier fleet manager, I want delivery slots to be allocated based on real-time courier availability and route capacity, so that promised delivery windows are achievable.

#### Acceptance Criteria

1. WHEN an order is routed to a Dark_Store, THE Slot_Scheduler SHALL assign a delivery time slot within the order's SLA window based on current courier availability and estimated pick time.
2. WHEN all delivery slots within the SLA window are at capacity, THE Slot_Scheduler SHALL notify the Order_Orchestrator so that the operator can be alerted before the order is confirmed.
3. THE Slot_Scheduler SHALL rebalance slot allocations across the courier pool every 60 seconds to account for courier availability changes.
4. WHEN a Courier accepts a delivery assignment, THE Slot_Scheduler SHALL lock the assigned slot and prevent reallocation for that order.
5. WHILE a Dark_Store is operating in surge mode (order volume exceeds 150% of baseline), THE Slot_Scheduler SHALL extend the maximum slot window by up to 5 minutes to absorb excess demand.

---

### Requirement 7: Last-Mile Route Optimization

**User Story:** As a courier dispatcher, I want delivery routes computed and updated in real time, so that couriers take the fastest path and batching opportunities are not missed.

#### Acceptance Criteria

1. WHEN a Courier is assigned a Batch, THE Route_Optimizer SHALL compute an optimized delivery sequence for all orders in the Batch within 2 seconds.
2. WHEN real-time traffic data indicates a route delay exceeding 2 minutes, THE Route_Optimizer SHALL recompute the affected Courier's route and push the updated route within 30 seconds.
3. THE Route_Optimizer SHALL evaluate Batch formation by grouping orders within a 500-meter radius and a 3-minute pick-time window before assigning individual routes.
4. THE Route_Optimizer SHALL produce routes that result in average delivery times within 10% of the theoretical minimum travel time for the given traffic conditions.
5. WHEN a Courier marks an order as undeliverable, THE Route_Optimizer SHALL remove that order from the active route and recompute the remaining sequence within 10 seconds.

---

### Requirement 8: SLA Monitoring and Breach Prevention

**User Story:** As an operations manager, I want the system to detect impending SLA breaches and intervene automatically, so that the on-time delivery rate stays above the contracted threshold.

#### Acceptance Criteria

1. THE Order_Orchestrator SHALL continuously evaluate the projected completion time for every active order against its SLA deadline.
2. WHEN the projected completion time of an order exceeds 80% of its SLA window, THE Order_Orchestrator SHALL trigger an escalation action, which may include re-routing, courier reassignment, or operator alert.
3. WHEN an order breaches its SLA, THE Order_Orchestrator SHALL record the breach event in the Audit_Log with the root cause classification (pick delay, routing delay, courier delay, or system delay).
4. THE Order_Orchestrator SHALL maintain an on-time delivery rate of 95% or above across all orders in any rolling 24-hour window.
5. WHEN the on-time delivery rate drops below 95% in a rolling 1-hour window, THE Order_Orchestrator SHALL emit a network-health-degraded alert to the Ops_Dashboard.
6. THE Order_Orchestrator SHALL classify every SLA breach by a root-cause tier at resolution time. Tier 1 = system-induced (routing, software fault). Tier 2 = operational (picker delay, courier delay). Tier 3 = external (traffic, weather, supplier failure). Tier classification SHALL feed into the tenant's SLA credit calculation.
7. WHERE a tenant's contract includes SLA credit terms, THE Financial_Ledger SHALL automatically compute and record credit liabilities for Tier 1 and Tier 2 breaches without requiring manual claim submission.

---

### Requirement 9: Operational Analytics and Reporting

**User Story:** As a B2B operator, I want real-time and historical operational metrics available through the Ops_Dashboard, so that I can make data-driven decisions about staffing, inventory, and capacity.

#### Acceptance Criteria

1. THE Ops_Dashboard SHALL display the following real-time metrics refreshed at most every 10 seconds: active order count, orders-in-pick, orders-in-transit, SLA breach rate, and per-Dark_Store stock health.
2. THE Ops_Dashboard SHALL provide historical reports aggregated at hourly, daily, and weekly granularities for order volume, fulfillment cost, SLA performance, and inventory turnover.
3. WHEN a metric crosses a configurable alert threshold, THE Ops_Dashboard SHALL surface a visual alert and emit a webhook notification to the configured operator endpoint within 30 seconds.
4. THE AQCLI SHALL retain raw operational event data for a minimum of 90 days to support audit and retrospective analysis.
5. THE Ops_Dashboard SHALL expose all metrics via a REST API so that operators can integrate data into external BI tools.
6. THE Ops_Dashboard SHALL expose a unit economics view showing per-order P&L breakdown (basket value, COGS, delivery cost, refund liability, net margin), aggregated at daily and weekly granularity per Dark_Store and per tenant.
7. THE AQCLI SHALL support data export in Parquet format for all raw event streams, enabling tenants to load operational data into external data warehouses without transformation.

---

### Requirement 10: Fault Tolerance and Event Durability

**User Story:** As a platform engineer, I want all critical events to be durably queued and retried on failure, so that transient infrastructure faults do not cause order loss or data inconsistency.

#### Acceptance Criteria

1. THE AQCLI SHALL persist all inter-subsystem events to a durable message queue before processing, ensuring at-least-once delivery semantics.
2. WHEN an event processing attempt fails, THE AQCLI SHALL retry the event with exponential backoff for a maximum of 5 attempts before routing the event to the Dead_Letter_Queue.
3. WHEN an event is routed to the Dead_Letter_Queue, THE AQCLI SHALL emit an alert to the Ops_Dashboard containing the event type, failure reason, and retry history.
4. THE AQCLI SHALL achieve a Recovery Time Objective (RTO) of 60 seconds or less for any single-subsystem failure without data loss.
5. THE Audit_Log SHALL be append-only and replicated to at least two independent storage locations to prevent data loss.
6. THE AQCLI SHALL support circuit-breaker patterns on all inter-subsystem synchronous calls, opening the circuit after three consecutive failures within 30 seconds and falling back to a degraded-mode response.
7. THE AQCLI SHALL publish a public status page endpoint reporting per-subsystem health, updated within 30 seconds of any health state change, consumable by tenant monitoring systems.

---

### Requirement 11: Multi-Tenant Dark Store Isolation

**User Story:** As a platform operator, I want each tenant's dark store data and operations to be fully isolated, so that one tenant's activity cannot affect another's fulfillment or data visibility.

#### Acceptance Criteria

1. THE AQCLI SHALL enforce tenant-level data partitioning such that no query or event from one tenant can access or modify data belonging to another tenant.
2. WHEN a request is received, THE AQCLI SHALL authenticate the tenant identity and reject any request with an invalid or missing tenant credential before processing.
3. THE AQCLI SHALL apply per-tenant rate limits to order ingestion, API calls, and event emissions to prevent one tenant from exhausting shared infrastructure resources.
4. WHERE a tenant has configured a custom SLA threshold, THE Order_Orchestrator SHALL apply that tenant's SLA configuration in place of the platform default.
5. THE Audit_Log SHALL record the tenant identity on every state-changing operation to support per-tenant compliance reporting.

---

### Requirement 12: Partial Fulfillment and Substitution Management

**User Story:** As a customer, I want to receive a partial order or an accepted substitute when a SKU goes out of stock mid-pick, rather than having my entire order cancelled.

#### Acceptance Criteria

1. WHEN a SKU becomes unavailable after an order has been routed but before pick completion, THE Order_Orchestrator SHALL evaluate whether a pre-approved substitute SKU exists for that item.
2. WHEN a substitute SKU is available and its price delta is within ±15% of the original SKU price, THE Order_Orchestrator SHALL auto-approve the substitution and notify the customer within 60 seconds.
3. WHEN no acceptable substitute exists, THE Order_Orchestrator SHALL offer the customer a partial fulfillment of all available SKUs, with a proportional refund for the missing items, without cancelling the entire order.
4. WHEN a customer has pre-configured a "no substitutions" preference, THE Order_Orchestrator SHALL skip substitution evaluation and proceed directly to partial fulfillment notification.
5. THE Inventory_Manager SHALL maintain a SKU substitution map, configurable per tenant, that defines approved substitute SKUs ranked by preference.
6. WHEN partial fulfillment is dispatched, THE Financial_Ledger SHALL automatically initiate a refund for the unfulfilled portion within 5 minutes of dispatch confirmation.

---

### Requirement 13: Customer-Facing Returns and Refund Orchestration

**User Story:** As a customer, I want to initiate a return or report a quality issue immediately after delivery, and receive a refund without manual intervention from an agent.

#### Acceptance Criteria

1. THE Returns_Manager SHALL accept return requests up to 24 hours after the delivery confirmation timestamp.
2. WHEN a return request is received, THE Returns_Manager SHALL classify the return reason into one of the following categories within 30 seconds: wrong item, damaged item, quality issue, quantity short, or change of mind.
3. WHEN the return reason is wrong item, damaged item, quality issue, or quantity short, THE Returns_Manager SHALL auto-approve the refund without requiring physical item retrieval, and trigger a refund event to THE Financial_Ledger.
4. WHEN a return reason is classified as change of mind, THE Returns_Manager SHALL evaluate the tenant's return policy configuration and approve or reject accordingly.
5. THE Financial_Ledger SHALL process approved refunds to the original payment method within 2 business days and emit a refund-confirmed event to the customer notification channel.
6. THE Returns_Manager SHALL emit a quality-incident event to THE Inventory_Manager when three or more returns citing quality issues are raised against the same SKU batch within a 2-hour window, triggering a hold on that batch.
7. THE Returns_Manager SHALL record every return event in the Audit_Log with the customer ID, order ID, SKU, reason classification, and resolution outcome.

---

### Requirement 14: Fraud Detection and Abuse Prevention

**User Story:** As a platform operator, I want the system to automatically identify and suppress fraudulent orders and account abuse patterns, so that financial losses and inventory drain from bad actors are minimised.

#### Acceptance Criteria

1. THE Fraud_Engine SHALL evaluate every incoming order against a configurable rule set including: order velocity per account, delivery address clustering, payment method velocity, and order value outliers.
2. WHEN an order's fraud score exceeds the configured high-risk threshold, THE Fraud_Engine SHALL place the order in a manual review hold and notify the operator within 30 seconds, without rejecting the order outright.
3. WHEN an order's fraud score exceeds the configured critical threshold, THE Fraud_Engine SHALL auto-reject the order, emit a fraud-rejection event to the Audit_Log, and trigger a soft block on the originating account.
4. WHEN five or more orders from the same delivery address are cancelled or returned within a 7-day window, THE Fraud_Engine SHALL flag the address for elevated scrutiny on subsequent orders.
5. THE Fraud_Engine SHALL update its scoring rules without requiring system restart, consuming rule changes from THE Config_Engine within 60 seconds of publication.
6. THE Fraud_Engine SHALL expose a feedback API allowing operators to mark a reviewed order as confirmed fraud or false positive, which feeds back into model calibration.
7. THE Fraud_Engine SHALL NOT persist raw payment instrument data; it SHALL operate on tokenised representations only.

---

### Requirement 15: Cold Chain and Perishable Goods Compliance

**User Story:** As a compliance officer, I want temperature-sensitive SKUs to be monitored continuously from inbound receipt to last-mile handoff, so that no cold chain breach reaches the customer and regulatory obligations are met.

#### Acceptance Criteria

1. THE Cold_Chain_Monitor SHALL ingest temperature readings from dark store zone sensors and courier bag sensors at a minimum frequency of once every 2 minutes.
2. WHEN a temperature reading for a cold zone exceeds the configured safe range for that SKU category for more than 5 consecutive minutes, THE Cold_Chain_Monitor SHALL emit a cold-chain-breach event, quarantine the affected stock in THE Inventory_Manager, and alert the Ops_Dashboard.
3. WHEN a cold-chain-breach event is emitted, THE Inventory_Manager SHALL mark all affected SKU units as non-sellable and emit a Replenishment_Event for the quarantined quantity.
4. THE Cold_Chain_Monitor SHALL record a timestamped temperature log for every zone and courier bag, retained for a minimum of 12 months to support regulatory audit.
5. WHEN an order containing cold SKUs is assigned to a Courier, THE Slot_Scheduler SHALL verify that the courier's bag has reported a valid in-range temperature reading within the last 10 minutes before confirming the assignment.
6. THE Cold_Chain_Monitor SHALL support at least three temperature category profiles configurable per SKU: ambient (15–25°C), chilled (2–8°C), and frozen (−18°C or below).
7. WHEN a courier's bag sensor goes offline or fails to report for more than 10 minutes during an active cold delivery, THE Route_Optimizer SHALL flag the delivery for priority resolution and alert the Ops_Dashboard.

---

### Requirement 16: Picker Operations and Warehouse Task Management

**User Story:** As a dark store operations manager, I want pickers to receive optimised task lists with exact bin locations, and for their productivity to be tracked in real time, so that pick times are minimised and SLAs are met.

#### Acceptance Criteria

1. WHEN an order is routed to a Dark_Store, THE Picker_Ops_Manager SHALL generate a pick task list within 500ms, sequenced to minimise the picker's travel distance within the store layout.
2. THE Picker_Ops_Manager SHALL assign pick tasks to available pickers based on current workload, zone proximity, and picker skill level (e.g., cold zone certified).
3. WHEN a picker scans a barcode that does not match the SKU on the pick task, THE Picker_Ops_Manager SHALL reject the scan, alert the picker, and log a pick-mismatch event to the Audit_Log.
4. THE Picker_Ops_Manager SHALL track the real-time pick progress for every active order and emit a pick-delay event to the Order_Orchestrator if a pick task's estimated completion time would cause the order to miss its SLA window with less than 5 minutes of buffer remaining.
5. WHEN a picker reports a bin as empty that the Inventory_Manager shows as in-stock, THE Picker_Ops_Manager SHALL emit a bin-discrepancy event, trigger a physical stock audit task, and immediately remove the reported SKU from available stock pending audit resolution.
6. THE Picker_Ops_Manager SHALL produce per-picker productivity metrics including picks per hour, mismatch rate, and average pick time per SKU, available in real time via the Ops_Dashboard.
7. THE Picker_Ops_Manager SHALL support zone-based dark store layouts, configurable per Dark_Store, mapping each SKU to a bin coordinate expressed as aisle, shelf, and position.

---

### Requirement 17: Supplier Registry and Performance Management

**User Story:** As a procurement manager, I want supplier performance automatically tracked against contracted SLAs, and underperforming suppliers automatically deprioritised, so that replenishment reliability improves without manual review.

#### Acceptance Criteria

1. THE Supplier_Registry SHALL maintain a profile for each supplier including: contact details, covered SKU categories, contracted lead times, minimum order quantities, and current performance score.
2. THE Order_Orchestrator SHALL consult THE Supplier_Registry's priority-ranked list when issuing Replenishment_Events, routing to the highest-scored available supplier for each SKU category.
3. WHEN a supplier's on-time delivery rate falls below 85% over a rolling 30-day window, THE Supplier_Registry SHALL automatically demote that supplier's priority rank and notify the operator.
4. WHEN a supplier fails to fulfil three or more consecutive replenishment purchase orders, THE Supplier_Registry SHALL place that supplier in a suspended state and route all their SKU categories to secondary suppliers.
5. THE Supplier_Registry SHALL track and expose the following per-supplier metrics: on-time delivery rate, fill rate (percentage of ordered quantity actually delivered), average lead time, and rejection rate (units returned due to quality).
6. WHEN a new supplier is onboarded, THE Supplier_Registry SHALL enforce a minimum probationary period of 30 days during which the supplier is ineligible for priority-one routing, and shall assign a human review task before full activation.
7. THE Supplier_Registry SHALL support supplier-specific contract terms including minimum order value thresholds and blackout windows during which the supplier cannot receive orders.

---

### Requirement 18: Financial Ledger and Unit Economics Tracking

**User Story:** As a finance officer, I want every order, refund, delivery cost, and inventory write-off to be captured in a financial ledger in real time, so that unit economics are visible per order, per SKU, and per dark store without manual reconciliation.

#### Acceptance Criteria

1. THE Financial_Ledger SHALL record a financial event for every order confirmation, partial fulfillment, refund, inventory write-off (expiry or cold chain breach), and replenishment purchase order.
2. WHEN an order is confirmed, THE Financial_Ledger SHALL compute and record the order's projected gross margin, derived from the basket value, SKU cost-of-goods, and estimated fulfillment cost at the time of confirmation.
3. THE Financial_Ledger SHALL maintain a real-time running total of the following per Dark_Store per day: gross merchandise value (GMV), cost of goods sold (COGS), fulfillment cost, refund liability, and inventory write-off value.
4. WHEN a payment collection attempt for a cash-on-delivery order fails at the point of delivery, THE Financial_Ledger SHALL emit a payment-failure event, mark the order as financially unresolved, and escalate to the operator within 15 minutes.
5. THE Financial_Ledger SHALL produce a daily reconciliation report per tenant summarising GMV, refunds, net revenue, and outstanding payment failures, available via the Ops_Dashboard and the REST API.
6. THE Financial_Ledger SHALL enforce double-entry consistency: every debit event SHALL have a corresponding credit event, and any imbalance detected SHALL trigger an alert to the Ops_Dashboard within 60 seconds.
7. ALL financial records SHALL be immutable once committed; corrections SHALL be made via offsetting adjustment entries, not by modifying existing records.

---

### Requirement 19: Dynamic Pricing and Promotional Event Management

**User Story:** As a commercial manager, I want to apply time-bound price changes, surge pricing during peak demand, and promotional discounts automatically, without requiring a deployment.

#### Acceptance Criteria

1. THE Config_Engine SHALL support runtime publication of pricing rules including: fixed price overrides, percentage discounts, and surge multipliers, applicable at the SKU, category, or basket-value level.
2. WHEN a pricing rule is published, THE Config_Engine SHALL propagate the rule to the Order_Orchestrator and Financial_Ledger within 30 seconds, and the rule SHALL apply to all orders confirmed after propagation.
3. WHEN order volume at a Dark_Store exceeds 200% of the baseline for a sustained 10-minute window, THE Config_Engine MAY apply a configurable surge pricing multiplier if the tenant has enabled dynamic pricing.
4. WHEN a promotional event is scheduled with a start and end timestamp, THE Config_Engine SHALL automatically activate and deactivate the promotion at the scheduled times without operator intervention.
5. THE Config_Engine SHALL log every pricing rule change — including the rule content, the operator identity that published it, and the activation timestamp — to the Audit_Log.
6. WHEN a promotional rule is active, THE Financial_Ledger SHALL record both the pre-promotion price and the post-promotion price on each affected order line to support margin analysis.

---

### Requirement 20: Age-Gated and Regulated Product Compliance

**User Story:** As a compliance officer, I want the system to enforce age verification and regulatory restrictions on controlled products automatically, so that regulated items are never delivered without valid verification.

#### Acceptance Criteria

1. THE Inventory_Manager SHALL maintain a regulated-product flag per SKU, with categories including: age-restricted (alcohol, tobacco), prescription-required, and jurisdiction-restricted.
2. WHEN an order contains an age-restricted SKU, THE Order_Orchestrator SHALL validate that a verified date-of-birth is on file for the ordering account before accepting the order.
3. WHEN no verified age record exists for an account placing an age-restricted order, THE Order_Orchestrator SHALL reject the order with a specific age-verification-required error code and surface a verification flow to the customer.
4. WHEN a Courier is assigned an order containing age-restricted items, THE Slot_Scheduler SHALL attach an age-check instruction to the delivery task, requiring the Courier to confirm at the doorstep that the recipient appears to meet the age threshold or presents valid ID.
5. WHEN a Courier marks a delivery as refused due to failed age verification, THE Order_Orchestrator SHALL cancel the affected line items, trigger a refund for those items via THE Financial_Ledger, and log the refusal event to the Audit_Log.
6. THE AQCLI SHALL enforce jurisdiction-level product restrictions by mapping Dark_Store coordinates to a configurable jurisdiction ruleset, preventing order acceptance for restricted SKUs in disallowed jurisdictions.

---

### Requirement 21: Graceful Degradation and Manual Override

**User Story:** As a platform engineer, I want the system to continue operating in a reduced-capability mode during partial infrastructure failures, and for operators to be able to override automated decisions in real time.

#### Acceptance Criteria

1. THE AQCLI SHALL define four operational modes — NORMAL, DEGRADED, MANUAL, and SUSPENDED — with explicit transition rules between them.
2. WHEN a subsystem failure causes automated routing or scheduling to become unavailable, THE Order_Orchestrator SHALL transition to DEGRADED mode, in which orders are queued and operators are alerted, rather than rejected or silently dropped.
3. WHILE in DEGRADED mode, THE Ops_Dashboard SHALL display a prominent degraded-mode banner indicating which subsystems are affected and the estimated queue depth.
4. THE Ops_Dashboard SHALL provide operators with manual override controls allowing them to: manually assign an order to a Dark_Store, manually assign a Courier to an order, and manually approve or reject a held order, without requiring code changes or direct database access.
5. WHEN an operator applies a manual override, THE Order_Orchestrator SHALL apply the override within 10 seconds and record the operator identity, the override action, and the reason in the Audit_Log.
6. THE AQCLI SHALL automatically attempt to exit DEGRADED mode every 60 seconds by re-testing subsystem health, and SHALL transition back to NORMAL mode and drain the queued orders once all required subsystems report healthy.
7. WHEN in MANUAL mode (operator-initiated), automated routing and SLA escalation SHALL be suspended, and all order progression SHALL require explicit operator confirmation.

---

### Requirement 22: Runtime Configuration and Business Rule Management

**User Story:** As an operations engineer, I want to change thresholds, timeouts, SLA windows, and routing weights at runtime without a deployment, so that the system can respond to real-world conditions in minutes rather than hours.

#### Acceptance Criteria

1. THE Config_Engine SHALL expose a secured API allowing authorised operators to read and write the following configurable parameters without system restart: SLA window per tenant, replenishment lead thresholds, surge mode activation threshold, fraud scoring rule weights, and slot rebalancing interval.
2. WHEN a configuration change is published via the Config_Engine API, the change SHALL be validated against a schema and a permissible value range before acceptance; invalid changes SHALL be rejected with a descriptive error.
3. WHEN a valid configuration change is accepted, THE Config_Engine SHALL propagate the change to all affected subsystems within 30 seconds and confirm propagation.
4. THE Config_Engine SHALL maintain a versioned history of all configuration changes, retaining at least 90 days of change history accessible via the Ops_Dashboard.
5. WHEN a configuration change causes a measurable degradation in a key metric (SLA breach rate increase of more than 5 percentage points within 15 minutes of the change), THE Config_Engine SHALL alert the operator and offer a one-click rollback to the previous configuration version.
6. THE Config_Engine SHALL enforce role-based access control on configuration changes: read access SHALL be available to all authenticated operators; write access SHALL require an elevated operator role; destructive changes (e.g., disabling fraud scoring) SHALL require a dual-approval workflow.

---

### Requirement 23: Courier Performance and Incentive Management

**User Story:** As a fleet manager, I want each courier's performance automatically tracked and reflected in routing priority, so that high-performing couriers receive more assignments and underperformers are flagged before they affect the SLA rate.

#### Acceptance Criteria

1. THE Route_Optimizer SHALL maintain a per-Courier performance profile tracking: on-time delivery rate, average delivery time vs estimated time, customer rating average, undeliverable rate, and no-show rate.
2. WHEN a Courier's on-time delivery rate falls below 80% over a rolling 7-day window, THE Route_Optimizer SHALL reduce that Courier's batch size limit by one order until the rate recovers above 90%.
3. WHEN a Courier's no-show rate (accepting assignment then going offline) exceeds 10% in a 7-day window, THE Slot_Scheduler SHALL suspend that Courier's ability to receive new assignments and escalate to the fleet manager.
4. THE Route_Optimizer SHALL factor Courier performance scores into batch assignment decisions, preferring higher-scored Couriers for orders closer to their SLA deadline.
5. THE Ops_Dashboard SHALL expose a real-time Courier leaderboard showing performance scores, active orders, and current location (with Courier consent), accessible to fleet managers.
6. WHEN a Courier's performance score crosses a configurable excellence threshold, THE Config_Engine SHALL record the achievement for use in external incentive or compensation integrations via a webhook.

---

### Requirement 24: Notification and Communication Orchestration

**User Story:** As a customer, I want timely and accurate push notifications at every meaningful order milestone, and as an operator I want inbound customer messages automatically triaged, so that support load is minimised.

#### Acceptance Criteria

1. THE Order_Orchestrator SHALL emit a customer notification event at each of the following milestones: order confirmed, pick started, order out for delivery, order delivered, order delayed (SLA at risk), and refund initiated.
2. WHEN a customer notification event is emitted, THE Notification_Service SHALL deliver the notification via the customer's preferred channel (push, SMS, or email) within 60 seconds.
3. THE Notification_Service SHALL suppress duplicate notifications for the same event and order within a 5-minute deduplication window to prevent notification storms during retry cycles.
4. WHEN an inbound customer message references an active order ID, THE Notification_Service SHALL auto-classify the message intent (delivery query, quality complaint, cancellation request, or other) and route it to the appropriate automated resolution flow before escalating to a human agent.
5. WHEN an automated resolution flow resolves the customer's query (e.g., confirms ETD, processes a refund), THE Notification_Service SHALL close the inbound message thread without human agent involvement and record the resolution in the Audit_Log.
6. THE Notification_Service SHALL support tenant-configurable message templates with personalisation tokens (customer name, order ID, item list, ETA), ensuring brand consistency across tenants.

---

### Requirement 25: Network-Level Capacity Planning and Dark Store Commissioning

**User Story:** As a network planning manager, I want the system to identify when a geographic zone is consistently underserved and recommend new dark store locations based on demand density, so that capacity expansion decisions are data-driven.

#### Acceptance Criteria

1. THE Demand_Forecaster SHALL aggregate demand signals at a geohash-6 grid level and compute unfulfilled-demand estimates for zones where SLA breach rates or order rejection rates (due to capacity) exceed 10% in a rolling 7-day window.
2. WHEN an underserved zone is identified, THE Ops_Dashboard SHALL surface a capacity-gap alert with the estimated unfulfilled order volume, the top five requested SKU categories in that zone, and the recommended geohash coordinates for a new Dark_Store.
3. THE AQCLI SHALL support a Dark_Store onboarding workflow that provisions the new store's inventory zones, picker layout, supplier assignments, and tenant configuration without requiring platform engineering intervention.
4. WHEN a new Dark_Store is provisioned, THE Demand_Forecaster SHALL initialise its demand model using historical demand from the nearest existing Dark_Store, adjusted for the new store's geographic demand profile.
5. THE Ops_Dashboard SHALL provide a network health map view showing per-Dark_Store SLA performance, stock health, and order volume, updated in real time, to support ongoing capacity management decisions.

---

### Requirement 26: Agentic Demand Intelligence and Stock Optimisation

**User Story:** As a supply chain planner, I want an AI-driven demand intelligence model that ingests public signals — weather, local events, time-of-day patterns, and customer locality data — to produce highly accurate per-SKU stock recommendations, so that dark stores are neither overstocked nor understocked.

#### Acceptance Criteria

1. THE Demand_Forecaster SHALL ingest at minimum the following external public signals per forecast cycle: real-time weather conditions and 48-hour forecast, local event calendar (sports, holidays, festivals), time-of-day and day-of-week demand curves, and customer locality density derived from historical order geohash data.
2. THE Demand_Forecaster SHALL produce a per-SKU recommended stock level for each Dark_Store at the start of each 15-minute forecast window, expressed as a target quantity with an upper and lower confidence bound.
3. WHEN the Demand_Forecaster's recommended stock level for a SKU differs from the current on-hand quantity by more than 20%, THE Inventory_Manager SHALL evaluate whether a Replenishment_Event or a stock-reduction advisory should be raised.
4. THE Demand_Forecaster SHALL maintain a Confidence_Score per SKU per Dark_Store, updated each forecast cycle, representing the model's certainty in the current demand prediction on a 0–100 scale.
5. WHEN a SKU's Confidence_Score falls below 60, THE Demand_Forecaster SHALL flag the SKU for conservative stocking: the recommended stock level SHALL be capped at 110% of the previous 7-day average daily demand for that SKU at that Dark_Store.
6. THE Demand_Forecaster SHALL achieve a MAPE of 15% or less on a rolling 7-day evaluation window for SKUs with a Confidence_Score of 80 or above.
7. THE Demand_Forecaster SHALL expose the Confidence_Score and signal breakdown (contribution of each input signal to the forecast) via the Ops_Dashboard and REST API to support operator review.

---

### Requirement 27: Real-Time Last-Mile Map Refresh and Smart Dark Store Assignment

**User Story:** As a courier dispatcher, I want delivery route maps refreshed every 30 seconds using live traffic data, and each order assigned to the dark store that minimises actual travel time rather than straight-line distance, so that last-mile delivery remains reliable under high-demand conditions.

#### Acceptance Criteria

1. THE Route_Optimizer SHALL refresh its underlying map graph from the Google Maps Platform (Routes API and Traffic API) at a minimum interval of every 30 seconds during active delivery windows.
2. WHEN a map refresh detects a change in estimated travel time of more than 90 seconds on any active Courier's route segment, THE Route_Optimizer SHALL trigger an immediate route recomputation for the affected Courier and push the updated route within 15 seconds.
3. WHEN routing an order to a Dark_Store (Requirement 5), THE Order_Orchestrator SHALL use real-time estimated travel time from the Google Maps Distance Matrix API — not straight-line distance — as the primary proximity metric.
4. THE Route_Optimizer SHALL maintain a live congestion index per delivery zone, updated on each map refresh, and expose it to the Slot_Scheduler so that slot windows can be extended proactively when congestion exceeds a configurable threshold.
5. WHEN the Route_Optimizer detects that a delivery zone's average estimated travel time has increased by more than 40% compared to the baseline for that time-of-day window, THE Slot_Scheduler SHALL automatically extend the SLA window for new orders in that zone by up to 3 minutes and alert the Ops_Dashboard.
6. THE Route_Optimizer SHALL cache the most recent map graph snapshot locally so that a Google Maps API outage of up to 5 minutes does not interrupt active route computation; cached data older than 5 minutes SHALL trigger a degraded-mode alert.
7. ALL Google Maps API calls SHALL be rate-limited and batched to remain within the tenant's configured API quota; quota exhaustion SHALL trigger a degraded-mode alert before the limit is reached.

---

### Requirement 28: Perishable Goods Confidence Scoring and B2B Direct Fulfilment

**User Story:** As an inventory planner, I want a confidence score computed before stocking perishable items with a shelf life under 48 hours, and I want the option to fulfil exact required quantities directly from B2B suppliers rather than pre-stocking dark stores, so that perishable waste is minimised.

#### Acceptance Criteria

1. THE Demand_Forecaster SHALL compute a Perishable_Confidence_Score (0–100) for every SKU with a shelf life of 48 hours or less, updated at each forecast cycle, combining demand certainty, historical waste rate, and current on-hand quantity relative to projected demand.
2. WHEN a Perishable_Confidence_Score for a SKU falls below 70, THE Inventory_Manager SHALL suppress automatic Replenishment_Events for that SKU and instead raise a manual review advisory to the Ops_Dashboard before any restock is approved.
3. THE Inventory_Manager SHALL support a B2B_Direct_Fulfilment mode per SKU, in which the required quantity for confirmed orders is sourced directly from a registered B2B supplier rather than drawn from dark store stock.
4. WHEN B2B_Direct_Fulfilment mode is active for a SKU, THE Order_Orchestrator SHALL place a just-in-time purchase order with the designated B2B supplier at the time of order confirmation, specifying the exact quantity required for that order.
5. THE Inventory_Manager SHALL track perishable waste per SKU per Dark_Store as a first-class metric: units written off due to expiry SHALL be recorded with the write-off timestamp, quantity, and cost, and surfaced in the Ops_Dashboard.
6. WHEN perishable waste for a SKU exceeds 10% of units received in a rolling 7-day window, THE Demand_Forecaster SHALL automatically reduce the recommended stock level for that SKU by 15% and raise the Perishable_Confidence_Score threshold required for auto-replenishment to 80.
7. THE Cold_Chain_Monitor requirements (Requirement 15) SHALL apply in full to all perishable SKUs managed under both standard dark store stocking and B2B_Direct_Fulfilment mode.

---

### Requirement 29: Financial Margin Optimisation and Cost Transparency

**User Story:** As a finance officer, I want the system to continuously track per-order unit economics and surface actionable margin improvement opportunities — without raising prices above MRP or adding consumer-facing fees — so that the platform can achieve sustainable margins through operational efficiency.

#### Acceptance Criteria

1. THE Financial_Ledger SHALL compute a per-order Net_Contribution_Margin in real time at order confirmation, defined as: basket value minus COGS, minus fulfillment cost (pick labour + delivery), minus refund liability estimate, minus platform overhead allocation.
2. WHEN the Net_Contribution_Margin for an order is negative, THE Financial_Ledger SHALL tag the order as margin-negative and emit a margin-alert event to the Ops_Dashboard, without blocking order fulfillment.
3. THE Ops_Dashboard SHALL display a rolling margin health view showing the percentage of margin-negative orders, average Net_Contribution_Margin per order, and top five SKUs contributing to margin loss, updated at most every 60 seconds.
4. THE Demand_Forecaster SHALL factor inventory holding cost and perishable waste cost into its stock recommendations, so that overstocking of low-margin SKUs is penalised in the optimisation objective.
5. THE Route_Optimizer SHALL evaluate order batching opportunities with margin impact in mind: batching two or more orders in the same delivery zone SHALL be preferred when it reduces per-order delivery cost below the single-order delivery cost threshold configured by the operator.
6. THE Financial_Ledger SHALL track and report dark store operational cost per fulfilled order (rent, utilities, labour) as a configurable overhead allocation, enabling operators to identify which Dark_Stores are operating below the break-even contribution margin.
7. THE AQCLI SHALL NOT apply any pricing above the SKU's configured MRP; THE Config_Engine SHALL enforce a hard ceiling on all pricing rules such that no order line can be priced above MRP regardless of surge multiplier configuration.

---

### Requirement 30: Gig Worker Welfare and Operational Time Management

**User Story:** As a fleet manager, I want the system to enforce strict operational time windows and mandatory rest periods for gig workers, and to dynamically expand the active courier pool during demand spikes, so that worker burnout, safety incidents, and unfair compensation are prevented.

#### Acceptance Criteria

1. THE Slot_Scheduler SHALL maintain a per-Courier operational time ledger tracking total active hours within any rolling 24-hour window and any rolling 7-day window.
2. WHEN a Courier's active hours in a rolling 24-hour window reach the configured daily limit (default: 10 hours), THE Slot_Scheduler SHALL automatically suspend that Courier from receiving new assignments for the remainder of that window and notify the fleet manager.
3. WHEN a Courier's active hours in a rolling 7-day window reach the configured weekly limit (default: 48 hours), THE Slot_Scheduler SHALL suspend that Courier from receiving new assignments until the 7-day window resets and escalate to the fleet manager.
4. THE Slot_Scheduler SHALL enforce a mandatory rest period of at least 30 consecutive minutes after every 4 hours of continuous active delivery time per Courier; assignments SHALL not be offered to a Courier who has not completed the required rest period.
5. WHEN order volume at a Dark_Store exceeds 130% of the baseline for a sustained 15-minute window, THE Slot_Scheduler SHALL emit a courier-pool-expansion-needed event to the Ops_Dashboard, recommending the number of additional Couriers required to maintain SLA compliance.
6. THE Route_Optimizer SHALL cap the maximum number of concurrent active orders per Courier at a configurable limit (default: 3 orders per Batch) to prevent unsafe delivery speeds and cognitive overload during surge periods.
7. THE Financial_Ledger SHALL compute and record per-Courier earnings per active hour at the end of each shift window, and SHALL emit a below-minimum-earnings alert to the fleet manager if any Courier's effective hourly rate falls below the configured minimum earnings threshold.
8. ALL Courier time-limit configurations SHALL be adjustable per tenant via the Config_Engine API (Requirement 22) and SHALL require elevated operator role to modify; reductions below the platform-defined safety minimums SHALL require dual approval.

---

### Requirement 31: Multi-Role User Signup

**User Story:** As a platform administrator, I want each user type to have a dedicated signup flow with role-specific data fields, so that the correct profile information is captured at registration and each user is tagged with a unique role identifier.

#### Acceptance Criteria

1. THE Auth_Service SHALL provide four distinct signup endpoints, one for each role: Company (Admin), Delivery Department Staff, Delivery Personnel, and Financial Department Staff.
2. WHEN a user submits a signup form, THE Auth_Service SHALL validate all required fields for that role before creating any database record; invalid submissions SHALL return field-level error messages.
3. WHEN a valid signup is submitted, THE Auth_Service SHALL create a record in the `users` table with fields: id, name, email, password_hash, role, and created_at, and a corresponding record in the role-specific profile table (company_profiles, delivery_department_profiles, delivery_man_profiles, or finance_profiles).
4. THE Auth_Service SHALL hash all passwords using bcrypt with a minimum cost factor of 12 before storage; plaintext passwords SHALL never be persisted.
5. WHEN a signup request uses an email address already registered in the `users` table, THE Auth_Service SHALL reject the request with a duplicate-email error before creating any record.
6. THE Auth_Service SHALL enforce foreign key relationships between the `users` table and each role-specific profile table, ensuring no orphaned profile records can exist.
7. WHEN a signup is completed successfully, THE Auth_Service SHALL return a confirmation response; email verification (if enabled) SHALL be triggered before the account is activated.

---

### Requirement 32: Unified Single Login and Role-Based Redirect

**User Story:** As any registered user, I want to log in through a single common login page using my email and password, and be automatically redirected to the dashboard appropriate for my role, so that I do not need to know or select my role at login time.

#### Acceptance Criteria

1. THE Auth_Service SHALL expose a single login endpoint that accepts email (or username) and password for all user roles.
2. WHEN valid credentials are submitted, THE Auth_Service SHALL issue a signed JWT containing the user's id, role, and expiry timestamp; the token SHALL expire after a configurable duration (default: 24 hours).
3. WHEN invalid credentials are submitted, THE Auth_Service SHALL return a generic authentication-failed error without disclosing whether the email or password was incorrect.
4. WHEN a valid JWT is issued, THE Frontend SHALL read the role claim from the token and redirect the user to the role-specific dashboard without requiring an additional API call: Company → Admin Dashboard, Delivery Department → Delivery Management Dashboard, Delivery Personnel → Assigned Deliveries Dashboard, Financial Department → Finance Dashboard.
5. THE Auth_Service SHALL reject any API request that does not carry a valid, non-expired JWT with a 401 Unauthorized response.
6. WHEN a JWT expires, THE Frontend SHALL redirect the user to the login page and clear the stored token.

---

### Requirement 33: Role-Based Access Control (RBAC)

**User Story:** As a platform engineer, I want every API endpoint protected by role-based middleware, so that users can only access resources and perform actions permitted for their role.

#### Acceptance Criteria

1. THE Auth_Service SHALL implement middleware that validates the JWT on every protected API request and extracts the role claim before the request reaches the handler.
2. THE Company (Admin) role SHALL have access to: create, read, update, and delete any user account; view system-wide operational and financial reports; and manage role assignments.
3. THE Delivery Department Staff role SHALL have access to: assign deliveries to Delivery Personnel; view and update delivery status across all active orders; and access delivery performance reports.
4. THE Delivery Personnel role SHALL have access to: view only their own assigned deliveries; update the status of their own active deliveries; and view their own performance metrics.
5. THE Financial Department Staff role SHALL have access to: view and manage payment records, invoices, and transaction logs; generate financial reconciliation reports; and access the Financial_Ledger read API.
6. WHEN a user attempts to access an endpoint outside their role's permitted scope, THE Auth_Service middleware SHALL return a 403 Forbidden response and log the access attempt to the Audit_Log.
7. THE RBAC middleware SHALL be applied as a reusable layer across all backend services in the AQCLI platform, not duplicated per service.

---

### Requirement 34: Frontend Role-Specific UI and Navigation

**User Story:** As a user, I want a clean, role-appropriate interface with navigation items relevant only to my role, so that I am not confused by features I cannot access.

#### Acceptance Criteria

1. THE Frontend SHALL be implemented in React and SHALL provide four separate signup page components, one per role, each rendering only the fields required for that role's profile.
2. THE Frontend SHALL provide a single shared Login page component used by all roles.
3. WHEN a user is authenticated, THE Frontend SHALL render a role-specific navigation menu: only menu items permitted for the authenticated user's role SHALL be visible.
4. THE Frontend SHALL implement protected route components that verify the presence and validity of the JWT before rendering any authenticated page; unauthenticated access SHALL redirect to the Login page.
5. THE Frontend SHALL validate all signup and login form inputs client-side (required fields, email format, password minimum length of 8 characters) before submitting to the backend, and SHALL display inline validation errors.
6. THE Frontend SHALL sanitize all user-supplied input before rendering to prevent XSS; no raw HTML from API responses SHALL be injected into the DOM.

---

### Requirement 35: Authentication Security Standards

**User Story:** As a security engineer, I want all authentication flows to meet baseline security standards, so that user credentials and sessions cannot be compromised through common attack vectors.

#### Acceptance Criteria

1. ALL passwords SHALL be hashed with bcrypt at a minimum cost factor of 12; no other hashing algorithm SHALL be used for password storage.
2. JWT tokens SHALL be signed using HS256 or RS256; the signing secret or private key SHALL never be exposed in client-side code or API responses.
3. JWT tokens SHALL have a configurable expiry (default 24 hours); refresh token rotation SHALL be supported as an optional enhancement.
4. THE Auth_Service SHALL enforce input validation and sanitization on all signup and login request fields server-side, independent of client-side validation.
5. THE Auth_Service SHALL implement rate limiting on the login endpoint: a maximum of 10 failed login attempts per IP address within a 15-minute window SHALL trigger a temporary block and an alert to the Ops_Dashboard.
6. ALL authentication API traffic SHALL be served over HTTPS; HTTP requests to auth endpoints SHALL be rejected or redirected.
7. THE Auth_Service SHALL log every login attempt (successful and failed), token issuance, and role-access violation to the Audit_Log with timestamp, user id (if resolvable), IP address, and outcome.

---

### Requirement 36: Optional Auth Enhancements

**User Story:** As a platform operator, I want optional email verification, password recovery, admin analytics, and per-role activity logs available as configurable features, so that the platform can be hardened and monitored as it scales.

#### Acceptance Criteria

1. WHEN email verification is enabled via the Config_Engine, THE Auth_Service SHALL send a verification email containing a time-limited token (expiry: 24 hours) upon signup; the account SHALL remain inactive until the email is verified.
2. THE Auth_Service SHALL provide a forgot-password flow: a user submits their email, receives a password-reset link containing a single-use time-limited token (expiry: 1 hour), and can set a new password via that link; used or expired tokens SHALL be rejected.
3. THE Company (Admin) Dashboard SHALL include an analytics view showing: total registered users per role, login activity over the last 7 days, and failed login attempts per day.
4. THE Audit_Log SHALL record per-role activity events including: login, logout, resource access, data modification, and role-access violations, queryable by role and date range via the Ops_Dashboard.
5. WHEN any optional enhancement is disabled via the Config_Engine, the corresponding UI elements and API endpoints SHALL be hidden or return a 404; no partial or broken flows SHALL be exposed to users.

---

### Requirement 37: Unified Registration Landing Page

**User Story:** As a new user, I want a single dedicated registration page that lets me choose my role before being taken to the correct signup form, so that I am never confused about where to start and the login page remains focused solely on authentication.

#### Acceptance Criteria

1. THE Frontend SHALL provide a dedicated Registration page at a distinct route (e.g., `/register`) that is completely separate from the Login page (`/login`) and from the individual role signup pages.
2. THE Registration page SHALL display all four available roles — Company (Admin), Delivery Department Staff, Delivery Personnel, and Financial Department Staff — as clearly labelled, selectable options with a brief description of each role.
3. WHEN a user selects a role on the Registration page, THE Frontend SHALL navigate to the corresponding role-specific signup page without submitting any data: Company → `/register/company`, Delivery Staff → `/register/delivery-staff`, Courier → `/register/courier`, Finance Staff → `/register/finance`.
4. THE Login page SHALL NOT contain any signup form fields or inline registration flow; it SHALL only contain the email/username and password fields plus a clearly visible link to the Registration page.
5. THE Registration page SHALL be accessible to unauthenticated users only; authenticated users who navigate to `/register` SHALL be redirected to their role-specific dashboard.
6. WHEN a user completes a role-specific signup form and the account is created successfully, THE Frontend SHALL redirect the user to the Login page with a success confirmation message, not to a dashboard, so that the user explicitly logs in after registration.
7. THE Registration page and all role-specific signup pages SHALL display a link back to the Login page for users who already have an account.
