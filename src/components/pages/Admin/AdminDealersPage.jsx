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
import { userApi } from "../../../services/userApi";

// Status badge variant mapping
const getStatusVariant = (isActive) => {
  return isActive ? "success" : "danger";
};

function AdminDealersPage() {
  const [dealers, setDealers] = useState([]);
  const [filteredDealers, setFilteredDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
  const [editingDealer, setEditingDealer] = useState(null);

  // Delete confirmation
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [dealerToDelete, setDealerToDelete] = useState(null);
  const [dealerStaffCount, setDealerStaffCount] = useState(0);
  const [isDeletingWithStaff, setIsDeletingWithStaff] = useState(false);

  // View details modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingDealer, setViewingDealer] = useState(null);
  const [dealerDetails, setDealerDetails] = useState({
    staffCount: 0,
    activeStaffCount: 0,
    loadingDetails: false,
  });

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

  // Fetch dealers on mount
  useEffect(() => {
    fetchDealers();
  }, []);

  // Filter dealers when search or filter changes
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
          dealer.address.toLowerCase().includes(query)
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
    // Clear error for this field
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

  const openViewModal = async (dealer) => {
    setViewingDealer(dealer);
    setIsViewModalOpen(true);
    setDealerDetails({
      staffCount: 0,
      activeStaffCount: 0,
      loadingDetails: true,
    });

    // Fetch staff count for this dealer
    try {
      const response = await userApi.getByDealerId(dealer.id);
      if (response.isSuccess) {
        const staffMembers = response.data;
        const activeStaff = staffMembers.filter(
          (user) => user.isActive !== false
        );
        setDealerDetails({
          staffCount: staffMembers.length,
          activeStaffCount: activeStaff.length,
          loadingDetails: false,
        });
      } else {
        setDealerDetails({
          staffCount: 0,
          activeStaffCount: 0,
          loadingDetails: false,
        });
      }
    } catch (error) {
      console.error("Error fetching dealer staff:", error);
      setDealerDetails({
        staffCount: 0,
        activeStaffCount: 0,
        loadingDetails: false,
      });
    }
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setViewingDealer(null);
    setDealerDetails({
      staffCount: 0,
      activeStaffCount: 0,
      loadingDetails: false,
    });
  };

  const openDeleteModal = async (dealer) => {
    setDealerToDelete(dealer);
    setDealerStaffCount(0);
    setIsDeletingWithStaff(false);
    setIsDeleteModalOpen(true);

    // Check if dealer has staff
    try {
      const response = await userApi.getByDealerId(dealer.id);
      if (response.isSuccess) {
        const activeStaff = response.data.filter(
          (user) => user.isActive !== false
        );
        setDealerStaffCount(activeStaff.length);
        if (activeStaff.length > 0) {
          setIsDeletingWithStaff(true);
        }
      }
    } catch (error) {
      console.error("Error checking dealer staff:", error);
    }
  };

  const closeDeleteModal = () => {
    setDealerToDelete(null);
    setDealerStaffCount(0);
    setIsDeletingWithStaff(false);
    setIsDeleteModalOpen(false);
  };

  const handleDelete = async () => {
    if (!dealerToDelete) return;

    setIsSubmitting(true);
    setAlert({ type: "", message: "" });

    try {
      const response = await dealerApi.delete(dealerToDelete.id);
      if (response.isSuccess) {
        setDealers((prev) => prev.filter((d) => d.id !== dealerToDelete.id));
        setAlert({
          type: "success",
          message: response.messages?.[0] || "Dealer deleted successfully!",
        });
        closeDeleteModal();
      } else {
        setAlert({
          type: "error",
          message: response.messages?.[0] || "Failed to delete dealer",
        });
      }
    } catch (error) {
      console.error("Error deleting dealer:", error);
      const errorMessage =
        error.response?.data?.messages?.[0] ||
        error.message ||
        "Failed to delete dealer. Please try again.";
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
            <h1 className="text-3xl font-bold text-white">Dealer Management</h1>
            <p className="text-slate-400 mt-1">
              Oversee all dealer accounts and contracts
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

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, phone, or address..."
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
                  : "Get started by adding your first dealer"
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
                    {/* Dealer Information */}
                    <Table.Cell>
                      <div>
                        <p className="font-semibold text-white">
                          {dealer.name}
                        </p>
                        <p className="text-xs text-slate-400 font-mono mt-1">
                          {dealer.contractNumber}
                        </p>
                      </div>
                    </Table.Cell>

                    {/* Contact & Location */}
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
                        <button
                          onClick={() => openDeleteModal(dealer)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Delete dealer"
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

        {/* Stats Summary */}
        {!loading && dealers.length > 0 && (
          <div className="text-sm text-slate-400">
            Showing {filteredDealers.length} of {dealers.length} dealer(s)
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalMode === "create" ? "Add New Dealer" : "Edit Dealer"}
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
                className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="isActive"
                className="ml-2 text-sm font-medium text-slate-300"
              >
                Active Status
              </label>
            </div>
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
              {modalMode === "create" ? "Create Dealer" : "Update Dealer"}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Delete Dealer"
        size="md"
      >
        <div className="space-y-4">
          {isDeletingWithStaff && (
            <div className="bg-yellow-500 bg-opacity-10 border border-yellow-500 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5"
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
                  <p className="text-yellow-400 font-semibold">Warning</p>
                  <p className="text-yellow-300 text-sm mt-1">
                    This dealer has{" "}
                    <strong className="font-bold">{dealerStaffCount}</strong>{" "}
                    active staff member{dealerStaffCount !== 1 ? "s" : ""}.
                    Deleting this dealer may affect these users.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4">
            <p className="text-red-400">
              Are you sure you want to delete this dealer? This action cannot be
              undone.
            </p>
          </div>

          {dealerToDelete && (
            <div className="bg-slate-700 rounded-lg p-4">
              <p className="text-white font-semibold">{dealerToDelete.name}</p>
              <p className="text-sm text-slate-400 mt-1">
                {dealerToDelete.email}
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Contract: {dealerToDelete.contractNumber}
              </p>
            </div>
          )}

          <Modal.Footer>
            <Button
              type="button"
              variant="secondary"
              onClick={closeDeleteModal}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              isLoading={isSubmitting}
            >
              {isDeletingWithStaff ? "Delete Anyway" : "Delete Dealer"}
            </Button>
          </Modal.Footer>
        </div>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        title="Dealer Details"
        size="lg"
      >
        {viewingDealer && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Dealer Name</p>
                  <p className="text-white font-medium mt-1">
                    {viewingDealer.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Status</p>
                  <div className="mt-1">
                    <Badge variant={getStatusVariant(viewingDealer.isActive)}>
                      {viewingDealer.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="text-white mt-1">{viewingDealer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Phone</p>
                  <p className="text-white mt-1">{viewingDealer.phone}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-slate-400">Address</p>
                  <p className="text-white mt-1">{viewingDealer.address}</p>
                </div>
              </div>
            </div>

            {/* Contract Information */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                Contract Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Contract Number</p>
                  <p className="text-white font-mono mt-1">
                    {viewingDealer.contractNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Sales Target</p>
                  <p className="text-white font-semibold text-xl mt-1">
                    {viewingDealer.salesTarget}
                  </p>
                </div>
                {viewingDealer.evmName && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-slate-400">Assigned EVM</p>
                    <p className="text-blue-400 mt-1">
                      {viewingDealer.evmName}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Staff Information */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                Staff Information
              </h3>
              {dealerDetails.loadingDetails ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" text="Loading staff data..." />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Total Staff</p>
                        <p className="text-2xl font-bold text-white mt-1">
                          {dealerDetails.staffCount}
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
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Active Staff</p>
                        <p className="text-2xl font-bold text-white mt-1">
                          {dealerDetails.activeStaffCount}
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
                  </div>
                </div>
              )}
            </div>

            {/* Timestamps */}
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                Timeline
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Created</p>
                  <p className="text-white mt-1">
                    {formatShortDate(viewingDealer.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Last Updated</p>
                  <p className="text-white mt-1">
                    {formatShortDate(viewingDealer.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            <Modal.Footer>
              <Button
                type="button"
                variant="secondary"
                onClick={closeViewModal}
              >
                Close
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  closeViewModal();
                  openEditModal(viewingDealer);
                }}
              >
                Edit Dealer
              </Button>
            </Modal.Footer>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}

export default AdminDealersPage;
