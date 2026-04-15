const BASE = "http://localhost:8000"

function getToken() {
  return sessionStorage.getItem("aqcli_token") ?? ""
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail ?? "Request failed")
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  // Auth
  login:   (email: string, password: string) => request<{ access_token: string }>("POST", "/auth/login", { email, password }),
  signup:  (body: unknown) => request("POST", "/auth/signup", body),
  me:      () => request("GET", "/auth/me"),

  // Users
  getUsers:   () => request<any[]>("GET", "/users"),
  deleteUser: (id: string) => request("DELETE", `/users/${id}`),

  // Orders
  getOrders:    () => request<any[]>("GET", "/orders"),
  createOrder:  (body: unknown) => request("POST", "/orders", body),
  updateOrder:  (id: string, body: unknown) => request("PATCH", `/orders/${id}`, body),
  deleteOrder:  (id: string) => request("DELETE", `/orders/${id}`),

  // Ledger
  getLedger:    () => request<any[]>("GET", "/ledger"),
  addLedger:    (body: unknown) => request("POST", "/ledger", body),
  getLedgerSummary: () => request<any>("GET", "/ledger/summary"),

  // Invoices
  getInvoices:    () => request<any[]>("GET", "/invoices"),
  createInvoice:  (body: unknown) => request("POST", "/invoices", body),
  updateInvoice:  (id: string, body: unknown) => request("PATCH", `/invoices/${id}`, body),

  // Deliveries
  getDeliveries:   () => request<any[]>("GET", "/deliveries"),
  createDelivery:  (body: unknown) => request("POST", "/deliveries", body),
  updateDelivery:  (id: string, body: unknown) => request("PATCH", `/deliveries/${id}`, body),

  // Couriers
  getCouriers:   () => request<any[]>("GET", "/couriers"),
  createCourier: (body: unknown) => request("POST", "/couriers", body),
  updateCourier: (id: string, body: unknown) => request("PATCH", `/couriers/${id}`, body),

  // Stats
  getStats: () => request<any>("GET", "/stats/dashboard"),
}
