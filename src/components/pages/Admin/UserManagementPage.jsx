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
import { userApi } from "../../../services/userApi";
import { dealerApi } from "../../../services/dealerApi";
import { ROLES } from "../../../constants";

// Get status badge variant
const getStatusVariant = (isActive) => {
  return isActive ? "success" : "default";
};

// Role options for dropdown
const ROLE_OPTIONS = Object.values(ROLES).map((role) => ({
  value: role.name,
  label: role.displayName,
}));

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [dealerNames, setDealerNames] = useState({}); // Map of dealerId -> dealerName
  const [dealers, setDealers] = useState([]);
  const [loadingDealers, setLoadingDealers] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' or 'edit'
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    password: "",
    phone: "",
    roleName: "",
    roleId: "",
    dealerId: "",
    isActive: true,
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch dealers on mount
  useEffect(() => {
    fetchDealers();
  }, []);

  // Filter users when search or filters change
  useEffect(() => {
    filterUsers();
  }, [searchQuery, roleFilter, statusFilter, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getAll();
      if (response.isSuccess) {
        setUsers(response.data);

        // Fetch dealer names for users with dealerId
        const dealerIds = [
          ...new Set(
            response.data
              .filter((user) => user.dealerId)
              .map((user) => user.dealerId)
          ),
        ];

        if (dealerIds.length > 0) {
          await fetchDealerNames(dealerIds);
        }
      } else {
        setAlert({
          type: "error",
          message: response.messages?.[0] || "Failed to load users",
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      const errorMessage =
        error.response?.data?.messages?.[0] ||
        error.message ||
        "Failed to load users";
      setAlert({ type: "error", message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const fetchDealers = async () => {
    try {
      setLoadingDealers(true);
      const response = await dealerApi.getAll();
      if (response.isSuccess) {
        setDealers(response.data);
      }
    } catch (error) {
      console.error("Error fetching dealers:", error);
    } finally {
      setLoadingDealers(false);
    }
  };

  const fetchDealerNames = async (dealerIds) => {
    try {
      const dealerPromises = dealerIds.map((id) =>
        dealerApi.getById(id).catch((err) => {
          console.error(`Error fetching dealer ${id}:`, err);
          return null;
        })
      );

      const dealerResponses = await Promise.all(dealerPromises);

      const namesMap = {};
      dealerResponses.forEach((response, index) => {
        if (response?.isSuccess && response.data) {
          namesMap[dealerIds[index]] = response.data.name;
        }
      });

      setDealerNames(namesMap);
    } catch (error) {
      console.error("Error fetching dealer names:", error);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.fullName.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (roleFilter) {
      filtered = filtered.filter((user) => user.roleName === roleFilter);
    }

    // Status filter
    if (statusFilter !== "") {
      const isActive = statusFilter === "true";
      filtered = filtered.filter((user) => user.isActive === isActive);
    }

    setFilteredUsers(filtered);
  };

  const openCreateModal = () => {
    setModalMode("create");
    setEditingUser(null);
    setFormData({
      email: "",
      fullName: "",
      password: "",
      phone: "",
      roleName: "",
      roleId: "",
      dealerId: "",
      isActive: true,
    });
    setFormErrors({});
    setAlert({ type: "", message: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setModalMode("edit");
    setEditingUser(user);
    setFormData({
      email: user.email,
      fullName: user.fullName,
      password: "",
      phone: user.phone || "",
      roleName: user.roleName,
      roleId: user.roleId,
      dealerId: user.dealerId || "",
      isActive: user.isActive,
    });
    setFormErrors({});
    setAlert({ type: "", message: "" });
    setIsModalOpen(true);
  };

  const openDeleteModal = (user) => {
    setDeletingUser(user);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      email: "",
      fullName: "",
      password: "",
      phone: "",
      roleName: "",
      roleId: "",
      dealerId: "",
      isActive: true,
    });
    setFormErrors({});
    setAlert({ type: "", message: "" });
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingUser(null);
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

    if (modalMode === "create") {
      if (!formData.email.trim()) errors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email))
        errors.email = "Email is invalid";

      if (!formData.fullName.trim()) errors.fullName = "Full name is required";

      if (!formData.password.trim()) errors.password = "Password is required";
      else if (formData.password.length < 6)
        errors.password = "Password must be at least 6 characters";

      if (!formData.roleName) errors.roleName = "Role is required";

      // Validate dealer selection for dealer roles
      if (
        (formData.roleName === "Dealer Staff" ||
          formData.roleName === "Dealer Manager") &&
        !formData.dealerId
      ) {
        errors.dealerId = "Dealer selection is required for dealer roles";
      }
    } else {
      // Edit mode - only roleId and isActive are required
      if (!formData.roleId) errors.roleId = "Role is required";

      // Validate dealer selection for dealer roles in edit mode
      if (
        (formData.roleId === ROLES.DEALER_STAFF.id ||
          formData.roleId === ROLES.DEALER_MANAGER.id) &&
        !formData.dealerId
      ) {
        errors.dealerId = "Dealer selection is required for dealer roles";
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

    setIsSubmitting(true);
    setAlert({ type: "", message: "" });

    try {
      if (modalMode === "create") {
        const userData = {
          email: formData.email.trim(),
          fullName: formData.fullName.trim(),
          password: formData.password,
          phone: formData.phone.trim(),
          roleName: formData.roleName,
          dealerId: formData.dealerId || null,
          isActive: formData.isActive,
        };

        const response = await userApi.create(userData);
        if (response.isSuccess) {
          setUsers((prev) => [response.data, ...prev]);

          // Fetch dealer name if user has dealerId
          if (response.data.dealerId && !dealerNames[response.data.dealerId]) {
            await fetchDealerNames([response.data.dealerId]);
          }

          setAlert({
            type: "success",
            message: response.messages?.[0] || "User created successfully!",
          });
          setTimeout(() => {
            closeModal();
          }, 1500);
        } else {
          setAlert({
            type: "error",
            message: response.messages?.[0] || "Failed to create user",
          });
        }
      } else {
        const userData = {
          roleId: formData.roleId,
          dealerId: formData.dealerId || null,
          isActive: formData.isActive,
        };

        const response = await userApi.update(editingUser.id, userData);
        if (response.isSuccess) {
          setUsers((prev) =>
            prev.map((u) => (u.id === editingUser.id ? response.data : u))
          );

          // Fetch dealer name if user has dealerId and it's not already cached
          if (response.data.dealerId && !dealerNames[response.data.dealerId]) {
            await fetchDealerNames([response.data.dealerId]);
          }

          setAlert({
            type: "success",
            message: response.messages?.[0] || "User updated successfully!",
          });
          setTimeout(() => {
            closeModal();
          }, 1500);
        } else {
          setAlert({
            type: "error",
            message: response.messages?.[0] || "Failed to update user",
          });
        }
      }
    } catch (error) {
      console.error("Error submitting user:", error);
      const errorMessage =
        error.response?.data?.messages?.[0] ||
        error.message ||
        `Failed to ${modalMode} user. Please try again.`;
      setAlert({
        type: "error",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;

    setIsSubmitting(true);
    try {
      const response = await userApi.delete(deletingUser.id);
      if (response.isSuccess) {
        setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
        setAlert({
          type: "success",
          message: "User deleted successfully!",
        });
        closeDeleteModal();
      } else {
        setAlert({
          type: "error",
          message: response.messages?.[0] || "Failed to delete user",
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      const errorMessage =
        error.response?.data?.messages?.[0] ||
        error.message ||
        "Failed to delete user";
      setAlert({ type: "error", message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="text-slate-400 mt-1">
              Manage system users, roles, and permissions
            </p>
          </div>
          <Button
            onClick={openCreateModal}
            className="flex-shrink-0 whitespace-nowrap"
          >
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
            Add User
          </Button>
        </div>

        {/* Alert */}
        {alert.message && !isModalOpen && !isDeleteModalOpen && (
          <Alert type={alert.type} message={alert.message} />
        )}

        {/* Filters */}
        <Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full"
              />
            </div>
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: "", label: "All Roles" },
                { value: "Admin", label: "Admin" },
                { value: "EVM Staff", label: "EVM Staff" },
                { value: "Dealer Manager", label: "Dealer Manager" },
                { value: "Dealer Staff", label: "Dealer Staff" },
              ]}
              placeholder="Filter by role"
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "", label: "All Status" },
                { value: "true", label: "Active" },
                { value: "false", label: "Inactive" },
              ]}
              placeholder="Filter by status"
            />
          </div>
        </Card>

        {/* User Table */}
        <Card padding={false}>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" text="Loading users..." />
            </div>
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              title="No users found"
              description={
                searchQuery || roleFilter || statusFilter
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first user"
              }
              action={openCreateModal}
              actionLabel="Add User"
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
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <Table.Header>
                  <Table.HeaderCell>User</Table.HeaderCell>
                  <Table.HeaderCell>Email</Table.HeaderCell>
                  <Table.HeaderCell>Role</Table.HeaderCell>
                  <Table.HeaderCell className="hidden lg:table-cell">
                    Dealer
                  </Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell align="center">Actions</Table.HeaderCell>
                </Table.Header>
                <Table.Body>
                  {filteredUsers.map((user) => (
                    <Table.Row key={user.id}>
                      {/* User (Name + Phone) */}
                      <Table.Cell>
                        <div className="flex items-center gap-3 min-w-[160px]">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-white">
                              {user.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .substring(0, 2)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate">
                              {user.fullName}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {user.phone || "No phone"}
                            </p>
                          </div>
                        </div>
                      </Table.Cell>

                      {/* Email */}
                      <Table.Cell>
                        <span className="text-slate-300 text-sm truncate block max-w-[180px]">
                          {user.email}
                        </span>
                      </Table.Cell>

                      {/* Role */}
                      <Table.Cell>
                        <Badge variant="primary" size="sm">
                          {user.roleName}
                        </Badge>
                      </Table.Cell>

                      {/* Dealer - Hidden on small screens */}
                      <Table.Cell className="hidden lg:table-cell">
                        {user.dealerId ? (
                          <span
                            className="text-slate-300 text-sm"
                            title={dealerNames[user.dealerId] || user.dealerId}
                          >
                            {dealerNames[user.dealerId] || (
                              <span className="text-slate-400 text-xs">
                                Loading...
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </Table.Cell>

                      {/* Status */}
                      <Table.Cell>
                        <Badge
                          variant={getStatusVariant(user.isActive)}
                          size="sm"
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </Table.Cell>

                      {/* Actions */}
                      <Table.Cell align="center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="text-blue-400 hover:text-blue-300 transition-colors p-1"
                            title="Edit user"
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
                            onClick={() => openDeleteModal(user)}
                            className="text-red-400 hover:text-red-300 transition-colors p-1"
                            title="Delete user"
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
            </div>
          )}
        </Card>

        {/* Stats */}
        {!loading && users.length > 0 && (
          <div className="text-sm text-slate-400">
            Showing {filteredUsers.length} of {users.length} user(s)
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalMode === "create" ? "Add New User" : "Edit User"}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <Alert type={alert.type} message={alert.message} />

          <div className="space-y-4">
            {modalMode === "create" ? (
              <>
                {/* Create Mode Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    id="email"
                    name="email"
                    type="email"
                    label="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={formErrors.email}
                    placeholder="user@example.com"
                    required
                  />

                  <InputField
                    id="fullName"
                    name="fullName"
                    label="Full Name"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    error={formErrors.fullName}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    id="password"
                    name="password"
                    type="password"
                    label="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    error={formErrors.password}
                    placeholder="Enter password"
                    required
                  />

                  <InputField
                    id="phone"
                    name="phone"
                    type="tel"
                    label="Phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    error={formErrors.phone}
                    placeholder="0123456789"
                  />
                </div>

                <Select
                  id="roleName"
                  name="roleName"
                  label="Role"
                  value={formData.roleName}
                  onChange={handleInputChange}
                  options={ROLE_OPTIONS}
                  error={formErrors.roleName}
                  placeholder="Select role"
                  required
                />

                {/* Conditional Dealer Field for Dealer roles */}
                {(formData.roleName === "Dealer Staff" ||
                  formData.roleName === "Dealer Manager") && (
                  <Select
                    id="dealerId"
                    name="dealerId"
                    label="Dealer"
                    value={formData.dealerId}
                    onChange={handleInputChange}
                    options={[
                      { value: "", label: "Select a dealer" },
                      ...dealers.map((dealer) => ({
                        value: dealer.id,
                        label: dealer.name,
                      })),
                    ]}
                    error={formErrors.dealerId}
                    placeholder="Select dealer"
                    disabled={loadingDealers}
                    required
                  />
                )}

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-300">
                      Active Account
                    </span>
                  </label>
                </div>
              </>
            ) : (
              <>
                {/* Edit Mode Fields */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <p className="text-slate-400">{formData.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>
                  <p className="text-slate-400">{formData.fullName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone
                  </label>
                  <p className="text-slate-400">{formData.phone || "-"}</p>
                </div>

                <Select
                  id="roleId"
                  name="roleId"
                  label="Role"
                  value={formData.roleId}
                  onChange={handleInputChange}
                  options={Object.values(ROLES).map((role) => ({
                    value: role.id,
                    label: role.displayName,
                  }))}
                  error={formErrors.roleId}
                  placeholder="Select role"
                  required
                />

                {/* Conditional Dealer Field for Dealer roles */}
                {(formData.roleId === ROLES.DEALER_STAFF.id ||
                  formData.roleId === ROLES.DEALER_MANAGER.id) && (
                  <Select
                    id="dealerId"
                    name="dealerId"
                    label="Dealer"
                    value={formData.dealerId}
                    onChange={handleInputChange}
                    options={[
                      { value: "", label: "Select a dealer" },
                      ...dealers.map((dealer) => ({
                        value: dealer.id,
                        label: dealer.name,
                      })),
                    ]}
                    error={formErrors.dealerId}
                    placeholder="Select dealer"
                    disabled={loadingDealers}
                    required
                  />
                )}

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-300">
                      Active Account
                    </span>
                  </label>
                </div>

                <div className="bg-blue-500 bg-opacity-10 border border-blue-500 rounded-lg p-3">
                  <p className="text-xs text-blue-400">
                    Note: API only supports updating Role, Dealer assignment,
                    and Status. Full Name, Email, and Phone are read-only.
                  </p>
                </div>
              </>
            )}
          </div>

          <Modal.Footer className="flex-col sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              onClick={closeModal}
              disabled={isSubmitting}
              fullWidth={true}
              className="sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              fullWidth={true}
              className="sm:w-auto"
            >
              {modalMode === "create" ? "Create User" : "Update User"}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        title="Delete User"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-300">
            Are you sure you want to delete user{" "}
            <span className="font-semibold text-white">
              {deletingUser?.fullName}
            </span>
            ? This action cannot be undone.
          </p>

          <Modal.Footer className="flex-col sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              onClick={closeDeleteModal}
              disabled={isSubmitting}
              fullWidth={true}
              className="sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              isLoading={isSubmitting}
              fullWidth={true}
              className="sm:w-auto"
            >
              Delete User
            </Button>
          </Modal.Footer>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

export default UserManagementPage;
