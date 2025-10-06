import {
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
  PAYMENT_STATUS_LABELS,
  INVENTORY_STATUS_COLORS,
  INVENTORY_STATUS_LABELS,
  APPOINTMENT_STATUS_COLORS,
  APPOINTMENT_STATUS_LABELS,
} from "../constants";

// Format currency to VND
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Format date and time
export const formatDateTime = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format short date (DD/MM/YYYY)
export const formatShortDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("vi-VN");
};

// Format time only
export const formatTime = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Get status badge color (generic)
export const getStatusColor = (status, colorMap) => {
  return colorMap[status] || "bg-gray-500";
};

// Get status label (generic)
export const getStatusLabel = (status, labelMap) => {
  return labelMap[status] || status;
};

// Get order status badge color
export const getOrderStatusColor = (status) => {
  return getStatusColor(status, ORDER_STATUS_COLORS);
};

// Get order status label
export const getOrderStatusLabel = (status) => {
  return getStatusLabel(status, ORDER_STATUS_LABELS);
};

// Get payment status badge color
export const getPaymentStatusColor = (status) => {
  return getStatusColor(status, PAYMENT_STATUS_COLORS);
};

// Get payment status label
export const getPaymentStatusLabel = (status) => {
  return getStatusLabel(status, PAYMENT_STATUS_LABELS);
};

// Get inventory status badge color
export const getInventoryStatusColor = (status) => {
  return getStatusColor(status, INVENTORY_STATUS_COLORS);
};

// Get inventory status label
export const getInventoryStatusLabel = (status) => {
  return getStatusLabel(status, INVENTORY_STATUS_LABELS);
};

// Get appointment status badge color
export const getAppointmentStatusColor = (status) => {
  return getStatusColor(status, APPOINTMENT_STATUS_COLORS);
};

// Get appointment status label
export const getAppointmentStatusLabel = (status) => {
  return getStatusLabel(status, APPOINTMENT_STATUS_LABELS);
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// Generate initials from name
export const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
};
