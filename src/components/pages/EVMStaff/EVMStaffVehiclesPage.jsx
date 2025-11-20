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
import { inventoryApi } from "../../../services/inventoryApi";
import { useAuth } from "../../../hooks/useAuth";

// Category options
const CATEGORY_OPTIONS = [
  { value: "SUV điện", label: "SUV điện" },
  { value: "SUV điện 7 chỗ", label: "SUV điện 7 chỗ" },
  { value: "Sedan điện", label: "Sedan điện" },
  { value: "Hatchback điện", label: "Hatchback điện" },
];

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

function EVMStaffVehiclesPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
  const [editingVehicle, setEditingVehicle] = useState(null);

  // Inventory modal states
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [selectedVehicleForInventory, setSelectedVehicleForInventory] =
    useState(null);
  const [inventoryQuantity, setInventoryQuantity] = useState("");
  const [inventoryError, setInventoryError] = useState("");
  const [isAddingInventory, setIsAddingInventory] = useState(false);

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    modelName: "",
    version: "",
    category: "",
    color: "",
    imageUrl: "", // For edit mode
    imageFile: null, // For create mode
    description: "",
    batteryCapacity: "",
    rangePerCharge: "",
    basePrice: "",
    status: "", // For edit mode
    launchDate: "",
    // Send empty value flags (only for create mode)
    sendEmptyModelName: false,
    sendEmptyBasePrice: false,
    sendEmptyVersion: false,
    sendEmptyCategory: false,
    sendEmptyColor: false,
    sendEmptyImageUrl: false,
    sendEmptyDescription: false,
    sendEmptyBatteryCapacity: false,
    sendEmptyRangePerCharge: false,
    sendEmptyLaunchDate: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

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

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.modelName.toLowerCase().includes(query) ||
          vehicle.version.toLowerCase().includes(query) ||
          vehicle.category.toLowerCase().includes(query)
      );
    }

    // Status filter
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
      imageFile: null,
      description: "",
      batteryCapacity: "",
      rangePerCharge: "",
      basePrice: "",
      status: "",
      launchDate: "",
      sendEmptyModelName: false,
      sendEmptyBasePrice: false,
      sendEmptyVersion: false,
      sendEmptyCategory: false,
      sendEmptyColor: false,
      sendEmptyImageUrl: false,
      sendEmptyDescription: false,
      sendEmptyBatteryCapacity: false,
      sendEmptyRangePerCharge: false,
      sendEmptyLaunchDate: false,
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
      imageUrl: vehicle.imageUrl, // Keep URL for edit mode
      imageFile: null,
      description: vehicle.description,
      batteryCapacity: vehicle.batteryCapacity.toString(),
      rangePerCharge: vehicle.rangePerCharge.toString(),
      basePrice: vehicle.basePrice.toString(),
      status: vehicle.status, // Add status for edit
      launchDate: vehicle.launchDate
        ? new Date(vehicle.launchDate).toISOString().split("T")[0]
        : "",
      // Reset sendEmpty flags (only used in create mode)
      sendEmptyModelName: false,
      sendEmptyBasePrice: false,
      sendEmptyVersion: false,
      sendEmptyCategory: false,
      sendEmptyColor: false,
      sendEmptyImageUrl: false,
      sendEmptyDescription: false,
      sendEmptyBatteryCapacity: false,
      sendEmptyRangePerCharge: false,
      sendEmptyLaunchDate: false,
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
      imageFile: null,
      description: "",
      batteryCapacity: "",
      rangePerCharge: "",
      basePrice: "",
      status: "",
      launchDate: "",
      sendEmptyModelName: false,
      sendEmptyBasePrice: false,
      sendEmptyVersion: false,
      sendEmptyCategory: false,
      sendEmptyColor: false,
      sendEmptyImageUrl: false,
      sendEmptyDescription: false,
      sendEmptyBatteryCapacity: false,
      sendEmptyRangePerCharge: false,
      sendEmptyLaunchDate: false,
    });
    setFormErrors({});
    setAlert({ type: "", message: "" });
  };

  const openInventoryModal = (vehicle) => {
    setSelectedVehicleForInventory(vehicle);
    setInventoryQuantity("");
    setInventoryError("");
    setIsInventoryModalOpen(true);
  };

  const closeInventoryModal = () => {
    setIsInventoryModalOpen(false);
    setSelectedVehicleForInventory(null);
    setInventoryQuantity("");
    setInventoryError("");
  };

  const openDeleteModal = (vehicle) => {
    setVehicleToDelete(vehicle);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setVehicleToDelete(null);
  };

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;

    setIsDeleting(true);

    try {
      const response = await vehicleApi.delete(vehicleToDelete.id);

      if (response.isSuccess) {
        setAlert({
          type: "success",
          message:
            response.messages?.[0] ||
            `Successfully deleted ${vehicleToDelete.modelName}`,
        });
        closeDeleteModal();
        await fetchVehicles();
      } else {
        setAlert({
          type: "error",
          message: response.messages?.[0] || "Failed to delete vehicle",
        });
      }
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      const errorMessage =
        error.response?.data?.messages?.[0] ||
        error.message ||
        "Failed to delete vehicle";
      setAlert({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddInventory = async () => {
    // Validation
    if (!inventoryQuantity || inventoryQuantity.trim() === "") {
      setInventoryError("Quantity is required");
      return;
    }

    const quantity = parseInt(inventoryQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      setInventoryError("Quantity must be a positive number");
      return;
    }

    setIsAddingInventory(true);
    setInventoryError("");

    try {
      const response = await inventoryApi.addInventory(
        selectedVehicleForInventory.id,
        quantity
      );

      if (response.isSuccess) {
        // Refresh vehicles to update stock count
        await fetchVehicles();
        setAlert({
          type: "success",
          message: `Successfully added ${quantity} units to ${selectedVehicleForInventory.modelName}`,
        });
        closeInventoryModal();
      } else {
        setInventoryError(response.messages?.[0] || "Failed to add inventory");
      }
    } catch (error) {
      console.error("Error adding inventory:", error);
      const errorMessage =
        error.response?.data?.messages?.[0] ||
        error.message ||
        "Failed to add inventory";
      setInventoryError(errorMessage);
    } finally {
      setIsAddingInventory(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, imageFile: file }));
    if (formErrors.imageFile) {
      setFormErrors((prev) => ({ ...prev, imageFile: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (modalMode === "create") {
      // Create mode: validate with sendEmpty flags
      if (!formData.sendEmptyModelName && !formData.modelName.trim()) {
        errors.modelName = "Model name is required";
      }
      if (!formData.sendEmptyVersion && !formData.version.trim()) {
        errors.version = "Version is required";
      }
      if (!formData.sendEmptyCategory && !formData.category) {
        errors.category = "Category is required";
      }
      if (!formData.sendEmptyColor && !formData.color.trim()) {
        errors.color = "Color is required";
      }
      if (!formData.sendEmptyImageUrl && !formData.imageFile) {
        errors.imageFile = "Image is required";
      }
      if (!formData.sendEmptyDescription && !formData.description.trim()) {
        errors.description = "Description is required";
      }
      if (!formData.sendEmptyBatteryCapacity) {
        if (!formData.batteryCapacity) {
          errors.batteryCapacity = "Battery capacity is required";
        } else if (
          isNaN(formData.batteryCapacity) ||
          Number(formData.batteryCapacity) <= 0
        ) {
          errors.batteryCapacity = "Battery capacity must be a positive number";
        }
      }
      if (!formData.sendEmptyRangePerCharge) {
        if (!formData.rangePerCharge) {
          errors.rangePerCharge = "Range per charge is required";
        } else if (
          isNaN(formData.rangePerCharge) ||
          Number(formData.rangePerCharge) <= 0
        ) {
          errors.rangePerCharge = "Range per charge must be a positive number";
        }
      }
      if (!formData.sendEmptyBasePrice) {
        if (!formData.basePrice) {
          errors.basePrice = "Base price is required";
        } else if (
          isNaN(formData.basePrice) ||
          Number(formData.basePrice) <= 0
        ) {
          errors.basePrice = "Base price must be a positive number";
        }
      }
      if (!formData.sendEmptyLaunchDate && !formData.launchDate) {
        errors.launchDate = "Launch date is required";
      }
    } else {
      // Edit mode: standard validation (no sendEmpty flags)
      if (!formData.modelName.trim()) {
        errors.modelName = "Model name is required";
      }
      if (!formData.version.trim()) {
        errors.version = "Version is required";
      }
      if (!formData.category) {
        errors.category = "Category is required";
      }
      if (!formData.color.trim()) {
        errors.color = "Color is required";
      }
      if (!formData.imageUrl.trim()) {
        errors.imageUrl = "Image URL is required";
      }
      if (!formData.description.trim()) {
        errors.description = "Description is required";
      }
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
      if (!formData.launchDate) {
        errors.launchDate = "Launch date is required";
      }
      if (!formData.status) {
        errors.status = "Status is required";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setAlert({ type: "error", message: "Please fix the errors below" });
      return;
    }

    // Confirmation for edit mode
    if (modalMode === "edit") {
      const confirmed = window.confirm(
        `Are you sure you want to update ${formData.modelName}?`
      );
      if (!confirmed) {
        return;
      }
    }

    setIsSubmitting(true);
    setAlert({ type: "", message: "" });

    try {
      if (modalMode === "create") {
        // Create mode: Use FormData for file upload
        const formDataToSend = new FormData();

        // Add fields conditionally based on send empty flags
        if (formData.sendEmptyModelName || formData.modelName.trim()) {
          formDataToSend.append("ModelName", formData.modelName.trim());
        }
        if (formData.sendEmptyVersion || formData.version.trim()) {
          formDataToSend.append("Version", formData.version.trim());
        }
        if (formData.sendEmptyCategory || formData.category) {
          formDataToSend.append("Category", formData.category);
        }
        if (formData.sendEmptyColor || formData.color.trim()) {
          formDataToSend.append("Color", formData.color.trim());
        }
        if (formData.imageFile) {
          formDataToSend.append("ImageUrl", formData.imageFile);
        } else if (formData.sendEmptyImageUrl) {
          formDataToSend.append("ImageUrl", "");
        }
        if (formData.sendEmptyDescription || formData.description.trim()) {
          formDataToSend.append("Description", formData.description.trim());
        }
        if (formData.sendEmptyBatteryCapacity || formData.batteryCapacity) {
          formDataToSend.append(
            "BatteryCapacity",
            formData.batteryCapacity || ""
          );
        }
        if (formData.sendEmptyRangePerCharge || formData.rangePerCharge) {
          formDataToSend.append(
            "RangePerCharge",
            formData.rangePerCharge || ""
          );
        }
        if (formData.sendEmptyBasePrice || formData.basePrice) {
          formDataToSend.append("BasePrice", formData.basePrice || "");
        }
        if (formData.sendEmptyLaunchDate || formData.launchDate) {
          formDataToSend.append("LaunchDate", formData.launchDate || "");
        }

        const response = await vehicleApi.createWithFormData(formDataToSend);
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
        // Edit mode: Use JSON format (all fields required, no sendEmpty flags)
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
          status: formData.status,
          launchDate: new Date(formData.launchDate).toISOString(),
        };

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

        {/* Alert */}
        {alert.message && <Alert type={alert.type} message={alert.message} />}

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
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" text="Loading vehicles..." />
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
            <Table>
              <Table.Header>
                <Table.HeaderCell>Vehicle</Table.HeaderCell>
                <Table.HeaderCell>Category</Table.HeaderCell>
                <Table.HeaderCell>Battery & Range</Table.HeaderCell>
                <Table.HeaderCell align="right">Base Price</Table.HeaderCell>
                <Table.HeaderCell align="center">In Stock</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell align="center">Actions</Table.HeaderCell>
              </Table.Header>
              <Table.Body>
                {filteredVehicles.map((vehicle) => (
                  <Table.Row key={vehicle.id}>
                    {/* Vehicle Info with Image */}
                    <Table.Cell>
                      <div className="flex items-center gap-3">
                        <img
                          src={vehicle.imageUrl}
                          alt={vehicle.modelName}
                          className="w-16 h-16 rounded-lg object-cover bg-slate-700"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/150?text=No+Image";
                          }}
                        />
                        <div>
                          <p className="font-semibold text-white">
                            {vehicle.modelName}
                          </p>
                          <p className="text-sm text-slate-400">
                            {vehicle.version}
                          </p>
                        </div>
                      </div>
                    </Table.Cell>

                    {/* Category */}
                    <Table.Cell>
                      <span className="text-slate-300">{vehicle.category}</span>
                    </Table.Cell>

                    {/* Battery & Range */}
                    <Table.Cell>
                      <div className="text-sm">
                        <p className="text-slate-300">
                          {vehicle.batteryCapacity} kWh
                        </p>
                        <p className="text-slate-500">
                          {vehicle.rangePerCharge} km
                        </p>
                      </div>
                    </Table.Cell>

                    {/* Price */}
                    <Table.Cell align="right">
                      <span className="font-semibold text-white">
                        {formatCurrency(vehicle.basePrice)}
                      </span>
                    </Table.Cell>

                    {/* Stock */}
                    <Table.Cell align="center">
                      <Badge variant={getStockVariant(vehicle.currentStock)}>
                        {vehicle.currentStock} units
                      </Badge>
                    </Table.Cell>

                    {/* Status */}
                    <Table.Cell>
                      <Badge variant={getStatusVariant(vehicle.status)}>
                        {vehicle.status}
                      </Badge>
                    </Table.Cell>

                    {/* Actions */}
                    <Table.Cell align="center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openInventoryModal(vehicle)}
                          className="text-green-400 hover:text-green-300 transition-colors"
                          title="Add inventory"
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
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => openEditModal(vehicle)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Edit vehicle"
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
                        <button
                          onClick={() => openDeleteModal(vehicle)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete vehicle"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Card>

        {/* Stats */}
        {!loading && vehicles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
              <p className="text-sm text-slate-400">Total Vehicles</p>
              <p className="text-2xl font-bold text-white mt-1">
                {filteredVehicles.length}
              </p>
            </div>
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
                {filteredVehicles.filter((v) => v.currentStock === 0).length}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add Inventory Modal */}
      <Modal
        isOpen={isInventoryModalOpen}
        onClose={closeInventoryModal}
        title="Add Inventory Stock"
        size="sm"
      >
        <div className="space-y-4">
          {selectedVehicleForInventory && (
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedVehicleForInventory.imageUrl}
                  alt={selectedVehicleForInventory.modelName}
                  className="w-16 h-16 rounded-lg object-cover bg-slate-600"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/150?text=No+Image";
                  }}
                />
                <div>
                  <p className="font-semibold text-white">
                    {selectedVehicleForInventory.modelName}
                  </p>
                  <p className="text-sm text-slate-400">
                    {selectedVehicleForInventory.version}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Current Stock:{" "}
                    <span className="text-white font-medium">
                      {selectedVehicleForInventory.currentStock} units
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <InputField
            id="inventoryQuantity"
            name="inventoryQuantity"
            type="number"
            label="Quantity to Add"
            value={inventoryQuantity}
            onChange={(e) => {
              setInventoryQuantity(e.target.value);
              setInventoryError("");
            }}
            error={inventoryError}
            placeholder="e.g., 100"
            min="1"
            required
          />

          <p className="text-sm text-slate-400">
            This will add the specified quantity to the manufacturer's inventory
            pool.
          </p>
        </div>

        <Modal.Footer>
          <Button
            type="button"
            variant="secondary"
            onClick={closeInventoryModal}
            disabled={isAddingInventory}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleAddInventory}
            isLoading={isAddingInventory}
          >
            Add Inventory
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalMode === "create" ? "Add New Vehicle" : "Edit Vehicle"}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <Alert type={alert.type} message={alert.message} />

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* Model Name */}
            <div>
              {modalMode === "create" && (
                <div className="flex items-center gap-2 mb-2">
                  <label className="flex items-center gap-2 text-sm text-slate-400">
                    <input
                      type="checkbox"
                      name="sendEmptyModelName"
                      checked={formData.sendEmptyModelName}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    Send empty value
                  </label>
                </div>
              )}
              <InputField
                id="modelName"
                name="modelName"
                label="Model Name"
                value={formData.modelName}
                onChange={handleInputChange}
                error={formErrors.modelName}
                placeholder="e.g., VinFast VF 8"
                required={modalMode === "edit" || !formData.sendEmptyModelName}
                disabled={modalMode === "create" && formData.sendEmptyModelName}
              />
            </div>

            {/* Version */}
            <div>
              {modalMode === "create" && (
                <div className="flex items-center gap-2 mb-2">
                  <label className="flex items-center gap-2 text-sm text-slate-400">
                    <input
                      type="checkbox"
                      name="sendEmptyVersion"
                      checked={formData.sendEmptyVersion}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    Send empty value
                  </label>
                </div>
              )}
              <InputField
                id="version"
                name="version"
                label="Version"
                value={formData.version}
                onChange={handleInputChange}
                error={formErrors.version}
                placeholder="e.g., Plus, Eco"
                required={modalMode === "edit" || !formData.sendEmptyVersion}
                disabled={modalMode === "create" && formData.sendEmptyVersion}
              />
            </div>

            {/* Category */}
            <div>
              {modalMode === "create" && (
                <div className="flex items-center gap-2 mb-2">
                  <label className="flex items-center gap-2 text-sm text-slate-400">
                    <input
                      type="checkbox"
                      name="sendEmptyCategory"
                      checked={formData.sendEmptyCategory}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    Send empty value
                  </label>
                </div>
              )}
              <Select
                id="category"
                name="category"
                label="Category"
                value={formData.category}
                onChange={handleInputChange}
                options={CATEGORY_OPTIONS}
                error={formErrors.category}
                placeholder="Select category"
                required={modalMode === "edit" || !formData.sendEmptyCategory}
                disabled={modalMode === "create" && formData.sendEmptyCategory}
              />
            </div>

            {/* Color */}
            <div>
              {modalMode === "create" && (
                <div className="flex items-center gap-2 mb-2">
                  <label className="flex items-center gap-2 text-sm text-slate-400">
                    <input
                      type="checkbox"
                      name="sendEmptyColor"
                      checked={formData.sendEmptyColor}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    Send empty value
                  </label>
                </div>
              )}
              <InputField
                id="color"
                name="color"
                label="Color"
                value={formData.color}
                onChange={handleInputChange}
                error={formErrors.color}
                placeholder="e.g., Trắng Ngọc Trai"
                required={modalMode === "edit" || !formData.sendEmptyColor}
                disabled={modalMode === "create" && formData.sendEmptyColor}
              />
            </div>

            {/* Image - Different for Create vs Edit */}
            <div>
              {modalMode === "create" && (
                <div className="flex items-center gap-2 mb-2">
                  <label className="flex items-center gap-2 text-sm text-slate-400">
                    <input
                      type="checkbox"
                      name="sendEmptyImageUrl"
                      checked={formData.sendEmptyImageUrl}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    Send empty value
                  </label>
                </div>
              )}

              {modalMode === "create" ? (
                // Create mode: File upload
                <>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Vehicle Image{" "}
                    {!formData.sendEmptyImageUrl && (
                      <span className="text-red-400">*</span>
                    )}
                  </label>
                  <input
                    id="imageFile"
                    name="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={formData.sendEmptyImageUrl}
                    className={`w-full px-4 py-3 bg-slate-700 border ${
                      formErrors.imageFile
                        ? "border-red-500"
                        : "border-slate-600"
                    } rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                  />
                  {formErrors.imageFile && (
                    <p className="mt-1 text-sm text-red-400">
                      {formErrors.imageFile}
                    </p>
                  )}
                  {formData.imageFile && (
                    <p className="mt-1 text-sm text-slate-400">
                      Selected: {formData.imageFile.name}
                    </p>
                  )}
                </>
              ) : (
                // Edit mode: URL input (no checkbox)
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
              )}
            </div>

            {/* Description */}
            <div>
              {modalMode === "create" && (
                <div className="flex items-center gap-2 mb-2">
                  <label className="flex items-center gap-2 text-sm text-slate-400">
                    <input
                      type="checkbox"
                      name="sendEmptyDescription"
                      checked={formData.sendEmptyDescription}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    Send empty value
                  </label>
                </div>
              )}
              <label
                htmlFor="description"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Description{" "}
                {(modalMode === "edit" || !formData.sendEmptyDescription) && (
                  <span className="text-red-400">*</span>
                )}
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                disabled={
                  modalMode === "create" && formData.sendEmptyDescription
                }
                className={`w-full px-4 py-3 bg-slate-700 border ${
                  formErrors.description ? "border-red-500" : "border-slate-600"
                } rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed`}
                placeholder="Enter vehicle description..."
              />
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-400">
                  {formErrors.description}
                </p>
              )}
            </div>

            {/* Battery Capacity */}
            <div>
              {modalMode === "create" && (
                <div className="flex items-center gap-2 mb-2">
                  <label className="flex items-center gap-2 text-sm text-slate-400">
                    <input
                      type="checkbox"
                      name="sendEmptyBatteryCapacity"
                      checked={formData.sendEmptyBatteryCapacity}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    Send empty value
                  </label>
                </div>
              )}
              <InputField
                id="batteryCapacity"
                name="batteryCapacity"
                type="number"
                label="Battery Capacity (kWh)"
                value={formData.batteryCapacity}
                onChange={handleInputChange}
                error={formErrors.batteryCapacity}
                placeholder="e.g., 90"
                required={
                  modalMode === "edit" || !formData.sendEmptyBatteryCapacity
                }
                disabled={
                  modalMode === "create" && formData.sendEmptyBatteryCapacity
                }
              />
            </div>

            {/* Range Per Charge */}
            <div>
              {modalMode === "create" && (
                <div className="flex items-center gap-2 mb-2">
                  <label className="flex items-center gap-2 text-sm text-slate-400">
                    <input
                      type="checkbox"
                      name="sendEmptyRangePerCharge"
                      checked={formData.sendEmptyRangePerCharge}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    Send empty value
                  </label>
                </div>
              )}
              <InputField
                id="rangePerCharge"
                name="rangePerCharge"
                type="number"
                label="Range Per Charge (km)"
                value={formData.rangePerCharge}
                onChange={handleInputChange}
                error={formErrors.rangePerCharge}
                placeholder="e.g., 470"
                required={
                  modalMode === "edit" || !formData.sendEmptyRangePerCharge
                }
                disabled={
                  modalMode === "create" && formData.sendEmptyRangePerCharge
                }
              />
            </div>

            {/* Base Price */}
            <div>
              {modalMode === "create" && (
                <div className="flex items-center gap-2 mb-2">
                  <label className="flex items-center gap-2 text-sm text-slate-400">
                    <input
                      type="checkbox"
                      name="sendEmptyBasePrice"
                      checked={formData.sendEmptyBasePrice}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    Send empty value
                  </label>
                </div>
              )}
              <InputField
                id="basePrice"
                name="basePrice"
                type="number"
                label="Base Price (VND)"
                value={formData.basePrice}
                onChange={handleInputChange}
                error={formErrors.basePrice}
                placeholder="e.g., 1250000000"
                required={modalMode === "edit" || !formData.sendEmptyBasePrice}
                disabled={modalMode === "create" && formData.sendEmptyBasePrice}
              />
            </div>

            {/* Launch Date */}
            <div>
              {modalMode === "create" && (
                <div className="flex items-center gap-2 mb-2">
                  <label className="flex items-center gap-2 text-sm text-slate-400">
                    <input
                      type="checkbox"
                      name="sendEmptyLaunchDate"
                      checked={formData.sendEmptyLaunchDate}
                      onChange={handleInputChange}
                      className="rounded"
                    />
                    Send empty value
                  </label>
                </div>
              )}
              <InputField
                id="launchDate"
                name="launchDate"
                type="date"
                label="Launch Date"
                value={formData.launchDate}
                onChange={handleInputChange}
                error={formErrors.launchDate}
                required={modalMode === "edit" || !formData.sendEmptyLaunchDate}
                disabled={
                  modalMode === "create" && formData.sendEmptyLaunchDate
                }
              />
            </div>

            {/* Status - Only for Edit Mode (no sendEmpty checkbox) */}
            {modalMode === "edit" && (
              <div>
                <Select
                  id="status"
                  name="status"
                  label="Status"
                  value={formData.status}
                  onChange={handleInputChange}
                  options={[
                    { value: "Available", label: "Available" },
                    { value: "Discontinued", label: "Discontinued" },
                    { value: "Coming Soon", label: "Coming Soon" },
                  ]}
                  error={formErrors.status}
                  placeholder="Select status"
                  required
                />
              </div>
            )}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Delete Vehicle"
        size="sm"
      >
        {vehicleToDelete && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-red-900/20 border border-red-700 rounded-lg">
              <svg
                className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <h4 className="text-white font-semibold">
                  Are you sure you want to delete this vehicle?
                </h4>
                <p className="text-slate-300 text-sm mt-1">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <img
                  src={vehicleToDelete.imageUrl}
                  alt={vehicleToDelete.modelName}
                  className="w-16 h-16 rounded-lg object-cover bg-slate-600"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/150?text=No+Image";
                  }}
                />
                <div>
                  <p className="font-semibold text-white">
                    {vehicleToDelete.modelName}
                  </p>
                  <p className="text-sm text-slate-400">
                    {vehicleToDelete.version}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Current Stock:{" "}
                    <span className="text-white font-medium">
                      {vehicleToDelete.currentStock} units
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <Modal.Footer>
          <Button
            type="button"
            variant="secondary"
            onClick={closeDeleteModal}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDeleteVehicle}
            isLoading={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete Vehicle
          </Button>
        </Modal.Footer>
      </Modal>
    </DashboardLayout>
  );
}

export default EVMStaffVehiclesPage;
