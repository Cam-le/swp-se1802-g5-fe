import { useState, useEffect } from "react";
import { DashboardLayout } from "../../layout";
import { Card, Button, Modal, InputField, LoadingSpinner, Alert, EmptyState } from "../../common";
import { useAuth } from "../../../hooks/useAuth";
import { getInitials } from "../../../utils/helpers";
import userApi from "../../../services/userApi";

function DealerManagerStaffPage() {
    const { user } = useAuth();

    const [staffs, setStaffs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [editData, setEditData] = useState({ fullName: "", email: "", phone: "", isActive: true });
    const [editErrors, setEditErrors] = useState({});
    const [isEditSubmitting, setIsEditSubmitting] = useState(false);
    const [editAlert, setEditAlert] = useState({ type: "", message: "" });

    useEffect(() => {
        fetchStaffs();
    }, [user?.dealer_id]);

    const fetchStaffs = async () => {
        if (!user?.dealer_id) return;
        try {
            setLoading(true);
            const response = await userApi.getByDealerId(user.dealer_id);
            if (response.isSuccess) {
                // Only Dealer Staff role
                setStaffs(response.data.filter((u) => u.roleName === "Dealer Staff"));
            } else {
                setStaffs([]);
            }
        } catch (err) {
            setStaffs([]);
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (staff) => {
        setSelectedStaff(staff);
        setEditData({
            fullName: staff.fullName || "",
            email: staff.email || "",
            phone: staff.phone || "",
            isActive: staff.isActive !== undefined ? staff.isActive : true,
        });
        setEditErrors({});
        setEditAlert({ type: "", message: "" });
        setIsEditOpen(true);
    };

    const closeEditModal = () => {
        setIsEditOpen(false);
        setSelectedStaff(null);
        setIsEditSubmitting(false);
    };

    const handleEditInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        if (editErrors[name]) setEditErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validateEditForm = () => {
        const errors = {};
        if (!editData.fullName.trim()) errors.fullName = "Full name is required";
        if (!editData.email.trim()) errors.email = "Email is required";
        if (!editData.phone.trim()) errors.phone = "Phone is required";
        setEditErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!validateEditForm()) {
            setEditAlert({ type: "error", message: "Please fix the errors below" });
            return;
        }
        try {
            setIsEditSubmitting(true);
            const updated = await userApi.update(selectedStaff.id, {
                ...selectedStaff,
                ...editData,
            });
            setStaffs((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
            setEditAlert({ type: "success", message: "Staff updated successfully" });
            setTimeout(() => {
                closeEditModal();
            }, 800);
        } catch (err) {
            setEditAlert({ type: "error", message: "Failed to update staff" });
        } finally {
            setIsEditSubmitting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Staffs Page</h1>
                        <p className="text-slate-400">Managing staffs in the dealer</p>
                    </div>
                </div>
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <LoadingSpinner size="lg" text="Loading staffs..." />
                    </div>
                ) : staffs.length === 0 ? (
                    <EmptyState title="No staffs found" description="You don't have any staffs yet." />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {staffs.map((s) => (
                            <Card key={s.id} hover className="flex items-start space-x-4 relative pb-8">
                                <div className="flex-shrink-0">
                                    <div className="h-12 w-12 rounded-full bg-slate-700 flex items-center justify-center text-white font-semibold">
                                        {getInitials(s.fullName)}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-white font-medium">{s.fullName}</h3>
                                        <div className={`text-sm ${s.isActive ? 'text-green-400' : 'text-red-400'}`}>{s.isActive ? 'Active' : 'Inactive'}</div>
                                    </div>
                                    <div className="text-slate-300 text-sm mt-1">{s.email}</div>
                                    <div className="text-slate-400 text-sm mt-2">Phone: {s.phone}</div>
                                    <div className="text-slate-400 text-sm mt-1">Role: {s.roleName}</div>
                                </div>
                                <div className="absolute right-4 bottom-3">
                                    <Button size="xs" variant="primary" onClick={() => openEditModal(s)}>
                                        Edit
                                    </Button>
                                </div>
                            </Card>
                        ))}
                        {/* Staff Edit Modal */}
                        <Modal isOpen={isEditOpen} onClose={closeEditModal} title="Staff Details & Edit">
                            {selectedStaff && (
                                <form onSubmit={handleEditSubmit} className="space-y-4">
                                    <InputField id="fullName" name="fullName" label="Full Name" value={editData.fullName} onChange={handleEditInputChange} error={editErrors.fullName} />
                                    <InputField id="email" name="email" label="Email" value={editData.email} onChange={handleEditInputChange} error={editErrors.email} />
                                    <InputField id="phone" name="phone" label="Phone" value={editData.phone} onChange={handleEditInputChange} error={editErrors.phone} />
                                    <div className="flex items-center gap-2">
                                        <label htmlFor="isActive" className="text-sm text-slate-400">Active</label>
                                        <input type="checkbox" id="isActive" name="isActive" checked={editData.isActive} onChange={handleEditInputChange} />
                                    </div>
                                    {editAlert.message && <Alert type={editAlert.type}>{editAlert.message}</Alert>}
                                    <div className="flex items-center justify-end space-x-2">
                                        <Button type="button" variant="secondary" onClick={closeEditModal} disabled={isEditSubmitting}>Cancel</Button>
                                        <Button type="submit" disabled={isEditSubmitting}>{isEditSubmitting ? "Saving..." : "Save Changes"}</Button>
                                    </div>
                                </form>
                            )}
                        </Modal>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
export default DealerManagerStaffPage;