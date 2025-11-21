import { useEffect, useState } from "react";
import { DashboardLayout } from "../../layout";
import { Card, Badge } from "../../common";
import Table from "../../common/Table";
import { useAuth } from "../../../hooks/useAuth";
import promotionApi from "../../../services/promotionApi";
import Modal from "../../common/Modal";
import InputField from "../../common/InputField";
import Button from "../../common/Button";

function DealerManagerPromotionsPage() {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" or "edit"
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    discountPercent: "",
    startDate: "",
    endDate: "",
    isActive: true,
    note: "",
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPromotion, setDeletingPromotion] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (user?.dealer_id) {
      fetchPromotions();
    }
  }, [user]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      setError(null);
      // Use dealer-specific API instead of getAll
      const res = await promotionApi.getByDealerId(user.dealer_id);
      if (res.isSuccess) {
        setPromotions(res.data || []);
      } else {
        setError(res.messages?.[0] || "Failed to load promotions");
      }
    } catch (err) {
      setError("Failed to load promotions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setModalMode("create");
    setSelectedPromotion(null);
    setFormData({
      name: "",
      description: "",
      discountPercent: "",
      startDate: "",
      endDate: "",
      isActive: true,
      note: "",
    });
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (promotion) => {
    setModalMode("edit");
    setSelectedPromotion(promotion);
    setFormData({
      name: promotion.name,
      description: promotion.description,
      discountPercent: promotion.discountPercent.toString(),
      startDate: promotion.startDate
        ? new Date(promotion.startDate).toISOString().split("T")[0]
        : "",
      endDate: promotion.endDate
        ? new Date(promotion.endDate).toISOString().split("T")[0]
        : "",
      isActive: promotion.isActive,
      note: promotion.note || "",
    });
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPromotion(null);
    setFormData({
      name: "",
      description: "",
      discountPercent: "",
      startDate: "",
      endDate: "",
      isActive: true,
      note: "",
    });
    setFormError("");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmitPromotion = async (e) => {
    e.preventDefault();
    setFormError("");

    if (
      !formData.name ||
      !formData.description ||
      !formData.discountPercent ||
      !formData.startDate ||
      !formData.endDate
    ) {
      setFormError("Please fill in all required fields.");
      return;
    }

    if (
      isNaN(Number(formData.discountPercent)) ||
      Number(formData.discountPercent) <= 0 ||
      Number(formData.discountPercent) > 100
    ) {
      setFormError("Discount percent must be between 1 and 100.");
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    if (endDate <= startDate) {
      setFormError("End date must be after start date.");
      return;
    }

    setFormLoading(true);
    try {
      const promotionData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        discountPercent: Number(formData.discountPercent),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        isActive: formData.isActive,
        note: formData.note.trim() || null,
      };

      if (modalMode === "create") {
        // Add createdBy for create mode
        promotionData.createdBy = user?.id;
        const res = await promotionApi.create(promotionData);
        if (res.isSuccess) {
          await fetchPromotions();
          closeModal();
        } else {
          setFormError(res.messages?.[0] || "Failed to create promotion");
        }
      } else {
        // Edit mode
        const res = await promotionApi.update(
          selectedPromotion.id,
          promotionData
        );
        if (res.isSuccess) {
          await fetchPromotions();
          closeModal();
        } else {
          setFormError(res.messages?.[0] || "Failed to update promotion");
        }
      }
    } catch (err) {
      setFormError(
        err.response?.data?.messages?.[0] || `Failed to ${modalMode} promotion`
      );
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const openDeleteModal = (promotion) => {
    setDeletingPromotion(promotion);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingPromotion(null);
  };

  const handleDeletePromotion = async () => {
    if (!deletingPromotion) return;

    setDeleteLoading(true);
    try {
      const res = await promotionApi.delete(deletingPromotion.id);
      if (res.isSuccess) {
        await fetchPromotions();
        closeDeleteModal();
      } else {
        setError(res.messages?.[0] || "Failed to delete promotion");
        closeDeleteModal();
      }
    } catch (err) {
      setError(
        err.response?.data?.messages?.[0] || "Failed to delete promotion"
      );
      console.error(err);
      closeDeleteModal();
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtered and searched promotions
  const filteredPromotions = promotions.filter((p) => {
    const matchesSearch =
      !search ||
      (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.createdByName || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      !statusFilter || (statusFilter === "active" ? p.isActive : !p.isActive);
    return matchesSearch && matchesStatus;
  });

  // Helper for status badge
  const getStatusBadge = (isActive) => {
    return isActive ? "bg-green-500" : "bg-slate-500";
  };

  // Helper for discount type badge
  const getDiscountTypeBadge = (discountType) => {
    return discountType === "Percent" ? "bg-blue-500" : "bg-purple-500";
  };

  // Helper for formatting dates
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <DashboardLayout>
      <div className="space-y-3">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Promotions Management
            </h1>
            <p className="text-xs text-slate-400">
              Welcome back, {user?.full_name}!
            </p>
          </div>
          <Button onClick={openCreateModal} className="text-sm">
            <svg
              className="w-4 h-4 mr-1.5"
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
            Add Promotion
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-2 items-center bg-slate-800 p-3 rounded-lg">
          <input
            type="text"
            className="w-full md:w-1/2 px-3 py-1.5 text-sm rounded bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Search by name, description, or creator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="w-full md:w-1/4 px-3 py-1.5 text-sm rounded bg-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Filter by status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Promotions Content */}
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-800 border-b border-slate-700">
                <tr>
                  <th className="px-3 py-2 text-left text-slate-300 font-semibold">
                    Name
                  </th>
                  <th className="px-3 py-2 text-left text-slate-300 font-semibold">
                    Description
                  </th>
                  <th className="px-3 py-2 text-left text-slate-300 font-semibold">
                    Discount
                  </th>
                  <th className="px-3 py-2 text-left text-slate-300 font-semibold">
                    Start
                  </th>
                  <th className="px-3 py-2 text-left text-slate-300 font-semibold">
                    End
                  </th>
                  <th className="px-3 py-2 text-left text-slate-300 font-semibold">
                    Creator
                  </th>
                  <th className="px-3 py-2 text-left text-slate-300 font-semibold">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-slate-300 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-3 py-3 text-center text-slate-400 text-xs"
                    >
                      Loading promotions...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-3 py-3 text-center text-red-400 text-xs"
                    >
                      {error}
                    </td>
                  </tr>
                ) : filteredPromotions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-3 py-8 text-center text-slate-400 text-sm"
                    >
                      No promotions found
                    </td>
                  </tr>
                ) : (
                  filteredPromotions.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/50">
                      <td className="px-3 py-2">
                        <div
                          className="font-semibold text-white max-w-[150px] truncate"
                          title={p.name}
                        >
                          {p.name}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div
                          className="text-slate-300 max-w-[200px] truncate"
                          title={p.description}
                        >
                          {p.description}
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold text-white ${getDiscountTypeBadge(
                              p.discountType
                            )}`}
                          >
                            {p.discountType}
                          </span>
                          <span className="font-semibold text-white">
                            {p.discountPercent}%
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-slate-300">
                          {formatDate(p.startDate)}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-slate-300">
                          {formatDate(p.endDate)}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className="text-slate-300 max-w-[100px] truncate inline-block"
                          title={p.createdByName}
                        >
                          {p.createdByName || "-"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${getStatusBadge(
                            p.isActive
                          )}`}
                        >
                          {p.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-1.5">
                          <button
                            className="text-blue-400 hover:text-blue-600 transition-colors"
                            title="Edit Promotion"
                            onClick={() => openEditModal(p)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
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
                            className="text-red-400 hover:text-red-600 transition-colors"
                            title="Delete Promotion"
                            onClick={() => openDeleteModal(p)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Create/Edit Promotion Modal */}
        <Modal
          isOpen={showModal}
          onClose={closeModal}
          title={modalMode === "create" ? "Create Promotion" : "Edit Promotion"}
        >
          <form onSubmit={handleSubmitPromotion} className="space-y-4">
            <InputField
              id="name"
              name="name"
              label="Promotion Name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter promotion name"
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
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Enter promotion description..."
                required
              />
            </div>
            <InputField
              id="discountPercent"
              name="discountPercent"
              label="Discount Percent (%)"
              type="number"
              value={formData.discountPercent}
              onChange={handleInputChange}
              placeholder="Enter discount percentage"
              min="1"
              max="100"
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                id="startDate"
                name="startDate"
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
              <InputField
                id="endDate"
                name="endDate"
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm text-slate-300">
                Active
              </label>
            </div>
            <InputField
              id="note"
              name="note"
              label="Note (Optional)"
              value={formData.note}
              onChange={handleInputChange}
              placeholder="Enter additional notes"
            />
            {formError && <div className="text-red-400">{formError}</div>}
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={closeModal}
                type="button"
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={formLoading}>
                {modalMode === "create"
                  ? "Create Promotion"
                  : "Update Promotion"}
              </Button>
            </Modal.Footer>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={closeDeleteModal}
          title="Delete Promotion"
        >
          {deletingPromotion && (
            <div className="space-y-4">
              <div className="text-slate-300">
                Are you sure you want to delete the promotion{" "}
                <span className="font-semibold text-white">
                  "{deletingPromotion.name}"
                </span>
                ? This action cannot be undone.
              </div>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={closeDeleteModal}
                  type="button"
                  disabled={deleteLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleDeletePromotion}
                  isLoading={deleteLoading}
                  className="!bg-red-500 hover:!bg-red-600"
                >
                  Delete
                </Button>
              </Modal.Footer>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}

export default DealerManagerPromotionsPage;
