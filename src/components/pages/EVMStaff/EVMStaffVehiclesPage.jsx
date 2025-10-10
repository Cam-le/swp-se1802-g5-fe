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

function EVMStaffVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
  const [editingVehicle, setEditingVehicle] = useState(null);

  // Form states
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

  // Fetch vehicles on mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  // Filter vehicles when search or filter changes
  useEffect(() => {
    filterVehicles();
  }, [searchQuery, statusFilter, vehicles]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await vehicleApi.getAll();
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
    // Clear error for this field
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
      // Prepare vehicle data (backend handles evmId, evmName, and status automatically)
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
          // Add the new vehicle to the list
          setVehicles((prev) => [response.data, ...prev]);
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
          // Update the vehicle in the list
          setVehicles((prev) =>
            prev.map((v) => (v.id === editingVehicle.id ? response.data : v))
          );
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

                    {/* Status */}
                    <Table.Cell>
                      <Badge variant={getStatusVariant(vehicle.status)}>
                        {vehicle.status}
                      </Badge>
                    </Table.Cell>

                    {/* Actions */}
                    <Table.Cell align="center">
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
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Card>

        {/* Stats */}
        {!loading && vehicles.length > 0 && (
          <div className="text-sm text-slate-400">
            Showing {filteredVehicles.length} of {vehicles.length} vehicle(s)
          </div>
        )}
      </div>

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
            {/* Model Name & Version */}
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

            {/* Category & Color */}
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

            {/* Image URL */}
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

            {/* Description */}
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
                className={`w-full px-4 py-3 bg-slate-700 border ${
                  formErrors.description ? "border-red-500" : "border-slate-600"
                } rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                placeholder="Enter vehicle description..."
              />
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-400">
                  {formErrors.description}
                </p>
              )}
            </div>

            {/* Battery Capacity & Range */}
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

            {/* Base Price */}
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

            {/* Launch Date */}
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
    </DashboardLayout>
  );
}

export default EVMStaffVehiclesPage;
