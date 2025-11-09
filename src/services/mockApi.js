import {
  MOCK_USERS,
  MOCK_VEHICLES,
  MOCK_DEALERS,
  MOCK_CUSTOMERS,
  MOCK_ORDERS,
  MOCK_INVENTORY,
  MOCK_APPOINTMENTS,
  MOCK_VEHICLE_REQUESTS,
} from "../data/mockData";
// Vehicle Request API
export const vehicleRequestApi = {
  getAll: async () => {
    await delay();
    return MOCK_VEHICLE_REQUESTS;
  },
  create: async (requestData) => {
    await delay();
    const newRequest = {
      id: "req-" + Date.now(),
      ...requestData,
      status: requestData.status || "pending",
      created_at: new Date().toISOString(),
    };
    MOCK_VEHICLE_REQUESTS.push(newRequest);
    return newRequest;
  },
};

// Simulate API delay
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// Auth API
export const authApi = {
  login: async (email, password) => {
    await delay();
    const user = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token: "mock-jwt-token-" + user.id,
    };
  },
};

// Vehicle API
export const vehicleApi = {
  getAll: async () => {
    await delay();
    return MOCK_VEHICLES;
  },

  getById: async (id) => {
    await delay();
    const vehicle = MOCK_VEHICLES.find((v) => v.id === id);
    if (!vehicle) throw new Error("Vehicle not found");
    return vehicle;
  },

  getByDealer: async (dealerId) => {
    await delay();
    const inventory = MOCK_INVENTORY.filter(
      (inv) => inv.dealer_id === dealerId && inv.status === "available"
    );
    const vehicleIds = [...new Set(inventory.map((inv) => inv.vehicle_id))];
    return MOCK_VEHICLES.filter((v) => vehicleIds.includes(v.id));
  },
};

// Customer API
export const customerApi = {
  getAll: async (staffId) => {
    await delay();
    return MOCK_CUSTOMERS.filter((c) => c.dealer_staff_id === staffId);
  },

  getById: async (id) => {
    await delay();
    const customer = MOCK_CUSTOMERS.find((c) => c.id === id);
    if (!customer) throw new Error("Customer not found");
    return customer;
  },

  create: async (customerData) => {
    await delay();
    const newCustomer = {
      id: "cust-" + Date.now(),
      ...customerData,
      created_at: new Date().toISOString(),
    };
    MOCK_CUSTOMERS.push(newCustomer);
    return newCustomer;
  },

  update: async (id, customerData) => {
    await delay();
    const idx = MOCK_CUSTOMERS.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error("Customer not found");
    const updated = {
      ...MOCK_CUSTOMERS[idx],
      ...customerData,
      updated_at: new Date().toISOString(),
    };
    MOCK_CUSTOMERS[idx] = updated;
    return updated;
  },
};

// Order API
export const orderApi = {
  getAll: async (dealerId = null, staffId = null) => {
    await delay();
    let orders = MOCK_ORDERS;

    if (dealerId) {
      orders = orders.filter((o) => o.dealer_id === dealerId);
    }

    if (staffId) {
      orders = orders.filter((o) => o.dealer_staff_id === staffId);
    }

    return orders;
  },

  getById: async (id) => {
    await delay();
    const order = MOCK_ORDERS.find((o) => o.id === id);
    if (!order) throw new Error("Order not found");
    return order;
  },

  create: async (orderData) => {
    await delay();
    const newOrder = {
      id: "ord-" + Date.now(),
      ...orderData,
      created_at: new Date().toISOString(),
      delivered_at: null,
    };
    MOCK_ORDERS.push(newOrder);
    return newOrder;
  },
};

// Appointment API
export const appointmentApi = {
  getAll: async (staffId = null) => {
    await delay();
    if (staffId) {
      return MOCK_APPOINTMENTS.filter((a) => a.dealer_staff_id === staffId);
    }
    return MOCK_APPOINTMENTS;
  },

  create: async (appointmentData) => {
    await delay();
    const newAppointment = {
      id: "appt-" + Date.now(),
      ...appointmentData,
      status: appointmentData.status || "Pending",
    };
    MOCK_APPOINTMENTS.push(newAppointment);
    return newAppointment;
  },

  updateStatus: async (id, status, note = "") => {
    await delay();
    const appointment = MOCK_APPOINTMENTS.find((a) => a.id === id);
    if (!appointment) throw new Error("Appointment not found");
    appointment.status = status;
    if (status === "Scheduled" && note) {
      appointment.confirm_note = note;
    }
    if (status === "Cancelled" && note) {
      appointment.cancel_note = note;
    }
    return appointment;
  },
};

// Dealer API
export const dealerApi = {
  getAll: async () => {
    await delay();
    return MOCK_DEALERS;
  },

  getById: async (id) => {
    await delay();
    const dealer = MOCK_DEALERS.find((d) => d.id === id);
    if (!dealer) throw new Error("Dealer not found");
    return dealer;
  },
};

// Inventory API
export const inventoryApi = {
  getByDealer: async (dealerId) => {
    await delay();
    return MOCK_INVENTORY.filter((inv) => inv.dealer_id === dealerId);
  },

  getAvailableCount: async (dealerId, vehicleId) => {
    await delay();
    return MOCK_INVENTORY.filter(
      (inv) =>
        inv.dealer_id === dealerId &&
        inv.vehicle_id === vehicleId &&
        inv.status === "available"
    ).length;
  },
};
