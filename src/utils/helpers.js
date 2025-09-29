// Format currency to VND
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Format date
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Format date and time
export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Get role name by role_id
export const getRoleName = (roleId) => {
  const roles = {
    1: "Dealer Staff",
    2: "Dealer Manager",
    3: "EVM Staff",
    4: "Admin",
  };
  return roles[roleId] || "Unknown";
};

// Get order status badge color
export const getOrderStatusColor = (status) => {
  const colors = {
    pending: "bg-yellow-500",
    confirmed: "bg-blue-500",
    delivered: "bg-green-500",
    cancelled: "bg-red-500",
  };
  return colors[status] || "bg-gray-500";
};

// Get payment status badge color
export const getPaymentStatusColor = (status) => {
  const colors = {
    pending: "bg-yellow-500",
    partial_paid: "bg-orange-500",
    paid: "bg-green-500",
  };
  return colors[status] || "bg-gray-500";
};
