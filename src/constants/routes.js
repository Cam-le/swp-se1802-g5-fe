// Public routes
export const PUBLIC_ROUTES = {
  LOGIN: "/login",
  UNAUTHORIZED: "/unauthorized",
};

// Dealer Staff routes
export const DEALER_STAFF_ROUTES = {
  DASHBOARD: "/dealer/staff/dashboard",
  PROFILE: "/dealer/staff/profile",
  VEHICLES: "/dealer/staff/vehicles",
  CUSTOMERS: "/dealer/staff/customers",
  ORDERS: "/dealer/staff/orders",
  APPOINTMENTS: "/dealer/staff/appointments",
  REQUEST_VEHICLES: "/dealer/staff/request-vehicles",
};

// Dealer Manager routes
export const DEALER_MANAGER_ROUTES = {
  DASHBOARD: "/dealer/manager/dashboard",
  PROFILE: "/dealer/manager/profile",
  VEHICLES: "/dealer/manager/vehicles",
  CUSTOMERS: "/dealer/manager/customers",
  ORDERS: "/dealer/manager/orders",
  APPOINTMENTS: "/dealer/manager/appointments",
  STAFF: "/dealer/manager/staff",
  REPORTS: "/dealer/manager/reports",
  PROMOTIONS: "/dealer/manager/promotions",
  REQUEST_VEHICLES: "/dealer/manager/request-vehicles",
  REQUEST_VERIFICATION: "/dealer/manager/request-verification",
};

// EVM Staff routes
export const EVM_STAFF_ROUTES = {
  DASHBOARD: "/evm/dashboard",
  VEHICLES: "/evm/vehicles",
  INVENTORY: "/evm/inventory",
  VEHICLE_REQUESTS: "/evm/vehicle-requests",
  DEALERS: "/evm/dealers",
  REPORTS: "/evm/reports",
  PROFILE: "/evm/profile",
};

// Admin routes
export const ADMIN_ROUTES = {
  DASHBOARD: "/admin/dashboard",
  USERS: "/admin/users",
  ROLES: "/admin/roles",
  DEALERS: "/admin/dealers",
  SETTINGS: "/admin/settings",
  REPORTS: "/admin/reports",
  PROFILE: "/admin/profile",
};

// All routes combined for easy access
export const ROUTES = {
  ...PUBLIC_ROUTES,
  DEALER_STAFF: DEALER_STAFF_ROUTES,
  DEALER_MANAGER: DEALER_MANAGER_ROUTES,
  EVM_STAFF: EVM_STAFF_ROUTES,
  ADMIN: ADMIN_ROUTES,
};
