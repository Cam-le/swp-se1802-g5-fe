// Role definitions with IDs, names, and default routes
export const ROLES = {
  DEALER_STAFF: {
    id: 1,
    name: "Dealer Staff",
    displayName: "Dealer Staff",
    route: "/dealer/staff/dashboard",
  },
  DEALER_MANAGER: {
    id: 2,
    name: "Dealer Manager",
    displayName: "Dealer Manager",
    route: "/dealer/manager/dashboard",
  },
  EVM_STAFF: {
    id: 3,
    name: "EVM Staff",
    displayName: "EVM Staff",
    route: "/evm/dashboard",
  },
  ADMIN: {
    id: 4,
    name: "Admin",
    displayName: "System Administrator",
    route: "/admin/dashboard",
  },
};

// Helper function to get role by ID
export const getRoleById = (roleId) => {
  return Object.values(ROLES).find((role) => role.id === roleId);
};

// Helper function to get role name by ID
export const getRoleName = (roleId) => {
  const role = getRoleById(roleId);
  return role ? role.displayName : "Unknown Role";
};

// Helper function to get default route by role ID
export const getDefaultRoute = (roleId) => {
  const role = getRoleById(roleId);
  return role ? role.route : "/";
};

// Array of all role IDs for validation
export const ROLE_IDS = Object.values(ROLES).map((role) => role.id);
