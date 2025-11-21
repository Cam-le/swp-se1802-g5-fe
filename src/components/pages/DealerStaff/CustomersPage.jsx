import { useState, useEffect } from "react";
import { DashboardLayout } from "../../layout";
import { Card, Button, Modal, InputField, LoadingSpinner, Alert, EmptyState } from "../../common";
import { useAuth } from "../../../hooks/useAuth";
import { getInitials } from "../../../utils/helpers";
import { customerApi } from "../../../services/customerApi";

function CustomersPage() {
    const { user } = useAuth();

    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal & form state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ fullName: "", email: "", phone: "", address: "" });
    // For details/edit modal
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [editData, setEditData] = useState({ fullName: "", email: "", phone: "", address: "" });
    const [editErrors, setEditErrors] = useState({});
    const [isEditSubmitting, setIsEditSubmitting] = useState(false);
    const [editAlert, setEditAlert] = useState({ type: "", message: "" });
    const [phoneError, setPhoneError] = useState("");
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alert, setAlert] = useState({ type: "", message: "" });

    useEffect(() => {
        fetchCustomers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const data = await customerApi.getAll();
            setCustomers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching customers:", err);
            setAlert({ type: "error", message: "Failed to load customers" });
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setFormData({ fullName: "", email: "", phone: "", address: "" });
        setFormErrors({});
        setAlert({ type: "", message: "" });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsSubmitting(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "phone") {
            if (/[a-zA-Z]/.test(value)) {
                setPhoneError("Letter is not allowed");
            } else {
                setPhoneError("");
            }
        }
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.fullName.trim()) errors.fullName = "Full name is required";
        if (!formData.email.trim()) errors.email = "Email is required";
        if (!formData.phone.trim()) errors.phone = "Phone is required";
        if (!formData.address.trim()) errors.address = "Address is required";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            setAlert({ type: "error", message: "Please fix the errors below" });
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                address: formData.address.trim(),
                dealer_staff_id: user?.id,
            };
            const newCustomer = await customerApi.create(payload);
            setAlert({ type: "success", message: "Customer added successfully" });
            await fetchCustomers();
            setTimeout(() => {
                closeModal();
            }, 800);
        } catch (err) {
            console.error("Error creating customer:", err);
            setAlert({ type: "error", message: "Failed to create customer" });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Open details modal and load customer info
    const openDetailsModal = (customer) => {
        setSelectedCustomer(customer);
        setEditData({
            fullName: customer.fullName || "",
            email: customer.email || "",
            phone: customer.phone || "",
            address: customer.address || "",
        });
        setEditErrors({});
        setEditAlert({ type: "", message: "" });
        setIsDetailsOpen(true);
    };

    const closeDetailsModal = () => {
        setIsDetailsOpen(false);
        setSelectedCustomer(null);
        setIsEditSubmitting(false);
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditData((prev) => ({ ...prev, [name]: value }));
        if (editErrors[name]) setEditErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validateEditForm = () => {
        const errors = {};
        if (!editData.fullName.trim()) errors.fullName = "Full name is required";
        if (!editData.email.trim()) errors.email = "Email is required";
        if (!editData.phone.trim()) errors.phone = "Phone is required";
        if (!editData.address.trim()) errors.address = "Address is required";
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
            const updated = await customerApi.update(selectedCustomer.id, {
                ...selectedCustomer,
                ...editData,
            });
            setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
            setEditAlert({ type: "success", message: "Customer updated successfully" });
            setTimeout(() => {
                closeDetailsModal();
            }, 800);
        } catch (err) {
            setEditAlert({ type: "error", message: "Failed to update customer" });
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
                        <h1 className="text-3xl font-bold text-white">Customers Page</h1>
                        <p className="text-slate-400">Customers Management</p>
                    </div>
                </div>

                {alert.message && <Alert type={alert.type}>{alert.message}</Alert>}

                {/* Customers Grid */}
                <div>
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <LoadingSpinner size="lg" text="Loading customers..." />
                        </div>
                    ) : customers.length === 0 ? (
                        <EmptyState title="No customers found" description="You don't have any customers yet." />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {customers.map((c) => (
                                <Card key={c.id} hover className="flex items-start space-x-4 relative pb-8">
                                    <div className="flex-shrink-0">
                                        <div className="h-12 w-12 rounded-full bg-slate-700 flex items-center justify-center text-white font-semibold">
                                            {getInitials(c.fullName)}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-white font-medium">{c.fullName}</h3>
                                        </div>
                                        <div className="text-slate-300 text-sm mt-1">{c.email}</div>
                                        <div className="text-slate-400 text-sm mt-2">Phone: {c.phone}</div>
                                        <div className="text-slate-400 text-sm mt-1">Address: {c.address}</div>
                                    </div>
                                    <div className="absolute right-4 bottom-3">
                                        <Button size="xs" variant="primary" onClick={() => openDetailsModal(c)}>
                                            Details
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                            {/* Customer Details/Edit Modal */}
                            <Modal isOpen={isDetailsOpen} onClose={closeDetailsModal} title="Customer Details & Edit">
                                {selectedCustomer && (
                                    <form onSubmit={handleEditSubmit} className="space-y-4">
                                        <InputField id="fullName" name="fullName" label="Full Name" value={editData.fullName} onChange={handleEditInputChange} error={editErrors.fullName} />
                                        <InputField id="email" name="email" label="Email" value={editData.email} onChange={handleEditInputChange} error={editErrors.email} />
                                        <InputField id="phone" name="phone" label="Phone" value={editData.phone} onChange={handleEditInputChange} error={editErrors.phone} />
                                        <InputField id="address" name="address" label="Address" value={editData.address} onChange={handleEditInputChange} error={editErrors.address} />
                                        {editAlert.message && <Alert type={editAlert.type}>{editAlert.message}</Alert>}
                                        <div className="flex items-center justify-end space-x-2">
                                            <Button type="button" variant="secondary" onClick={closeDetailsModal} disabled={isEditSubmitting}>Cancel</Button>
                                            <Button type="submit" disabled={isEditSubmitting}>{isEditSubmitting ? "Saving..." : "Save Changes"}</Button>
                                        </div>
                                    </form>
                                )}
                            </Modal>
                        </div>
                    )}
                </div>

                {/* Add Customer Modal */}
                <Modal isOpen={isModalOpen} onClose={closeModal} title="Add Customer">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-4">
                            <InputField id="fullName" name="fullName" label="Full Name" value={formData.fullName} onChange={handleInputChange} error={formErrors.fullName} />
                            <InputField id="email" name="email" label="Email" value={formData.email} onChange={handleInputChange} error={formErrors.email} />
                            <InputField id="phone" name="phone" label="Phone" value={formData.phone} onChange={handleInputChange} error={formErrors.phone || phoneError} />
                            <InputField id="address" name="address" label="Address" value={formData.address} onChange={handleInputChange} error={formErrors.address} />
                        </div>

                        <div className="mt-4 flex items-center justify-end space-x-2">
                            <Button type="button" variant="secondary" onClick={closeModal} disabled={isSubmitting}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Saving..." : "Add Customer"}
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}

export default CustomersPage;