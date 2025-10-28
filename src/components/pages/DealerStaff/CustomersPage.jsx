import { useState, useEffect } from "react";
import { DashboardLayout } from "../../layout";
import { Card, Button, Modal, InputField, LoadingSpinner, Alert, EmptyState } from "../../common";
import { useAuth } from "../../../hooks/useAuth";
import { getInitials } from "../../../utils/helpers";
import { customerApi } from "../../../services/mockApi";

function CustomersPage() {
    const { user } = useAuth();

    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal & form state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ full_name: "", email: "", phone: "", address: "" });
    const [phoneError, setPhoneError] = useState("");
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alert, setAlert] = useState({ type: "", message: "" });

    useEffect(() => {
        fetchCustomers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const fetchCustomers = async () => {
        if (!user?.id) return;
        try {
            setLoading(true);
            const data = await customerApi.getAll(user.id);
            setCustomers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching customers:", err);
            setAlert({ type: "error", message: "Failed to load customers" });
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setFormData({ full_name: "", email: "", phone: "", address: "" });
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
        if (!formData.full_name.trim()) errors.full_name = "Full name is required";
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
                full_name: formData.full_name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                address: formData.address.trim(),
                dealer_staff_id: user?.id,
            };
            const newCustomer = await customerApi.create(payload);
            // Prepend to list so it's visible immediately
            setCustomers((prev) => [newCustomer, ...prev]);
            setAlert({ type: "success", message: "Customer added successfully" });
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

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Customers Page</h1>
                        <p className="text-slate-400">Welcome back, {user?.full_name}!</p>
                    </div>
                    <Button onClick={openCreateModal}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Customer
                    </Button>
                </div>

                {alert.message && <Alert type={alert.type}>{alert.message}</Alert>}

                {/* Customers Grid */}
                <div>
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <LoadingSpinner size="lg" text="Loading customers..." />
                        </div>
                    ) : customers.length === 0 ? (
                        <EmptyState title="No customers found" description="You don't have any customers yet. Add one to get started." action={openCreateModal} actionLabel="Add Customer" />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {customers.map((c) => (
                                <Card key={c.id} hover className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="h-12 w-12 rounded-full bg-slate-700 flex items-center justify-center text-white font-semibold">
                                            {getInitials(c.full_name)}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-white font-medium">{c.full_name}</h3>
                                            <div className={`text-sm ${c.is_active ? 'text-green-400' : 'text-red-400'}`}>{c.is_active ? 'Active' : 'Inactive'}</div>
                                        </div>
                                        <div className="text-slate-300 text-sm mt-1">{c.email}</div>
                                        <div className="text-slate-400 text-sm mt-2">Phone: {c.phone}</div>
                                        <div className="text-slate-400 text-sm mt-1">Address: {c.address}</div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add Customer Modal */}
                <Modal isOpen={isModalOpen} onClose={closeModal} title="Add Customer">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-4">
                            <InputField id="full_name" name="full_name" label="Full Name" value={formData.full_name} onChange={handleInputChange} error={formErrors.full_name} />
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