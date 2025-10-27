import { useEffect, useState } from "react";
import { DashboardLayout } from "../../layout";
import { Card, Button, Modal, InputField, Select, LoadingSpinner, Alert, EmptyState } from "../../common";
import { useAuth } from "../../../hooks/useAuth";
import { formatCurrency, formatDateTime } from "../../../utils/helpers";
import { orderApi, customerApi } from "../../../services/mockApi";
import { vehicleApi } from "../../../services/vehicleApi";


function OrdersPage() {
    // Notification for incomplete fields
    const [showIncompleteAlert, setShowIncompleteAlert] = useState(false);

    // Helper to check if any required field is blank
    const isAnyRequiredFieldBlank = () => {
        return !formData.customer_name || !formData.customer_phone || !formData.customer_address;
    };

    // Handler for blur event
    const handleBlur = () => {
        if (isAnyRequiredFieldBlank()) {
            setShowIncompleteAlert(true);
        } else {
            setShowIncompleteAlert(false);
        }
    };
    const { user } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal & form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [availableVehicles, setAvailableVehicles] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ customer_id: "", vehicle_id: "", payment_type: "full" });
    const [alert, setAlert] = useState({ type: "", message: "" });

    useEffect(() => {
        // Fetch orders, customers, and vehicles for display
        const fetchAll = async () => {
            try {
                setLoading(true);
                const [ordersData, customersData, vehiclesResponse] = await Promise.all([
                    orderApi.getAll(user?.dealer_id, user?.id),
                    customerApi.getAll(user?.id),
                    vehicleApi.getAll(user?.id)
                ]);
                setOrders(Array.isArray(ordersData) ? ordersData : []);
                setCustomers(Array.isArray(customersData) ? customersData : []);
                let vehicles = [];
                // Support both real API (object with .data) and mock API (array)
                if (Array.isArray(vehiclesResponse)) {
                    vehicles = vehiclesResponse.filter(v => v.status === "Available");
                } else if (vehiclesResponse && Array.isArray(vehiclesResponse.data)) {
                    vehicles = vehiclesResponse.data.filter(v => v.status === "Available");
                }
                setAvailableVehicles(vehicles);
            } catch (err) {
                console.error("Error fetching orders/customers/vehicles:", err);
                setAlert({ type: "error", message: "Failed to load orders or related data" });
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [user?.dealer_id, user?.id]);

    const openCreateModal = async () => {
        try {
            // Fetch customers for this staff
            const custs = await customerApi.getAll(user?.id);
            setCustomers(Array.isArray(custs) ? custs : []);
            // Fetch vehicles using the same API as VehiclesPage
            const response = await vehicleApi.getAll(user?.id);
            let vehicles = [];
            // Support both real API (object with .data) and mock API (array)
            if (Array.isArray(response)) {
                vehicles = response.filter(v => v.status === "Available");
            } else if (response && Array.isArray(response.data)) {
                vehicles = response.data.filter(v => v.status === "Available");
            }
            setAvailableVehicles(vehicles);
            setFormData({ customer_id: custs?.[0]?.id || "", vehicle_id: vehicles?.[0]?.id || "", payment_type: "full" });
            setAlert({ type: "", message: "" });
            setIsModalOpen(true);
        } catch (err) {
            console.error("Error preparing create order modal:", err);
            setAlert({ type: "error", message: "Failed to prepare order form" });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsSubmitting(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // If changing customer_name, check for existing customer and autofill
        if (name === "customer_name") {
            const matched = customers.find(c => c.full_name.toLowerCase() === value.toLowerCase());
            if (matched) {
                setFormData((prev) => ({
                    ...prev,
                    customer_name: value,
                    customer_phone: matched.phone,
                    customer_address: matched.address
                }));
                return;
            }
        }
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        if (!formData.customer_id || !formData.vehicle_id) {
            setAlert({ type: "error", message: "Please select customer and vehicle." });
            return;
        }
        try {
            setIsSubmitting(true);
            // Find selected vehicle price
            const vehicle = availableVehicles.find((v) => v.id === formData.vehicle_id);
            const qty = formData.quantity || 1;
            const price = vehicle ? (vehicle.basePrice || vehicle.base_price || 0) : 0;
            const payload = {
                customer_id: formData.customer_id,
                dealer_staff_id: user?.id,
                dealer_id: user?.dealer_id,
                vehicle_id: formData.vehicle_id,
                total_amount: price * qty,
                payment_type: formData.payment_type,
                order_status: "confirmed",
            };
            const created = await orderApi.create(payload);
            setOrders((prev) => [created, ...prev]);
            setAlert({ type: "success", message: "Order created successfully" });
            setTimeout(() => closeModal(), 800);
        } catch (err) {
            console.error("Error creating order:", err);
            setAlert({ type: "error", message: "Failed to create order" });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper to get available stock for selected vehicle
    const selectedVehicle = availableVehicles.find(v => v.id === formData.vehicle_id);
    const selectedQty = formData.quantity || 1;
    // Check all possible stock fields for compatibility
    const stockCount = selectedVehicle ? (
        selectedVehicle.stock ??
        selectedVehicle.available ??
        selectedVehicle.inStock ??
        selectedVehicle.currentStock ??
        0
    ) : 0;
    const notEnoughStock = selectedVehicle && selectedQty > stockCount;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Orders Page</h1>
                        <p className="text-slate-400">Welcome back, {user?.full_name}!</p>
                    </div>
                    <Button onClick={openCreateModal}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Order
                    </Button>
                </div>

                {alert.message && <Alert type={alert.type}>{alert.message}</Alert>}

                {/* Orders Grid */}
                <div>
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <LoadingSpinner size="lg" text="Loading orders..." />
                        </div>
                    ) : orders.length === 0 ? (
                        <EmptyState title="No orders found" description="You don't have any orders yet." action={openCreateModal} actionLabel="Create Order" />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {orders.map((o) => {
                                // Find customer and vehicle info
                                const customer = customers.find(c => c.id === o.customer_id);
                                const vehicle = availableVehicles.find(v => v.id === o.vehicle_id);
                                return (
                                    <Card key={o.id} hover>
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <div className="text-slate-400 text-sm">Order ID</div>
                                                <div className="text-white font-medium">{o.id}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-slate-400 text-sm">Date</div>
                                                <div className="text-white font-semibold">{formatDateTime(o.created_at)}</div>
                                            </div>
                                        </div>
                                        <div className="text-slate-300 text-sm mb-2">Customer: <span className="text-white">{customer ? customer.full_name : o.customer_id}</span></div>
                                        <div className="text-slate-300 text-sm mb-2">Vehicle: <span className="text-white">{vehicle ? `${vehicle.modelName || vehicle.model_name} ${vehicle.version || ''}` : o.vehicle_id}</span></div>
                                        <div className="text-slate-400 text-sm mt-2">Status: <span className="text-white capitalize">{o.order_status || o.status}</span></div>
                                        <div className="text-slate-400 text-sm mt-2">Total: <span className="text-white font-semibold">{formatCurrency(o.total_amount || o.total_price || 0)}</span></div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Create Order Modal */}
                <Modal isOpen={isModalOpen} onClose={closeModal} title="Create Order">
                    <form onSubmit={handleCreateOrder} className="space-y-4">
                        {/* Vehicle Selection */}
                        <div>
                            <label htmlFor="vehicle_id" className="block text-sm font-medium text-slate-300 mb-2">Select Vehicle</label>
                            <select
                                id="vehicle_id"
                                name="vehicle_id"
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg text-white px-4 py-3 focus:outline-none mb-4"
                                value={formData.vehicle_id || ''}
                                onChange={e => setFormData(f => ({ ...f, vehicle_id: e.target.value }))}
                                required
                            >
                                <option value="" disabled>Select a vehicle</option>
                                {availableVehicles.map(v => (
                                    <option key={v.id} value={v.id}>{`${v.modelName || v.model_name} ${v.version || ''}`}</option>
                                ))}
                            </select>
                        </div>
                        {/* Product Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full border text-white">
                                <thead className="bg-orange-500">
                                    <tr>
                                        <th className="px-2 py-2">Image</th>
                                        <th className="px-2 py-2">Product</th>
                                        <th className="px-2 py-2">Unit Price</th>
                                        <th className="px-2 py-2">Quantity</th>
                                        <th className="px-2 py-2">Total</th>
                                        <th className="px-2 py-2">Remove</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="px-2 py-2 text-center">
                                            {(() => {
                                                const v = availableVehicles.find(v => v.id === formData.vehicle_id);
                                                return v ? (
                                                    <img src={v.imageUrl || v.image_url || "https://via.placeholder.com/80x60?text=No+Image"} alt={v.modelName || v.model_name} className="w-16 h-12 object-cover rounded bg-slate-700" />
                                                ) : null;
                                            })()}
                                        </td>
                                        <td className="px-2 py-2 font-semibold">
                                            {(() => {
                                                const v = availableVehicles.find(v => v.id === formData.vehicle_id);
                                                return v ? `${v.modelName || v.model_name} ${v.version || ''}` : '';
                                            })()}
                                        </td>
                                        <td className="px-2 py-2 text-right">
                                            {(() => {
                                                const v = availableVehicles.find(v => v.id === formData.vehicle_id);
                                                return v ? `${(v.basePrice || v.base_price || 0).toLocaleString()} VND` : '';
                                            })()}
                                        </td>
                                        <td className="px-2 py-2 text-center">
                                            <input
                                                type="number"
                                                min={1}
                                                value={formData.quantity || 1}
                                                onChange={e => setFormData(f => ({ ...f, quantity: Math.max(1, Number(e.target.value)) }))}
                                                className="w-16 px-2 py-1 rounded bg-slate-700 border border-slate-600 text-white text-center"
                                                disabled={!formData.vehicle_id}
                                            />
                                        </td>
                                        <td className="px-2 py-2 text-right font-bold text-red-400">
                                            {(() => {
                                                const v = availableVehicles.find(v => v.id === formData.vehicle_id);
                                                const qty = formData.quantity || 1;
                                                return v ? `${((v.basePrice || v.base_price || 0) * qty).toLocaleString()} VND` : '';
                                            })()}
                                        </td>
                                        <td className="px-2 py-2 text-center">
                                            <Button type="button" variant="secondary" onClick={() => setFormData(f => ({ ...f, vehicle_id: "" }))} disabled={!formData.vehicle_id}>Remove</Button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Total Price */}
                        <div className="text-right text-lg font-bold text-red-400">
                            Total: {(() => {
                                const v = availableVehicles.find(v => v.id === formData.vehicle_id) || availableVehicles[0];
                                const qty = formData.quantity || 1;
                                return v ? `${((v.basePrice || v.base_price || 0) * qty).toLocaleString()} VND` : '0 VND';
                            })()}
                        </div>

                        {/* Payment Method */}
                        <div>
                            <div className="font-semibold mb-2 text-white">Choose Payment Method</div>
                            <div className="flex flex-col gap-2">
                                <label className="flex items-center gap-2 text-white">
                                    <input type="radio" name="payment_type" value="full" checked={formData.payment_type === 'full'} onChange={handleInputChange} />
                                    <span>Full</span>
                                </label>
                                <label className="flex items-center gap-2 text-white">
                                    <input type="radio" name="payment_type" value="installment" checked={formData.payment_type === 'installment'} onChange={handleInputChange} />
                                    <span>Installment</span>
                                </label>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div>
                            <div className="font-semibold mb-2">Order Information</div>
                            <div className="grid grid-cols-1 gap-3">
                                <InputField id="customer_name" name="customer_name" label="Full Name" value={formData.customer_name || ''} onChange={handleInputChange} onBlur={handleBlur} required autoComplete="off" />
                                <InputField id="customer_phone" name="customer_phone" label="Phone Number" value={formData.customer_phone || ''} onChange={handleInputChange} onBlur={handleBlur} required autoComplete="off" />
                                <InputField id="customer_address" name="customer_address" label="Address" value={formData.customer_address || ''} onChange={handleInputChange} onBlur={handleBlur} required autoComplete="off" />
                                <InputField id="note" name="note" label="Request" value={formData.note || ''} onChange={handleInputChange} onBlur={handleBlur} autoComplete="off" />
                            </div>
                        </div>

                        {notEnoughStock && (
                            <div className="text-red-400 text-sm font-semibold mt-2">There are not enough vehicles for this order to proceed</div>
                        )}
                        <div className="mt-4 flex items-center justify-end space-x-2">
                            {showIncompleteAlert && (
                                <div className="text-yellow-400 text-sm font-semibold mb-2">Please fill in all required fields before submitting the order.</div>
                            )}
                            <Button type="button" variant="secondary" onClick={closeModal} disabled={isSubmitting}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting || notEnoughStock} className={notEnoughStock ? 'opacity-50 cursor-not-allowed' : ''}>{isSubmitting ? 'Placing...' : 'Place Order'}</Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}

export default OrdersPage;