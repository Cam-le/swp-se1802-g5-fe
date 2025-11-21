import { useState, useEffect } from "react";
import { DashboardLayout } from "../../layout";
import {
  Card,
  Table,
  Button,
  Modal,
  InputField,
  Select,
  SearchInput,
  Badge,
  LoadingSpinner,
  Alert,
  EmptyState,
} from "../../common";
import { formatCurrency, formatShortDate } from "../../../utils/helpers";
import { vehicleApi } from "../../../services/vehicleApi";
import dealerOrdersApi from "../../../services/dealerOrdersApi";
import { customerApi } from "../../../services/customerApi";
import { useAuth } from "../../../hooks/useAuth";

// Status badge variant mapping
const getStatusVariant = (status) => {
  switch (status) {
    case "Available":
      return "success";
    case "Discontinued":
      return "default";
    case "Coming Soon":
      return "info";
    default:
      return "default";
  }
};

// Stock badge variant based on quantity
const getStockVariant = (stock) => {
  if (stock === 0) return "danger";
  if (stock <= 5) return "warning";
  return "success";
};

// Order status badge mapping
const getOrderStatusVariant = (status) => {
  switch (status) {
    case "confirmed":
      return "success";
    case "pending":
      return "warning";
    case "delivered":
      return "info";
    case "cancelled":
      return "danger";
    default:
      return "default";
  }
};

// Payment status badge mapping
const getPaymentStatusVariant = (status) => {
  switch (status) {
    case "paid":
      return "success";
    case "partial_paid":
      return "warning";
    case "unpaid":
      return "danger";
    default:
      return "default";
  }
};

function VehiclesPage() {
  // Order modal state
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderVehicle, setOrderVehicle] = useState(null);
  const [orderForm, setOrderForm] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    customerGmail: "",
    paymentType: "full",
    quantity: 1,
    customerRequest: "",
  });
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [existingCustomer, setExistingCustomer] = useState(null);
  const [orderCustomerId, setOrderCustomerId] = useState(null);
  const [feedbackOrderInfo, setFeedbackOrderInfo] = useState(null);

  // Order review modal state
  const [showOrderReviewModal, setShowOrderReviewModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  const openOrderModal = (vehicle) => {
    setOrderVehicle(vehicle);
    setOrderForm({
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      customerGmail: "",
      paymentType: "full",
      quantity: 1,
      customerRequest: "",
    });
    setOrderError("");
    setExistingCustomer(null);
    setShowOrderModal(true);
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setOrderVehicle(null);
    setOrderError("");
    setExistingCustomer(null);
  };

  const closeOrderReviewModal = () => {
    if (createdOrder) {
      setFeedbackOrderInfo({
        orderId: createdOrder.id,
        customerId: orderCustomerId,
      });
    }
    setShowOrderReviewModal(false);

    setShowFeedbackPrompt(true);
  };

  // Handle phone input change with customer lookup
  const handleOrderPhoneChange = async (e) => {
    const phone = e.target.value;
    setOrderForm((prev) => ({ ...prev, customerPhone: phone }));

    // Clear existing customer if phone is cleared
    if (!phone) {
      setExistingCustomer(null);
      setOrderForm((prev) => ({
        ...prev,
        customerName: "",
        customerGmail: "",
        customerAddress: "",
      }));
      return;
    }

    // Lookup customer when phone is complete (at least 10 digits)
    if (phone.length >= 10) {
      try {
        const customer = await customerApi.getByPhone(phone);
        if (customer) {
          setExistingCustomer(customer);
          setOrderForm((prev) => ({
            ...prev,
            customerName: customer.fullName || "",
            customerGmail: customer.email || "",
            customerAddress: customer.address || "",
          }));
        } else {
          setExistingCustomer(null);
        }
      } catch (error) {
        console.error("Error fetching customer by phone:", error);
        setExistingCustomer(null);
      }
    }
  };

  const handleOrderInputChange = (e) => {
    const { name, value, type } = e.target;
    setOrderForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  // Car detail view state
  const [detailVehicle, setDetailVehicle] = useState(null);
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [alert, setAlert] = useState({ type: "", message: "" });

  // Feedback modal state
  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);

  // Fetch vehicles on mount
  useEffect(() => {
    if (user?.id) {
      fetchVehicles();
    }
  }, [user]);

  // Filter vehicles when search or filter changes
  useEffect(() => {
    filterVehicles();
  }, [searchQuery, statusFilter, vehicles]);

  const [customers, setCustomers] = useState([]);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!user?.id) return;
      try {
        const data = await customerApi.getAll();
        setCustomers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching customers:", err);
      }
    };
    fetchCustomers();
  }, [user?.id]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await vehicleApi.getAll(user.id);
      if (response.isSuccess) {
        setVehicles(response.data);
      } else {
        setAlert({
          type: "error",
          message: response.messages?.[0] || "Failed to load vehicles",
        });
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      const errorMessage =
        error.response?.data?.messages?.[0] ||
        error.message ||
        "Failed to load vehicles";
      setAlert({ type: "error", message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const filterVehicles = () => {
    let filtered = [...vehicles];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.modelName.toLowerCase().includes(query) ||
          vehicle.version.toLowerCase().includes(query) ||
          vehicle.category.toLowerCase().includes(query)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((vehicle) => vehicle.status === statusFilter);
    }

    setFilteredVehicles(filtered);
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setOrderError("");
    setOrderSubmitting(true);

    try {
      // Validate required fields
      if (
        !orderForm.customerName.trim() ||
        !orderForm.customerPhone.trim() ||
        !orderForm.customerAddress.trim()
      ) {
        setOrderError("Please fill in all required customer information.");
        setOrderSubmitting(false);
        return;
      }

      // Calculate price and quantity
      const qty = orderForm.quantity || 1;
      const price = orderVehicle ? orderVehicle.basePrice || 0 : 0;

      // Prepare payload matching backend API
      const payload = {
        dealerStaffId: user?.id,
        dealerId: user?.dealer_id,
        vehicleId: orderVehicle.id,
        customerName: orderForm.customerName.trim(),
        customerPhone: orderForm.customerPhone.trim(),
        customerEmail: orderForm.customerGmail?.trim() || "",
        customerAddress: orderForm.customerAddress.trim(),
        paymentType: orderForm.paymentType,
        totalPrice: price * qty,
      };

      const response = await dealerOrdersApi.create(payload);

      // Store the created order data
      setCreatedOrder(response);
      setOrderCustomerId(response.customerId);

      // Refetch customers
      try {
        const data = await customerApi.getAll();
        setCustomers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error refetching customers:", err);
      }

      setOrderError("");
      setOrderSubmitting(false);
      setShowOrderModal(false);

      // Show order review modal
      setShowOrderReviewModal(true);
    } catch (err) {
      console.error("Error creating order:", err);
      setOrderError(
        err.response?.data?.message ||
        "Failed to create order. Please try again."
      );
      setOrderSubmitting(false);
    }
  };

  // Feedback handlers
  const handleFeedbackNo = () => {
    setShowFeedbackPrompt(false);
    setShowFeedbackForm(false);
    setFeedbackText("");
    setShowThankYou(false);
    setCreatedOrder(null);
    setOrderCustomerId(null);
    setFeedbackOrderInfo(null);
  };

  const handleFeedbackYes = () => {
    setShowFeedbackPrompt(false);
    setShowFeedbackForm(true);
    setFeedbackText("");
    setShowThankYou(false);
  };

  const handleSendFeedback = async (e) => {
    e.preventDefault();

    if (!feedbackText.trim()) {
      console.log("Feedback text is empty");
      return;
    }

    console.log("Feedback Order Info:", feedbackOrderInfo);

    if (!feedbackOrderInfo || !feedbackOrderInfo.orderId || !feedbackOrderInfo.customerId) {
      console.error("Missing order or customer information");
      setShowFeedbackForm(false);
      setShowThankYou(true);
      return;
    }

    try {
      const feedbackData = {
        orderId: feedbackOrderInfo.orderId,
        customerId: feedbackOrderInfo.customerId,
        content: feedbackText.trim(),
      };

      console.log("Sending feedback:", feedbackData);

      const response = await vehicleApi.createFeedback(feedbackData);

      console.log("Feedback created successfully:", response);

      setShowFeedbackForm(false);
      setShowThankYou(true);
      setFeedbackText("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      console.error("Error response:", error.response?.data);
      setShowFeedbackForm(false);
      setShowThankYou(true);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Vehicle Catalog</h1>
            <p className="text-slate-400 mt-1">
              Browse available vehicles and create orders
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by model, version, or category..."
                className="w-full"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "", label: "All Statuses" },
                { value: "Available", label: "Available" },
                { value: "Discontinued", label: "Discontinued" },
                { value: "Coming Soon", label: "Coming Soon" },
              ]}
              placeholder="Filter by status"
            />
          </div>
        </Card>

        {/* Alert */}
        <Alert type={alert.type} message={alert.message} />

        {/* Vehicle Catalog */}
        <Card padding={false}>
          <div>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" text="Loading vehicles..." />
              </div>
            ) : detailVehicle ? (
              <div className="flex flex-col md:flex-row bg-slate-800 rounded-xl border border-slate-700 p-8 max-w-5xl mx-auto mt-8">
                <img
                  src={detailVehicle.imageUrl}
                  alt={detailVehicle.modelName}
                  className="w-full max-w-md h-80 object-cover rounded-lg bg-slate-700 mb-6 md:mb-0 md:mr-8"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x300?text=No+Image";
                  }}
                />
                <div className="flex-1 flex flex-col gap-2">
                  <h2 className="text-4xl font-bold text-white mb-2">
                    {detailVehicle.modelName}{" "}
                    <span className="text-2xl text-slate-400">
                      - {detailVehicle.version}
                    </span>
                  </h2>
                  <div className="text-lg text-slate-300 mb-4">
                    {detailVehicle.description}
                  </div>
                  <div className="flex flex-wrap gap-6 mb-2">
                    <div>
                      <span className="text-base text-slate-400">
                        Category:
                      </span>
                      <span className="ml-1 font-semibold text-white">
                        {detailVehicle.category}
                      </span>
                    </div>
                    <div>
                      <span className="text-base text-slate-400">Color:</span>
                      <span className="ml-1 font-semibold text-white">
                        {detailVehicle.color}
                      </span>
                    </div>
                    <div>
                      <span className="text-base text-slate-400">Status:</span>
                      <span className="ml-1 font-semibold">
                        <Badge>{detailVehicle.status}</Badge>
                      </span>
                    </div>
                    <div>
                      <span className="text-base text-slate-400">Stock:</span>
                      <span className="ml-1 font-semibold">
                        <Badge>{detailVehicle.currentStock}</Badge>
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-6 mb-2">
                    <div>
                      <span className="text-base text-slate-400">Range:</span>
                      <span className="ml-1 font-semibold text-white">
                        {detailVehicle.rangePerCharge} km
                      </span>
                    </div>
                    <div>
                      <span className="text-base text-slate-400">Battery:</span>
                      <span className="ml-1 font-semibold text-white">
                        {detailVehicle.batteryCapacity} kWh
                      </span>
                    </div>
                    <div>
                      <span className="text-base text-slate-400">
                        Launch Date:
                      </span>
                      <span className="ml-1 font-semibold text-white">
                        {detailVehicle.launchDate
                          ? formatShortDate(detailVehicle.launchDate)
                          : "-"}
                      </span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-orange-400 mb-4">
                    {formatCurrency(detailVehicle.basePrice)}
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => setDetailVehicle(null)}
                    className="mt-4 w-max self-end"
                  >
                    Return
                  </Button>
                </div>
              </div>
            ) : filteredVehicles.length === 0 ? (
              <EmptyState
                title="No vehicles found"
                description={
                  searchQuery || statusFilter
                    ? "Try adjusting your search or filters"
                    : "No vehicles available at the moment"
                }
                icon={
                  <svg
                    className="w-16 h-16 text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                }
              />
            ) : (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {filteredVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col w-full max-w-[420px] mx-auto transition-transform transition-shadow duration-200 ease-in-out hover:shadow-2xl hover:-translate-y-2 hover:scale-105"
                    >
                      <img
                        src={vehicle.imageUrl}
                        alt={vehicle.modelName}
                        className="w-full h-32 object-cover rounded mb-2 bg-slate-700"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/320x240?text=No+Image";
                        }}
                      />
                      <div className="flex flex-col gap-1 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-white">
                            {vehicle.modelName}
                          </span>
                          <span className="text-base text-slate-400">
                            - {vehicle.version}
                          </span>
                        </div>
                        <div className="text-sm text-slate-300 mb-1">
                          {vehicle.description}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-1 mb-1">
                        <div>
                          <span className="text-xs text-slate-400">Range:</span>
                          <span className="font-semibold text-white ml-1">
                            {vehicle.rangePerCharge} km
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400">
                            Battery:
                          </span>
                          <span className="font-semibold text-white ml-1">
                            {vehicle.batteryCapacity} kWh
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <span className="text-xs text-slate-400">
                            Status:
                          </span>
                          <span className="font-semibold ml-1">
                            <Badge variant={getStatusVariant(vehicle.status)}>
                              {vehicle.status}
                            </Badge>
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400">Stock:</span>
                          <span className="font-semibold ml-1">
                            <Badge
                              variant={getStockVariant(vehicle.currentStock)}
                            >
                              {vehicle.currentStock}
                            </Badge>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-slate-400">
                          Launch Date:
                        </span>
                        <span className="font-semibold text-white">
                          {vehicle.launchDate
                            ? formatShortDate(vehicle.launchDate)
                            : "-"}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-orange-400 mb-2">
                        {formatCurrency(vehicle.basePrice)}
                      </div>
                      <div className="flex gap-2 mt-auto">
                        <Button
                          variant="secondary"
                          className="w-full"
                          onClick={() => setDetailVehicle(vehicle)}
                        >
                          Detail
                        </Button>
                        <Button
                          variant="primary"
                          className="w-full !bg-blue-500 hover:!bg-blue-600 text-white font-semibold rounded transition-colors duration-150"
                          onClick={() => openOrderModal(vehicle)}
                        >
                          Buy
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                    <p className="text-sm text-slate-400">Total Stock</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {filteredVehicles.reduce(
                        (sum, v) => sum + (v.currentStock || 0),
                        0
                      )}
                    </p>
                  </div>
                  <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
                    <p className="text-sm text-slate-400">Out of Stock</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {
                        filteredVehicles.filter((v) => v.currentStock === 0)
                          .length
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Order Modal */}
        <Modal
          isOpen={showOrderModal}
          onClose={closeOrderModal}
          title="Create Order"
          size="lg"
        >
          {orderVehicle && (
            <form className="space-y-6" onSubmit={handleOrderSubmit}>
              {/* Vehicle Info */}
              <div className="flex flex-col md:flex-row gap-6 items-center border-b border-slate-700 pb-4 mb-4">
                <img
                  src={orderVehicle.imageUrl}
                  alt={orderVehicle.modelName}
                  className="w-32 h-24 object-cover rounded bg-slate-700 border border-slate-600"
                  onError={(e) =>
                  (e.target.src =
                    "https://via.placeholder.com/128x96?text=No+Image")
                  }
                />
                <div className="flex-1">
                  <div className="font-bold text-lg text-white">
                    {orderVehicle.modelName}{" "}
                    <span className="text-slate-400 font-normal">
                      {orderVehicle.version}
                    </span>
                  </div>
                  <div className="text-slate-300 text-sm">
                    {orderVehicle.category}
                  </div>
                  <div className="text-slate-400 text-sm mt-1">
                    Đơn giá:{" "}
                    <span className="font-semibold text-white">
                      {formatCurrency(orderVehicle.basePrice)}
                    </span>
                  </div>
                </div>
                <div className="text-slate-400 text-sm">
                  Số lượng:{" "}
                  <input
                    type="number"
                    min="1"
                    name="quantity"
                    value={orderForm.quantity}
                    onChange={handleOrderInputChange}
                    className="w-16 px-2 py-1 rounded bg-slate-700 text-white border border-slate-600"
                  />
                </div>
              </div>

              {/* Payment Type */}
              <div>
                <div className="font-semibold text-white mb-2">
                  Chọn phương thức thanh toán
                </div>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-slate-300">
                    <input
                      type="radio"
                      name="paymentType"
                      value="full"
                      checked={orderForm.paymentType === "full"}
                      onChange={handleOrderInputChange}
                      className="accent-blue-500"
                    />
                    Thanh toán toàn bộ
                  </label>
                  <label className="flex items-center gap-2 text-slate-300">
                    <input
                      type="radio"
                      name="paymentType"
                      value="installment"
                      checked={orderForm.paymentType === "installment"}
                      onChange={handleOrderInputChange}
                      className="accent-blue-500"
                    />
                    Trả góp/Installment
                  </label>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <div className="font-semibold text-white mb-2">
                  Nhập thông tin đơn hàng
                </div>
                {existingCustomer && (
                  <div className="bg-green-500/20 border border-green-500 text-green-300 px-3 py-2 rounded mb-3 text-sm">
                    Existing customer found
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    id="customerPhone"
                    name="customerPhone"
                    label="Số điện thoại *"
                    value={orderForm.customerPhone}
                    onChange={handleOrderPhoneChange}
                    placeholder="Nhập số điện thoại"
                    required
                  />
                  <InputField
                    id="customerName"
                    name="customerName"
                    label="Họ tên *"
                    value={orderForm.customerName}
                    onChange={handleOrderInputChange}
                    placeholder="Nhập họ tên khách hàng"
                    required
                    disabled={!!existingCustomer}
                  />
                  <InputField
                    id="customerAddress"
                    name="customerAddress"
                    label="Địa chỉ *"
                    value={orderForm.customerAddress}
                    onChange={handleOrderInputChange}
                    placeholder="Nhập địa chỉ"
                    required
                    disabled={!!existingCustomer}
                  />
                  <InputField
                    id="customerGmail"
                    name="customerGmail"
                    label="Gmail"
                    value={orderForm.customerGmail}
                    onChange={handleOrderInputChange}
                    placeholder="Nhập gmail"
                    disabled={!!existingCustomer}
                  />
                  <InputField
                    id="customerRequest"
                    name="customerRequest"
                    label="Yêu cầu"
                    value={orderForm.customerRequest}
                    onChange={handleOrderInputChange}
                    placeholder="Yêu cầu thêm (nếu có)"
                  />
                </div>
              </div>

              {orderError && (
                <div className="text-red-400 text-sm">{orderError}</div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={closeOrderModal}
                >
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  isLoading={orderSubmitting}
                >
                  Purchase
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* Order Review Modal */}
        <Modal
          isOpen={showOrderReviewModal}
          onClose={closeOrderReviewModal}
          title="Order Confirmation"
          size="lg"
        >
          {createdOrder && (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg text-center">
                <div className="font-bold text-lg mb-1">
                  ✓ Order Created Successfully!
                </div>
                <div className="text-sm">
                  Order ID: {createdOrder.id}
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="border-b border-slate-700 pb-4">
                <h3 className="font-semibold text-white mb-3">
                  Vehicle Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Model:</span>
                    <div className="text-white font-semibold">
                      {createdOrder.vehicleModelName}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Version:</span>
                    <div className="text-white font-semibold">
                      {createdOrder.vehicleVersion}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">VIN Number:</span>
                    <div className="text-white font-semibold">
                      {createdOrder.vinNumber || "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="border-b border-slate-700 pb-4">
                <h3 className="font-semibold text-white mb-3">
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Name:</span>
                    <div className="text-white font-semibold">
                      {createdOrder.customerName}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Phone:</span>
                    <div className="text-white font-semibold">
                      {createdOrder.customerPhone}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dealer Information */}
              <div className="border-b border-slate-700 pb-4">
                <h3 className="font-semibold text-white mb-3">
                  Dealer Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Dealer:</span>
                    <div className="text-white font-semibold">
                      {createdOrder.dealerName}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Staff:</span>
                    <div className="text-white font-semibold">
                      {createdOrder.dealerStaffName}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="border-b border-slate-700 pb-4">
                <h3 className="font-semibold text-white mb-3">
                  Order Details
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Payment Type:</span>
                    <div className="text-white font-semibold capitalize">
                      {createdOrder.paymentType === "installment"
                        ? "Trả góp/Installment"
                        : "Thanh toán toàn bộ"}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Total Price:</span>
                    <div className="text-orange-400 font-bold text-lg">
                      {formatCurrency(createdOrder.totalPrice)}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Order Status:</span>
                    <div className="font-semibold">
                      <Badge
                        variant={getOrderStatusVariant(
                          createdOrder.orderStatus
                        )}
                      >
                        {createdOrder.orderStatus}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Payment Status:</span>
                    <div className="font-semibold">
                      <Badge
                        variant={getPaymentStatusVariant(
                          createdOrder.paymentStatus
                        )}
                      >
                        {createdOrder.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Created At:</span>
                    <div className="text-white font-semibold">
                      {createdOrder.createdAt
                        ? formatShortDate(createdOrder.createdAt)
                        : "N/A"}
                    </div>
                  </div>
                  {createdOrder.deliveredAt && (
                    <div>
                      <span className="text-slate-400">Delivered At:</span>
                      <div className="text-white font-semibold">
                        {formatShortDate(createdOrder.deliveredAt)}
                      </div>
                    </div>
                  )}
                </div>
                {createdOrder.note && (
                  <div className="mt-4">
                    <span className="text-slate-400">Note:</span>
                    <div className="text-white mt-1 p-3 bg-slate-700 rounded">
                      {createdOrder.note}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="primary"
                  onClick={closeOrderReviewModal}
                  className="px-8"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Feedback Prompt Modal */}
        <Modal
          isOpen={showFeedbackPrompt}
          onClose={handleFeedbackNo}
          title="Feedback"
        >
          <div className="space-y-4 text-center">
            <div className="text-lg font-semibold text-white">
              Would you like to leave feedback about your experience?
            </div>
            <div className="flex justify-center gap-4 mt-6">
              <Button variant="secondary" onClick={handleFeedbackNo}>
                No, thanks
              </Button>
              <Button variant="primary" onClick={handleFeedbackYes}>
                Yes
              </Button>
            </div>
          </div>
        </Modal>

        {/* Feedback Form Modal */}
        <Modal
          isOpen={showFeedbackForm}
          onClose={handleFeedbackNo}
          title="Leave Feedback"
        >
          <form onSubmit={handleSendFeedback} className="space-y-4">
            <div className="text-lg font-semibold text-white">
              Please write your feedback about the dealer staff:
            </div>
            <textarea
              className="w-full min-h-[100px] p-3 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Type your feedback here..."
              required
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                type="button"
                onClick={handleFeedbackNo}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Send
              </Button>
            </div>
          </form>
        </Modal>

        {/* Thank You Note Modal */}
        <Modal
          isOpen={showThankYou}
          onClose={handleFeedbackNo}
          title="Thank You"
        >
          <div className="text-lg font-semibold text-white text-center py-8">
            Thank you for sending your feedback!
          </div>
          <div className="flex justify-center">
            <Button variant="primary" onClick={handleFeedbackNo}>
              Close
            </Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

export default VehiclesPage;