// Public routes
export const PUBLIC_ROUTES = {
  LOGIN: "/login",
  UNAUTHORIZED: "/unauthorized",
};

// Dealer Staff routes
export const DEALER_STAFF_ROUTES = {
  DASHBOARD: "/dealer/staff/dashboard",
  VEHICLES: "/dealer/staff/vehicles",
  CUSTOMERS: "/dealer/staff/customers",
  ORDERS: "/dealer/staff/orders",
  APPOINTMENTS: "/dealer/staff/appointments",
};

// Dealer Manager routes
export const DEALER_MANAGER_ROUTES = {
  DASHBOARD: "/dealer/manager/dashboard",
  VEHICLES: "/dealer/manager/vehicles",
  CUSTOMERS: "/dealer/manager/customers",
  ORDERS: "/dealer/manager/orders",
  APPOINTMENTS: "/dealer/manager/appointments",
  STAFF: "/dealer/manager/staff",
  REPORTS: "/dealer/manager/reports",
  PROMOTIONS: "/dealer/manager/promotions",
};

// EVM Staff routes
export const EVM_STAFF_ROUTES = {
  DASHBOARD: "/evm/dashboard",
  VEHICLES: "/evm/vehicles",
  INVENTORY: "/evm/inventory",
  DEALERS: "/evm/dealers",
  REPORTS: "/evm/reports",
  PROMOTIONS: "/evm/promotions",
};

// Admin routes
export const ADMIN_ROUTES = {
  DASHBOARD: "/admin/dashboard",
  USERS: "/admin/users",
  DEALERS: "/admin/dealers",
  VEHICLES: "/admin/vehicles",
  REPORTS: "/admin/reports",
  SETTINGS: "/admin/settings",
};

// All routes combined for easy access
export const ROUTES = {
  ...PUBLIC_ROUTES,
  DEALER_STAFF: DEALER_STAFF_ROUTES,
  DEALER_MANAGER: DEALER_MANAGER_ROUTES,
  EVM_STAFF: EVM_STAFF_ROUTES,
  ADMIN: ADMIN_ROUTES,
};
