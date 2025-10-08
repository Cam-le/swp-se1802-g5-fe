// Order status
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: "Pending",
  [ORDER_STATUS.CONFIRMED]: "Confirmed",
  [ORDER_STATUS.DELIVERED]: "Delivered",
  [ORDER_STATUS.CANCELLED]: "Cancelled",
};

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: "bg-yellow-500",
  [ORDER_STATUS.CONFIRMED]: "bg-blue-500",
  [ORDER_STATUS.DELIVERED]: "bg-green-500",
  [ORDER_STATUS.CANCELLED]: "bg-red-500",
};

// Payment status
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PARTIAL_PAID: "partial_paid",
  PAID: "paid",
};

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDING]: "Pending",
  [PAYMENT_STATUS.PARTIAL_PAID]: "Partially Paid",
  [PAYMENT_STATUS.PAID]: "Paid",
};

export const PAYMENT_STATUS_COLORS = {
  [PAYMENT_STATUS.PENDING]: "bg-yellow-500",
  [PAYMENT_STATUS.PARTIAL_PAID]: "bg-orange-500",
  [PAYMENT_STATUS.PAID]: "bg-green-500",
};

// Payment type
export const PAYMENT_TYPE = {
  FULL: "full",
  INSTALLMENT: "installment",
};

export const PAYMENT_TYPE_LABELS = {
  [PAYMENT_TYPE.FULL]: "Full Payment",
  [PAYMENT_TYPE.INSTALLMENT]: "Installment",
};

// Payment method
export const PAYMENT_METHOD = {
  CASH: "cash",
  BANK_TRANSFER: "bank_transfer",
  CARD: "card",
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHOD.CASH]: "Cash",
  [PAYMENT_METHOD.BANK_TRANSFER]: "Bank Transfer",
  [PAYMENT_METHOD.CARD]: "Card",
};

// Inventory status
export const INVENTORY_STATUS = {
  AVAILABLE: "available",
  RESERVED: "reserved",
  SOLD: "sold",
};

export const INVENTORY_STATUS_LABELS = {
  [INVENTORY_STATUS.AVAILABLE]: "Available",
  [INVENTORY_STATUS.RESERVED]: "Reserved",
  [INVENTORY_STATUS.SOLD]: "Sold",
};

export const INVENTORY_STATUS_COLORS = {
  [INVENTORY_STATUS.AVAILABLE]: "bg-green-500",
  [INVENTORY_STATUS.RESERVED]: "bg-yellow-500",
  [INVENTORY_STATUS.SOLD]: "bg-gray-500",
};

// Appointment status
export const APPOINTMENT_STATUS = {
  SCHEDULED: "scheduled",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
};

export const APPOINTMENT_STATUS_LABELS = {
  [APPOINTMENT_STATUS.SCHEDULED]: "Scheduled",
  [APPOINTMENT_STATUS.COMPLETED]: "Completed",
  [APPOINTMENT_STATUS.CANCELLED]: "Cancelled",
  [APPOINTMENT_STATUS.NO_SHOW]: "No Show",
};

export const APPOINTMENT_STATUS_COLORS = {
  [APPOINTMENT_STATUS.SCHEDULED]: "bg-blue-500",
  [APPOINTMENT_STATUS.COMPLETED]: "bg-green-500",
  [APPOINTMENT_STATUS.CANCELLED]: "bg-red-500",
  [APPOINTMENT_STATUS.NO_SHOW]: "bg-gray-500",
};

// Vehicle status
export const VEHICLE_STATUS = {
  AVAILABLE: "available",
  DISCONTINUED: "discontinued",
  COMING_SOON: "coming_soon",
};

export const VEHICLE_STATUS_LABELS = {
  [VEHICLE_STATUS.AVAILABLE]: "Available",
  [VEHICLE_STATUS.DISCONTINUED]: "Discontinued",
  [VEHICLE_STATUS.COMING_SOON]: "Coming Soon",
};

export const VEHICLE_STATUS_COLORS = {
  [VEHICLE_STATUS.AVAILABLE]: "bg-green-500",
  [VEHICLE_STATUS.DISCONTINUED]: "bg-gray-500",
  [VEHICLE_STATUS.COMING_SOON]: "bg-blue-500",
};

// Feedback type
export const FEEDBACK_TYPE = {
  COMPLAINT: "complaint",
  COMPLIMENT: "compliment",
  GENERAL: "general",
};

export const FEEDBACK_TYPE_LABELS = {
  [FEEDBACK_TYPE.COMPLAINT]: "Complaint",
  [FEEDBACK_TYPE.COMPLIMENT]: "Compliment",
  [FEEDBACK_TYPE.GENERAL]: "General",
};

// Feedback status
export const FEEDBACK_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
};

export const FEEDBACK_STATUS_LABELS = {
  [FEEDBACK_STATUS.OPEN]: "Open",
  [FEEDBACK_STATUS.IN_PROGRESS]: "In Progress",
  [FEEDBACK_STATUS.RESOLVED]: "Resolved",
};

export const FEEDBACK_STATUS_COLORS = {
  [FEEDBACK_STATUS.OPEN]: "bg-yellow-500",
  [FEEDBACK_STATUS.IN_PROGRESS]: "bg-blue-500",
  [FEEDBACK_STATUS.RESOLVED]: "bg-green-500",
};

// Vehicle request status
export const VEHICLE_REQUEST_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  FULFILLED: "fulfilled",
};

export const VEHICLE_REQUEST_STATUS_LABELS = {
  [VEHICLE_REQUEST_STATUS.PENDING]: "Pending",
  [VEHICLE_REQUEST_STATUS.APPROVED]: "Approved",
  [VEHICLE_REQUEST_STATUS.REJECTED]: "Rejected",
  [VEHICLE_REQUEST_STATUS.FULFILLED]: "Fulfilled",
};

export const VEHICLE_REQUEST_STATUS_COLORS = {
  [VEHICLE_REQUEST_STATUS.PENDING]: "bg-yellow-500",
  [VEHICLE_REQUEST_STATUS.APPROVED]: "bg-blue-500",
  [VEHICLE_REQUEST_STATUS.REJECTED]: "bg-red-500",
  [VEHICLE_REQUEST_STATUS.FULFILLED]: "bg-green-500",
};
