// Mock Users Data
export const MOCK_USERS = [
  {
    id: "1",
    email: "admin@evm.com",
    password: "admin123",
    full_name: "Admin User",
    role: "Admin",
    role_id: 4,
  },
  {
    id: "2",
    email: "evmstaff@evm.com",
    password: "evm123",
    full_name: "EVM Staff",
    role: "EVM Staff",
    role_id: 3,
  },
  {
    id: "3",
    email: "manager@dealer1.com",
    password: "manager123",
    full_name: "John Manager",
    role: "Dealer Manager",
    role_id: 2,
    dealer_id: "dealer-001",
    dealer_name: "Premium EV Dealer Hanoi",
  },
  {
    id: "4",
    email: "staff@dealer1.com",
    password: "staff123",
    full_name: "Jane Staff",
    role: "Dealer Staff",
    role_id: 1,
    dealer_id: "dealer-001",
    dealer_name: "Premium EV Dealer Hanoi",
  },
];

// Mock Vehicles Data
export const MOCK_VEHICLES = [
  {
    id: "veh-001",
    model_name: "VinFast VF 8",
    version: "Plus",
    category: "SUV",
    color: "Ocean Blue",
    image_url:
      "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=500",
    description: "Mid-size electric SUV with premium features",
    battery_capacity: 87.7,
    range_per_charge: 450,
    base_price: 1200000000,
    status: "available",
    launch_date: "2024-01-15",
  },
  {
    id: "veh-002",
    model_name: "VinFast VF 9",
    version: "Eco",
    category: "SUV",
    color: "Pearl White",
    image_url:
      "https://images.unsplash.com/photo-1617654112368-307921291f42?w=500",
    description: "Full-size electric SUV for families",
    battery_capacity: 123.0,
    range_per_charge: 680,
    base_price: 1500000000,
    status: "available",
    launch_date: "2024-02-20",
  },
  {
    id: "veh-003",
    model_name: "VinFast VF 5",
    version: "Base",
    category: "Compact",
    color: "Red Metallic",
    image_url:
      "https://images.unsplash.com/photo-1542362567-b07e54358753?w=500",
    description: "Compact city electric vehicle",
    battery_capacity: 42.0,
    range_per_charge: 300,
    base_price: 500000000,
    status: "available",
    launch_date: "2024-03-10",
  },
];

// Mock Dealers Data
export const MOCK_DEALERS = [
  {
    id: "dealer-001",
    name: "Premium EV Dealer Hanoi",
    address: "123 Tran Duy Hung, Cau Giay, Hanoi",
    phone: "024-1234-5678",
    email: "contact@dealer1.com",
    contract_number: "CTR-2024-001",
    sales_target: 50000000000,
    is_active: true,
  },
  {
    id: "dealer-002",
    name: "City EV Center HCMC",
    address: "456 Nguyen Hue, District 1, HCMC",
    phone: "028-9876-5432",
    email: "contact@dealer2.com",
    contract_number: "CTR-2024-002",
    sales_target: 75000000000,
    is_active: true,
  },
];

// Mock Customers Data
export const MOCK_CUSTOMERS = [
  {
    id: "cust-001",
    full_name: "Nguyen Van A",
    phone: "0901234567",
    email: "nguyenvana@example.com",
    address: "789 Le Loi, District 1, HCMC",
    dealer_staff_id: "4",
    created_at: "2024-06-15",
  },
  {
    id: "cust-002",
    full_name: "Tran Thi B",
    phone: "0912345678",
    email: "tranthib@example.com",
    address: "321 Hoang Hoa Tham, Ba Dinh, Hanoi",
    dealer_staff_id: "4",
    created_at: "2024-07-20",
  },
];

// Mock Orders Data
export const MOCK_ORDERS = [
  {
    id: "ord-001",
    customer_id: "cust-001",
    dealer_staff_id: "4",
    vehicle_id: "veh-001",
    dealer_id: "dealer-001",
    total_price: 1200000000,
    order_status: "confirmed",
    payment_status: "partial_paid",
    payment_type: "installment",
    created_at: "2024-08-01",
    delivered_at: null,
  },
  {
    id: "ord-002",
    customer_id: "cust-002",
    dealer_staff_id: "4",
    vehicle_id: "veh-003",
    dealer_id: "dealer-001",
    total_price: 500000000,
    order_status: "delivered",
    payment_status: "paid",
    payment_type: "full",
    created_at: "2024-07-25",
    delivered_at: "2024-08-15",
  },
];

// Mock Inventory Data
export const MOCK_INVENTORY = [
  {
    id: "inv-001",
    vehicle_id: "veh-001",
    dealer_id: "dealer-001",
    vin_number: "VIN123456789ABC001",
    status: "available",
    created_at: "2024-06-01",
  },
  {
    id: "inv-002",
    vehicle_id: "veh-001",
    dealer_id: "dealer-001",
    vin_number: "VIN123456789ABC002",
    status: "available",
    created_at: "2024-06-01",
  },
  {
    id: "inv-003",
    vehicle_id: "veh-002",
    dealer_id: "dealer-001",
    vin_number: "VIN123456789ABC003",
    status: "sold",
    created_at: "2024-06-05",
  },
  {
    id: "inv-004",
    vehicle_id: "veh-003",
    dealer_id: "dealer-001",
    vin_number: "VIN123456789ABC004",
    status: "available",
    created_at: "2024-06-10",
  },
];


// Mock Appointments Data
export const MOCK_APPOINTMENTS = [
  {
    id: "appt-001",
    customer_id: "cust-001",
    dealer_staff_id: "4",
    vehicle_id: "veh-001",
    appointment_date: "2024-09-30T10:00:00",
    status: "Scheduled",
  },
  {
    id: "appt-002",
    customer_id: "cust-002",
    dealer_staff_id: "4",
    vehicle_id: "veh-002",
    appointment_date: "2024-10-02T14:00:00",
    status: "Scheduled",
  },

  {
    id: "appt-003",
    customer_id: "cust-003",
    dealer_staff_id: "4",
    vehicle_id: "veh-003",
    appointment_date: "2024-10-05T09:00:00",
    status: "Pending",
  }

];

// Mock Vehicle Requests Data
export const MOCK_VEHICLE_REQUESTS = [];
