import { useState, useEffect } from "react";
import { DashboardLayout } from "../../layout";
import {
  Card,
  Table,
  Button,
  Modal,
  InputField,
  SearchInput,
  Badge,
  LoadingSpinner,
  Alert,
  EmptyState,
} from "../../common";
import { formatCurrency, formatShortDate } from "../../../utils/helpers";
import { dealerApi } from "../../../services/dealerApi";
import { useAuth } from "../../../hooks/useAuth";

// Status badge variant mapping
const getStatusVariant = (isActive) => {
  return isActive ? "success" : "danger";
};

function EVMStaffDealersPage() {
  const { user } = useAuth();
  const [dealers, setDealers] = useState([]);
  const [filteredDealers, setFilteredDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
  const [editingDealer, setEditingDealer] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    contractNumber: "",
    salesTarget: "",
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  useEffect(() => {
    fetchDealers();
  }, []);

  useEffect(() => {
    filterDealers();
  }, [searchQuery, statusFilter, dealers]);

  const fetchDealers = async () => {
    try {
      setLoading(true);
      const response = await dealerApi.getAll();
      if (response.isSuccess) {
        setDealers(response.data);
      } else {
        setAlert({
          type: "error",
          message: response.messages?.[0] || "Failed to load dealers",
        });
      }
    } catch (error) {
      console.error("Error fetching dealers:", error);
      const errorMessage =
        error.response?.data?.messages?.[0] ||
        error.message ||
        "Failed to load dealers";
      setAlert({ type: "error", message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const filterDealers = () => {
    let filtered = [...dealers];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (dealer) =>
          dealer.name.toLowerCase().includes(query) ||
          dealer.email.toLowerCase().includes(query) ||
          dealer.phone.includes(query) ||
          dealer.address.toLowerCase().includes(query) ||
          dealer.contractNumber.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((dealer) => dealer.isActive);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((dealer) => !dealer.isActive);
    }

    setFilteredDealers(filtered);
  };

  const openCreateModal = () => {
    setModalMode("create");
    setEditingDealer(null);
    setIsViewMode(false);
    setFormData({
      name: "",
      address: "",
      phone: "",
      email: "",
      contractNumber: "",
      salesTarget: "",
      isActive: true,
    });
    setFormErrors({});
    setAlert({ type: "", message: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (dealer) => {
    setModalMode("edit");
    setEditingDealer(dealer);
    setIsViewMode(false);
    setFormData({
      name: dealer.name,
      address: dealer.address,
      phone: dealer.phone,
      email: dealer.email,
      contractNumber: dealer.contractNumber,
      salesTarget: dealer.salesTarget.toString(),
      isActive: dealer.isActive,
    });
    setFormErrors({});
    setAlert({ type: "", message: "" });
    setIsModalOpen(true);
  };

  const openViewModal = (dealer) => {
    setModalMode("view");
    setEditingDealer(dealer);
    setIsViewMode(true);
    setFormData({
      name: dealer.name,
      address: dealer.address,
      phone: dealer.phone,
      email: dealer.email,
      contractNumber: dealer.contractNumber,
      salesTarget: dealer.salesTarget.toString(),
      isActive: dealer.isActive,
    });
    setFormErrors({});
    setAlert({ type: "", message: "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDealer(null);
    setIsViewMode(false);
    setFormData({
      name: "",
      address: "",
      phone: "",
      email: "",
      contractNumber: "",
      salesTarget: "",
      isActive: true,
    });
    setFormErrors({});
    setAlert({ type: "", message: "" });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = "Dealer name is required";
    if (!formData.address.trim()) errors.address = "Address is required";

    if (!formData.phone.trim()) {
      errors.phone = "Phone is required";
    } else if (!/^\d{10,11}$/.test(formData.phone.replace(/[^0-9]/g, ""))) {
      errors.phone = "Phone must be 10-11 digits";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (!formData.contractNumber.trim()) {
      errors.contractNumber = "Contract number is required";
    }

    if (!formData.salesTarget) {
      errors.salesTarget = "Sales target is required";
    } else if (
      isNaN(formData.salesTarget) ||
      Number(formData.salesTarget) < 0
    ) {
      errors.salesTarget = "Sales target must be a non-negative number";
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

    setIsSubmitting(true);
    setAlert({ type: "", message: "" });

    try {
      const dealerData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        contractNumber: formData.contractNumber.trim(),
        salesTarget: Number(formData.salesTarget),
        isActive: formData.isActive,
      };

      if (modalMode === "create") {
        const response = await dealerApi.create(dealerData);
        if (response.isSuccess) {
          setDealers((prev) => [response.data, ...prev]);
          setAlert({
            type: "success",
            message: response.messages?.[0] || "Dealer created successfully!",
          });
          setTimeout(() => {
            closeModal();
          }, 1500);
        } else {
          setAlert({
            type: "error",
            message: response.messages?.[0] || "Failed to create dealer",
          });
        }
      } else {
        const response = await dealerApi.update(editingDealer.id, dealerData);
        if (response.isSuccess) {
          setDealers((prev) =>
            prev.map((d) => (d.id === editingDealer.id ? response.data : d))
          );
          setAlert({
            type: "success",
            message: response.messages?.[0] || "Dealer updated successfully!",
          });
          setTimeout(() => {
            closeModal();
          }, 1500);
        } else {
          setAlert({
            type: "error",
            message: response.messages?.[0] || "Failed to update dealer",
          });
        }
      }
    } catch (error) {
      console.error("Error submitting dealer:", error);
      const errorMessage =
        error.response?.data?.messages?.[0] ||
        error.message ||
        `Failed to ${modalMode} dealer. Please try again.`;
      setAlert({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate stats
  const activeDealers = dealers.filter((d) => d.isActive).length;
  const totalSalesTarget = dealers.reduce((sum, d) => sum + d.salesTarget, 0);
  const averageSalesTarget =
    dealers.length > 0 ? Math.round(totalSalesTarget / dealers.length) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Dealer Partnership Management
            </h1>
            <p className="text-slate-400 mt-1">
              Manage dealer relationships and monitor performance
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
            Add Dealer
          </Button>
        </div>

        {/* Stats Cards */}
        {!loading && dealers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Dealers</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {dealers.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Active Dealers</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {activeDealers}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Target</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {totalSalesTarget}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Avg Target</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {averageSalesTarget}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-yellow-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, phone, contract..."
                className="w-full"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </Card>

        {/* Alert */}
        <Alert type={alert.type} message={alert.message} />

        {/* Dealers Table */}
        <Card padding={false}>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" text="Loading dealers..." />
            </div>
          ) : filteredDealers.length === 0 ? (
            <EmptyState
              title="No dealers found"
              description={
                searchQuery || statusFilter
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first dealer partnership"
              }
              action={openCreateModal}
              actionLabel="Add Dealer"
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              }
            />
          ) : (
            <Table>
              <Table.Header>
                <Table.HeaderCell>Dealer Information</Table.HeaderCell>
                <Table.HeaderCell>Contact & Location</Table.HeaderCell>
                <Table.HeaderCell align="center">Target</Table.HeaderCell>
                <Table.HeaderCell align="center">Status</Table.HeaderCell>
                <Table.HeaderCell align="center">Actions</Table.HeaderCell>
              </Table.Header>
              <Table.Body>
                {filteredDealers.map((dealer) => (
                  <Table.Row key={dealer.id}>
                    {/* Dealer Info */}
                    <Table.Cell>
                      <div>
                        <p className="font-semibold text-white">
                          {dealer.name}
                        </p>
                        <p className="text-xs text-slate-400 font-mono mt-1">
                          {dealer.contractNumber}
                        </p>
                        {dealer.evmName && (
                          <p className="text-xs text-blue-400 mt-1">
                            EVM: {dealer.evmName}
                          </p>
                        )}
                      </div>
                    </Table.Cell>

                    {/* Contact Info */}
                    <Table.Cell>
                      <div className="text-sm space-y-1">
                        <p className="text-slate-300">{dealer.email}</p>
                        <p className="text-slate-400">{dealer.phone}</p>
                        <p className="text-slate-500 text-xs">
                          {dealer.address}
                        </p>
                      </div>
                    </Table.Cell>

                    {/* Sales Target */}
                    <Table.Cell align="center">
                      <div className="text-center">
                        <p className="font-semibold text-white text-lg">
                          {dealer.salesTarget}
                        </p>
                        <p className="text-xs text-slate-500">units</p>
                      </div>
                    </Table.Cell>

                    {/* Status */}
                    <Table.Cell align="center">
                      <Badge variant={getStatusVariant(dealer.isActive)}>
                        {dealer.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </Table.Cell>

                    {/* Actions */}
                    <Table.Cell align="center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openViewModal(dealer)}
                          className="text-slate-400 hover:text-slate-300 transition-colors"
                          title="View details"
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => openEditModal(dealer)}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Edit dealer"
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
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Card>

        {/* Stats Summary */}
        {!loading && dealers.length > 0 && (
          <div className="text-sm text-slate-400">
            Showing {filteredDealers.length} of {dealers.length} dealer(s)
          </div>
        )}
      </div>

      {/* Create/Edit/View Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={
          modalMode === "create"
            ? "Add New Dealer"
            : modalMode === "view"
            ? "Dealer Details"
            : "Edit Dealer"
        }
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <Alert type={alert.type} message={alert.message} />

          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            {/* Dealer Name */}
            <InputField
              id="name"
              name="name"
              label="Dealer Name"
              value={formData.name}
              onChange={handleInputChange}
              error={formErrors.name}
              placeholder="e.g., VinFast Showroom Hanoi"
              disabled={isViewMode}
            />

            {/* Address */}
            <InputField
              id="address"
              name="address"
              label="Address"
              value={formData.address}
              onChange={handleInputChange}
              error={formErrors.address}
              placeholder="e.g., 123 Main Street, Hanoi"
              disabled={isViewMode}
            />

            {/* Phone & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                id="phone"
                name="phone"
                type="tel"
                label="Phone"
                value={formData.phone}
                onChange={handleInputChange}
                error={formErrors.phone}
                placeholder="e.g., 0901234567"
                disabled={isViewMode}
              />
              <InputField
                id="email"
                name="email"
                type="email"
                label="Email"
                value={formData.email}
                onChange={handleInputChange}
                error={formErrors.email}
                placeholder="e.g., dealer@example.com"
                disabled={isViewMode}
              />
            </div>

            {/* Contract Number & Sales Target */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                id="contractNumber"
                name="contractNumber"
                label="Contract Number"
                value={formData.contractNumber}
                onChange={handleInputChange}
                error={formErrors.contractNumber}
                placeholder="e.g., CT-2024-001"
                disabled={isViewMode}
              />
              <InputField
                id="salesTarget"
                name="salesTarget"
                type="number"
                label="Sales Target"
                value={formData.salesTarget}
                onChange={handleInputChange}
                error={formErrors.salesTarget}
                placeholder="e.g., 100"
                disabled={isViewMode}
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                disabled={isViewMode}
                className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 disabled:opacity-50"
              />
              <label
                htmlFor="isActive"
                className="ml-2 text-sm font-medium text-slate-300"
              >
                Active Status
              </label>
            </div>

            {/* View mode: Show additional info */}
            {isViewMode && editingDealer && (
              <div className="border-t border-slate-700 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-slate-300 mb-3">
                  Additional Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Created:</span>
                    <span className="text-slate-300">
                      {formatShortDate(editingDealer.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Updated:</span>
                    <span className="text-slate-300">
                      {formatShortDate(editingDealer.updatedAt)}
                    </span>
                  </div>
                  {editingDealer.evmName && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Assigned EVM:</span>
                      <span className="text-slate-300">
                        {editingDealer.evmName}
                      </span>
                    </div>
                  )}
                </div>
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
              {isViewMode ? "Close" : "Cancel"}
            </Button>
            {!isViewMode && (
              <Button type="submit" isLoading={isSubmitting}>
                {modalMode === "create" ? "Create Dealer" : "Update Dealer"}
              </Button>
            )}
          </Modal.Footer>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

export default EVMStaffDealersPage;
