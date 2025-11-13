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
import { orderApi, customerApi } from "../../../services/mockApi";
import { useAuth } from "../../../hooks/useAuth";
import CarDetail from "../DealerStaff/CarDetail";

const CATEGORY_OPTIONS = [
  { value: "SUV điện", label: "SUV điện" },
  { value: "SUV điện 7 chỗ", label: "SUV điện 7 chỗ" },
  { value: "Sedan điện", label: "Sedan điện" },
  { value: "Hatchback điện", label: "Hatchback điện" },
];

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

const getStockVariant = (stock) => {
  if (stock === 0) return "danger";
  if (stock <= 5) return "warning";
  return "success";
};

function DealerManagerVehiclesPage() {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderVehicle, setOrderVehicle] = useState(null);
  const [orderForm, setOrderForm] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    customerGmail: "",
    paymentType: "full",
    quantity: 1,
  });
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");

  const openOrderModal = (vehicle) => {
    setOrderVehicle(vehicle);
    setOrderForm({
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      customerGmail: "",
      paymentType: "full",
      quantity: 1,
    });
    setOrderError("");
    setShowOrderModal(true);
  };
  const closeOrderModal = () => {
    setShowOrderModal(false);
    setOrderVehicle(null);
    setOrderError("");
  };
  const handleOrderInputChange = (e) => {
    const { name, value, type } = e.target;
    // Autofill logic for phone number
    if (name === "customerPhone") {
      const matched = customers.find(c => c.phone.trim() === value.trim());
      if (matched) {
        setOrderForm(prev => ({
          ...prev,
          customerPhone: value,
          customerName: matched.full_name || "",
          customerAddress: matched.address || "",
          customerGmail: matched.email || ""
        }));
        return;
      }
    }
    setOrderForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };
  const [detailVehicle, setDetailVehicle] = useState(null);
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [formData, setFormData] = useState({
    modelName: "",
    version: "",
    category: "",
    color: "",
    imageUrl: "",
    description: "",
    batteryCapacity: "",
    rangePerCharge: "",
    basePrice: "",
    launchDate: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const [showFeedbackPrompt, setShowFeedbackPrompt] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);

  // Selling price modal state
  const [showSellingPriceModal, setShowSellingPriceModal] = useState(false);
  const [editingPriceVehicle, setEditingPriceVehicle] = useState(null);
  const [newSellingPrice, setNewSellingPrice] = useState("");
  const [priceError, setPriceError] = useState("");
  const [isPriceSubmitting, setIsPriceSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchVehicles();
    }
  }, [user]);

  useEffect(() => {
    filterVehicles();
  }, [searchQuery, statusFilter, vehicles]);

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

  const openCreateModal = () => {
    setModalMode("create");
    setEditingVehicle(null);
    setFormData({
      modelName: "",
      version: "",
      category: "",
      color: "",
      imageUrl: "",
      description: "",
      batteryCapacity: "",
      rangePerCharge: "",
      basePrice: "",
      launchDate: "",
    });
    setFormErrors({});
    setAlert({ type: "", message: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (vehicle) => {
    setModalMode("edit");
    setEditingVehicle(vehicle);
    setFormData({
      modelName: vehicle.modelName,
      version: vehicle.version,
      category: vehicle.category,
      color: vehicle.color,
      imageUrl: vehicle.imageUrl,
      description: vehicle.description,
      batteryCapacity: vehicle.batteryCapacity.toString(),
      rangePerCharge: vehicle.rangePerCharge.toString(),
      basePrice: vehicle.basePrice.toString(),
      launchDate: vehicle.launchDate
        ? new Date(vehicle.launchDate).toISOString().split("T")[0]
        : "",
    });
    setFormErrors({});
    setAlert({ type: "", message: "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
    setFormData({
      modelName: "",
      version: "",
      category: "",
      color: "",
      imageUrl: "",
      description: "",
      batteryCapacity: "",
      rangePerCharge: "",
      basePrice: "",
      launchDate: "",
    });
    setFormErrors({});
    setAlert({ type: "", message: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.modelName.trim()) errors.modelName = "Model name is required";
    if (!formData.version.trim()) errors.version = "Version is required";
    if (!formData.category) errors.category = "Category is required";
    if (!formData.color.trim()) errors.color = "Color is required";
    if (!formData.imageUrl.trim()) errors.imageUrl = "Image URL is required";
    if (!formData.description.trim())
      errors.description = "Description is required";

    if (!formData.batteryCapacity) {
      errors.batteryCapacity = "Battery capacity is required";
    } else if (
      isNaN(formData.batteryCapacity) ||
      Number(formData.batteryCapacity) <= 0
    ) {
      errors.batteryCapacity = "Battery capacity must be a positive number";
    }

    if (!formData.rangePerCharge) {
      errors.rangePerCharge = "Range per charge is required";
    } else if (
      isNaN(formData.rangePerCharge) ||
      Number(formData.rangePerCharge) <= 0
    ) {
      errors.rangePerCharge = "Range per charge must be a positive number";
    }

    if (!formData.basePrice) {
      errors.basePrice = "Base price is required";
    } else if (isNaN(formData.basePrice) || Number(formData.basePrice) <= 0) {
      errors.basePrice = "Base price must be a positive number";
    }

    if (!formData.launchDate) errors.launchDate = "Launch date is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setAlert({ type: "error", message: "Please fix the errors below" });
      return;
    }

    setIsSubmitting(true);
    setAlert({ type: "", message: "" });

    try {
      const vehicleData = {
        modelName: formData.modelName.trim(),
        version: formData.version.trim(),
        category: formData.category,
        color: formData.color.trim(),
        imageUrl: formData.imageUrl.trim(),
        description: formData.description.trim(),
        batteryCapacity: Number(formData.batteryCapacity),
        rangePerCharge: Number(formData.rangePerCharge),
        basePrice: Number(formData.basePrice),
        launchDate: new Date(formData.launchDate).toISOString(),
      };

      if (modalMode === "create") {
        const response = await vehicleApi.create(vehicleData);
        if (response.isSuccess) {
          await fetchVehicles();
          setAlert({
            type: "success",
            message: response.messages?.[0] || "Vehicle created successfully!",
          });
          setTimeout(() => {
            closeModal();
          }, 1500);
        } else {
          setAlert({
            type: "error",
            message: response.messages?.[0] || "Failed to create vehicle",
          });
        }
      } else {
        const response = await vehicleApi.update(
          editingVehicle.id,
          vehicleData
        );
        if (response.isSuccess) {
          await fetchVehicles();
          setAlert({
            type: "success",
            message: response.messages?.[0] || "Vehicle updated successfully!",
          });
          setTimeout(() => {
            closeModal();
          }, 1500);
        } else {
          setAlert({
            type: "error",
            message: response.messages?.[0] || "Failed to update vehicle",
          });
        }
      }
    } catch (error) {
      console.error("Error submitting vehicle:", error);
      const errorMessage =
        error.response?.data?.messages?.[0] ||
        error.message ||
        `Failed to ${modalMode} vehicle. Please try again.`;
      setAlert({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!user?.id) return;
      try {
        const data = await customerApi.getAll(user.id);
        setCustomers(Array.isArray(data) ? data : []);
      } catch (err) { }
    };
    fetchCustomers();
  }, [user?.id]);

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setOrderError("");
    setOrderSubmitting(true);
    try {
      if (
        !orderForm.customerName.trim() ||
        !orderForm.customerPhone.trim() ||
        !orderForm.customerAddress.trim() ||
        !orderForm.customerGmail.trim()
      ) {
        setOrderError("Please fill in all required customer information.");
        setOrderSubmitting(false);
        return;
      }
      let customer = customers.find(
        (c) =>
          c.phone.trim() === orderForm.customerPhone.trim()
      );
      let customer_id = customer ? customer.id : null;
      if (!customer_id) {
        const payload = {
          full_name: orderForm.customerName.trim(),
          phone: orderForm.customerPhone.trim(),
          address: orderForm.customerAddress.trim(),
          email: orderForm.customerGmail.trim(),
          dealer_staff_id: user?.id,
          is_active: true,
        };
        const newCustomer = await customerApi.create(payload);
        customer_id = newCustomer.id;
        setCustomers((prev) => [newCustomer, ...prev]);
      }
      const qty = orderForm.quantity || 1;
      const price = orderVehicle
        ? orderVehicle.basePrice || orderVehicle.base_price || 0
        : 0;
      const payload = {
        customer_id,
        dealer_staff_id: user?.id,
        dealer_id: user?.dealer_id,
        vehicle_id: orderVehicle.id,
        total_amount: price * qty,
        payment_type: orderForm.paymentType,
        order_status: "confirmed",
        quantity: qty,
        customer_gmail: orderForm.customerGmail,
      };
      const created = await orderApi.create(payload);
      setOrders((prev) => [created, ...prev]);
      setOrderError("");
      setOrderSubmitting(false);
      setShowOrderModal(false);
      setShowFeedbackPrompt(true);
    } catch (err) {
      setOrderError("Failed to create order. Please try again.");
      setOrderSubmitting(false);
    }
  };

  const handleFeedbackNo = () => {
    setShowFeedbackPrompt(false);
    setShowFeedbackForm(false);
    setFeedbackText("");
    setShowThankYou(false);
  };
  const handleFeedbackYes = () => {
    setShowFeedbackPrompt(false);
    setShowFeedbackForm(true);
    setFeedbackText("");
    setShowThankYou(false);
  };
  const handleSendFeedback = (e) => {
    e.preventDefault();
    setShowFeedbackForm(false);
    setShowThankYou(true);
  };

  // Selling price handlers
  const openSellingPriceModal = (vehicle) => {
    setEditingPriceVehicle(vehicle);
    setNewSellingPrice(vehicle.sellingPrice?.toString() || "");
    setPriceError("");
    setShowSellingPriceModal(true);
  };

  const closeSellingPriceModal = () => {
    setShowSellingPriceModal(false);
    setEditingPriceVehicle(null);
    setNewSellingPrice("");
    setPriceError("");
  };

  const handleSellingPriceSubmit = async (e) => {
    e.preventDefault();
    setPriceError("");

    // Validate selling price
    const price = Number(newSellingPrice);
    if (!newSellingPrice || isNaN(price) || price <= 0) {
      setPriceError("Please enter a valid selling price");
      return;
    }

    if (editingPriceVehicle && price > editingPriceVehicle.basePrice) {
      setPriceError("Selling price cannot be greater than base price");
      return;
    }

    setIsPriceSubmitting(true);

    try {
      const response = await vehicleApi.setDealerPrice(user.id, {
        vehicleId: editingPriceVehicle.id,
        sellingPrice: price,
      });

      if (response.isSuccess) {
        setAlert({
          type: "success",
          message:
            response.messages?.[0] || "Selling price updated successfully!",
        });
        // Refresh vehicles to get updated data
        await fetchVehicles();
        closeSellingPriceModal();
      } else {
        setPriceError(
          response.messages?.[0] || "Failed to update selling price"
        );
      }
    } catch (error) {
      console.error("Error updating selling price:", error);
      setPriceError(
        error.response?.data?.messages?.[0] ||
        error.message ||
        "Failed to update selling price"
      );
    } finally {
      setIsPriceSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Vehicle Management
            </h1>
            <p className="text-slate-400 mt-1">
              Manage vehicle models, specifications, and catalog
            </p>
          </div>
          <Button onClick={openCreateModal}>
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Vehicle
          </Button>
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

        {/* Vehicle Table */}
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

                  {/* Pricing Section in Detail View */}
                  <div className="bg-slate-900 rounded-lg p-4 mb-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-base text-slate-400">
                        Base Price:
                      </span>
                      <span className="text-lg font-semibold text-slate-300">
                        {formatCurrency(detailVehicle.basePrice)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-base text-slate-400">
                        Selling Price:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-blue-400">
                          {detailVehicle.sellingPrice
                            ? formatCurrency(detailVehicle.sellingPrice)
                            : "Not Set"}
                        </span>
                        <button
                          onClick={() => {
                            const vehicleToEdit = detailVehicle;
                            setDetailVehicle(null);
                            openSellingPriceModal(vehicleToEdit);
                          }}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Edit selling price"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                      <span className="text-base text-slate-400">
                        Final Price:
                      </span>
                      <span className="text-3xl font-bold text-orange-400">
                        {formatCurrency(detailVehicle.finalPrice)}
                      </span>
                    </div>
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
                    : "Get started by adding your first vehicle"
                }
                action={openCreateModal}
                actionLabel="Add Vehicle"
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

                      {/* Pricing Section */}
                      <div className="bg-slate-900 rounded-lg p-3 mb-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">
                            Base Price:
                          </span>
                          <span className="text-sm font-semibold text-slate-300">
                            {formatCurrency(vehicle.basePrice)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">
                            Selling Price:
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-blue-400">
                              {vehicle.sellingPrice
                                ? formatCurrency(vehicle.sellingPrice)
                                : "Not Set"}
                            </span>
                            <button
                              onClick={() => openSellingPriceModal(vehicle)}
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title="Edit selling price"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                          <span className="text-xs text-slate-400">
                            Final Price:
                          </span>
                          <span className="text-lg font-bold text-orange-400">
                            {formatCurrency(vehicle.finalPrice)}
                          </span>
                        </div>
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

        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={modalMode === "create" ? "Add New Vehicle" : "Edit Vehicle"}
          size="lg"
        >
          <form onSubmit={handleSubmit}>
            <Alert type={alert.type} message={alert.message} />

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  id="modelName"
                  name="modelName"
                  label="Model Name"
                  value={formData.modelName}
                  onChange={handleInputChange}
                  error={formErrors.modelName}
                  placeholder="e.g., VinFast VF 8"
                  required
                />
                <InputField
                  id="version"
                  name="version"
                  label="Version"
                  value={formData.version}
                  onChange={handleInputChange}
                  error={formErrors.version}
                  placeholder="e.g., Plus, Eco"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  id="category"
                  name="category"
                  label="Category"
                  value={formData.category}
                  onChange={handleInputChange}
                  options={CATEGORY_OPTIONS}
                  error={formErrors.category}
                  placeholder="Select category"
                  required
                />
                <InputField
                  id="color"
                  name="color"
                  label="Color"
                  value={formData.color}
                  onChange={handleInputChange}
                  error={formErrors.color}
                  placeholder="e.g., Trắng Ngọc Trai"
                  required
                />
              </div>

              <InputField
                id="imageUrl"
                name="imageUrl"
                label="Image URL"
                value={formData.imageUrl}
                onChange={handleInputChange}
                error={formErrors.imageUrl}
                placeholder="https://example.com/vehicle-image.jpg"
                required
              />

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-4 py-3 bg-slate-700 border ${formErrors.description
                      ? "border-red-500"
                      : "border-slate-600"
                    } rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                  placeholder="Enter vehicle description..."
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-400">
                    {formErrors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  id="batteryCapacity"
                  name="batteryCapacity"
                  type="number"
                  label="Battery Capacity (kWh)"
                  value={formData.batteryCapacity}
                  onChange={handleInputChange}
                  error={formErrors.batteryCapacity}
                  placeholder="e.g., 90"
                  required
                />
                <InputField
                  id="rangePerCharge"
                  name="rangePerCharge"
                  type="number"
                  label="Range Per Charge (km)"
                  value={formData.rangePerCharge}
                  onChange={handleInputChange}
                  error={formErrors.rangePerCharge}
                  placeholder="e.g., 470"
                  required
                />
              </div>

              <InputField
                id="basePrice"
                name="basePrice"
                type="number"
                label="Base Price (VND)"
                value={formData.basePrice}
                onChange={handleInputChange}
                error={formErrors.basePrice}
                placeholder="e.g., 1250000000"
                required
              />

              <InputField
                id="launchDate"
                name="launchDate"
                type="date"
                label="Launch Date"
                value={formData.launchDate}
                onChange={handleInputChange}
                error={formErrors.launchDate}
                required
              />
            </div>

            <Modal.Footer>
              <Button
                type="button"
                variant="secondary"
                onClick={closeModal}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                {modalMode === "create" ? "Create Vehicle" : "Update Vehicle"}
              </Button>
            </Modal.Footer>
          </form>
        </Modal>

        <Modal
          isOpen={showOrderModal}
          onClose={closeOrderModal}
          title="Create Order"
          size="lg"
        >
          {orderVehicle && (
            <form className="space-y-6" onSubmit={handleOrderSubmit}>
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
              <div>
                <div className="font-semibold text-white mb-2">
                  Nhập thông tin đơn hàng
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    id="customerName"
                    name="customerName"
                    label="Họ tên"
                    value={orderForm.customerName}
                    onChange={handleOrderInputChange}
                    placeholder="Nhập họ tên khách hàng"
                    required
                  />
                  <InputField
                    id="customerPhone"
                    name="customerPhone"
                    label="Số điện thoại"
                    value={orderForm.customerPhone}
                    onChange={handleOrderInputChange}
                    placeholder="Nhập số điện thoại"
                    required
                  />
                  <InputField
                    id="customerAddress"
                    name="customerAddress"
                    label="Địa chỉ"
                    value={orderForm.customerAddress}
                    onChange={handleOrderInputChange}
                    placeholder="Nhập địa chỉ"
                    required
                  />
                  <InputField
                    id="customerGmail"
                    name="customerGmail"
                    label="Gmail"
                    value={orderForm.customerGmail}
                    onChange={handleOrderInputChange}
                    placeholder="Nhập gmail khách hàng"
                    required
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

        {/* Selling Price Modal */}
        <Modal
          isOpen={showSellingPriceModal}
          onClose={closeSellingPriceModal}
          title="Set Selling Price"
          size="md"
        >
          {editingPriceVehicle && (
            <form onSubmit={handleSellingPriceSubmit} className="space-y-4">
              {/* Vehicle Info */}
              <div className="bg-slate-900 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={editingPriceVehicle.imageUrl}
                    alt={editingPriceVehicle.modelName}
                    className="w-20 h-16 object-cover rounded bg-slate-700"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/80x64?text=No+Image";
                    }}
                  />
                  <div>
                    <div className="font-bold text-white">
                      {editingPriceVehicle.modelName} -{" "}
                      {editingPriceVehicle.version}
                    </div>
                    <div className="text-sm text-slate-400">
                      Base Price:{" "}
                      {formatCurrency(editingPriceVehicle.basePrice)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Prices */}
              <div className="bg-slate-900 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">
                    Current Selling Price:
                  </span>
                  <span className="font-semibold text-white">
                    {editingPriceVehicle.sellingPrice
                      ? formatCurrency(editingPriceVehicle.sellingPrice)
                      : "Not Set"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">
                    Current Final Price:
                  </span>
                  <span className="font-semibold text-orange-400">
                    {formatCurrency(editingPriceVehicle.finalPrice)}
                  </span>
                </div>
              </div>

              {/* New Selling Price Input */}
              <InputField
                id="newSellingPrice"
                name="newSellingPrice"
                type="number"
                label="New Selling Price (VND)"
                value={newSellingPrice}
                onChange={(e) => setNewSellingPrice(e.target.value)}
                error={priceError}
                placeholder="Enter new selling price"
                required
              />

              <Modal.Footer>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeSellingPriceModal}
                  disabled={isPriceSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isPriceSubmitting}>
                  Update Price
                </Button>
              </Modal.Footer>
            </form>
          )}
        </Modal>
      </div>

      {/* Car Detail Modal for manager access */}
      {detailVehicle && (
        <CarDetail
          vehicle={detailVehicle}
          onClose={() => setDetailVehicle(null)}
        />
      )}
    </DashboardLayout>
  );
}

export default DealerManagerVehiclesPage;
