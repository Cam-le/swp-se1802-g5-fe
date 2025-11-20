import { useEffect, useState } from "react";
import { DashboardLayout } from "../../layout";
import { Button, Modal, InputField, Alert, EmptyState, LoadingSpinner } from "../../common";
import { useAuth } from "../../../hooks/useAuth";
import { formatCurrency, formatDateTime } from "../../../utils/helpers";
import dealerOrdersApi from "../../../services/dealerOrdersApi";
import { customerApi } from "../../../services/customerApi";
import { vehicleApi } from "../../../services/vehicleApi";
import OrdersDetail from './OrdersDetail';


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
    const [phoneError, setPhoneError] = useState("");
    const [alert, setAlert] = useState({ type: "", message: "" });
    const [showOrderDetail, setShowOrderDetail] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        // Fetch orders, customers, and vehicles for display
        const fetchAll = async () => {
            try {
                setLoading(true);
                const [ordersData, customersData, vehiclesResponse] = await Promise.all([
                    dealerOrdersApi.getAll(user?.dealer_id),
                    customerApi.getAll(),
                    vehicleApi.getAll(user?.id)
                ]);
                setOrders(Array.isArray(ordersData) ? ordersData : []);
                setCustomers(Array.isArray(customersData) ? customersData : []);
                let vehicles = [];
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
        if (name === "customer_phone") {
            if (/[a-zA-Z]/.test(value)) {
                setPhoneError("Letter is not allowed");
            } else {
                setPhoneError("");
            }
        }
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
        if (!formData.customer_name || !formData.customer_phone || !formData.customer_address || !formData.vehicle_id) {
            setAlert({ type: "error", message: "Please fill in all required fields." });
            return;
        }
        try {
            setIsSubmitting(true);
            // Find selected vehicle price
            const vehicle = availableVehicles.find((v) => v.id === formData.vehicle_id);
            const qty = formData.quantity || 1;
            const price = vehicle ? (vehicle.basePrice || vehicle.base_price || 0) : 0;
            // Check if customer exists by name, phone, and address
            let customer = customers.find(c =>
                c.full_name.trim().toLowerCase() === formData.customer_name.trim().toLowerCase() &&
                c.phone.trim() === formData.customer_phone.trim() &&
                c.address.trim().toLowerCase() === formData.customer_address.trim().toLowerCase()
            );
            let customer_id = customer ? customer.id : null;
            // If not found, create new customer
            if (!customer_id) {
                const newCustomer = await customerApi.create({
                    full_name: formData.customer_name.trim(),
                    phone: formData.customer_phone.trim(),
                    address: formData.customer_address.trim(),
                    email: formData.customer_email || "", // Add email if available
                    dealer_staff_id: user?.id,
                });
                customer_id = newCustomer.id;
                // Add to customers list immediately
                setCustomers(prev => [newCustomer, ...prev]);
            }
            const payload = {
                customerId: customer_id,
                customerName: formData.customer_name,
                customerPhone: formData.customer_phone,
                dealerStaffId: user?.id,
                dealerStaffName: user?.full_name || user?.name || "",
                dealerId: user?.dealer_id,
                dealerName: user?.dealer_name || "",
                vehicleId: formData.vehicle_id,
                vehicleModelName: vehicle?.modelName || vehicle?.model_name || "",
                vehicleVersion: vehicle?.version || "",
                inventoryId: vehicle?.inventoryId || vehicle?.inventory_id || "",
                vinNumber: vehicle?.vinNumber || vehicle?.vin_number || "",
                totalPrice: price * qty,
                orderStatus: "confirmed",
                paymentStatus: formData.payment_type === "full" ? "paid" : "partial_paid",
                paymentType: formData.payment_type,
                note: formData.note || null,
            };
            const created = await dealerOrdersApi.create(payload);
            setOrders((prev) => [created, ...prev]);
            // Refetch customers to ensure the latest list (including new customers)
            try {
                const customersData = await customerApi.getAll(user?.id);
                setCustomers(Array.isArray(customersData) ? customersData : []);
            } catch (err) {
                // Optionally handle error
            }
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

    const handleShowOrderDetail = (order) => {
        setSelectedOrder(order);
        setShowOrderDetail(true);
    };
    const handleCloseOrderDetail = () => {
        setShowOrderDetail(false);
        setSelectedOrder(null);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Orders Page</h1>
                        <p className="text-slate-400">Manage Customer's orders</p>
                    </div>
                    <Button onClick={openCreateModal}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Order
                    </Button>
                </div>

                {alert.message && <Alert type={alert.type}>{alert.message}</Alert>}

                {/* Orders Table */}
                <div>
                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <LoadingSpinner size="lg" text="Loading orders..." />
                        </div>
                    ) : orders.length === 0 ? (
                        <EmptyState title="No orders found" description="You don't have any orders yet." action={openCreateModal} actionLabel="Create Order" />
                    ) : (
                        <div className="overflow-x-auto rounded-lg shadow">
                            <table className="min-w-full bg-slate-800 text-white">
                                <thead>
                                    <tr className="bg-slate-700">
                                        <th className="px-4 py-2 text-left">Order ID</th>
                                        <th className="px-4 py-2 text-left">Date</th>
                                        <th className="px-4 py-2 text-left">Customer</th>
                                        <th className="px-4 py-2 text-left">Vehicle</th>
                                        <th className="px-4 py-2 text-left">Status</th>
                                        <th className="px-4 py-2 text-left">Total</th>
                                        <th className="px-4 py-2 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((o) => {
                                        return (
                                            <tr key={o.id} className="border-b border-slate-700">
                                                <td className="px-4 py-2">{o.id}</td>
                                                <td className="px-4 py-2">{formatDateTime(o.createdAt || o.created_at)}</td>
                                                <td className="px-4 py-2">{o.customerName || o.customerId}</td>
                                                <td className="px-4 py-2">{o.vehicleModelName ? `${o.vehicleModelName} ${o.vehicleVersion || ''}` : o.vehicleId}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${o.orderStatus === "confirmed" ? "bg-green-500 text-white" : "bg-slate-600"}`}>{o.orderStatus || o.status}</span>
                                                </td>
                                                <td className="px-4 py-2 font-bold text-orange-400">{formatCurrency(o.totalPrice || o.total_amount || o.total_price || 0)}</td>
                                                <td className="px-4 py-2 flex gap-2">
                                                    <Button variant="primary" size="sm" onClick={() => handleShowOrderDetail(o)} title="Details">
                                                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
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
                                <InputField id="customer_phone" name="customer_phone" label="Phone Number" value={formData.customer_phone || ''} onChange={handleInputChange} onBlur={handleBlur} required autoComplete="off" error={phoneError} />
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

                {/* Order Detail Modal */}
                <Modal isOpen={showOrderDetail} onClose={handleCloseOrderDetail} title="Order Details" size="lg">
                    {selectedOrder && (() => {
                        const customer = customers.find(c => c.id === selectedOrder.customer_id);
                        const vehicle = availableVehicles.find(v => v.id === selectedOrder.vehicle_id);
                        return (
                            <OrdersDetail
                                order={selectedOrder}
                                customer={customer}
                                vehicle={vehicle}
                            />
                        );
                    })()}
                </Modal>
            </div>
        </DashboardLayout>
    );
}

export default OrdersPage;