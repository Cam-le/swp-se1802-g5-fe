import { useEffect, useState } from "react";
import { DashboardLayout } from "../../layout";
import { Card, Button, Modal, InputField, Select, LoadingSpinner, Alert, EmptyState } from "../../common";
import { useAuth } from "../../../hooks/useAuth";
import { formatCurrency, formatDateTime } from "../../../utils/helpers";
import { orderApi, customerApi, inventoryApi } from "../../../services/mockApi";


function OrdersPage() {
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
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.dealer_id, user?.id]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await orderApi.getAll(user?.dealer_id, user?.id);
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setAlert({ type: "error", message: "Failed to load orders" });
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = async () => {
        // fetch customers for this staff
        try {
            const custs = await customerApi.getAll(user?.id);
            setCustomers(Array.isArray(custs) ? custs : []);
            // fetch available vehicles by dealer
            const inventory = await inventoryApi.getByDealer(user?.dealer_id);
            // map inventory to unique vehicle ids and count available
            const vehicleCounts = {};
            inventory.forEach((inv) => {
                if (inv.status === "available") {
                    vehicleCounts[inv.vehicle_id] = (vehicleCounts[inv.vehicle_id] || 0) + 1;
                }
            });
            // get vehicle details from MOCK_VEHICLES by filtering ids
            // since DealerStaff Vehicles page uses MOCK_VEHICLES, we will derive vehicle list by id and include available count
            const allVehicles = (await import("../../../data/mockData")).MOCK_VEHICLES;
            const vehicles = allVehicles
                .filter((v) => Object.keys(vehicleCounts).includes(v.id))
                .map((v) => ({ id: v.id, model_name: v.model_name, base_price: v.base_price, available: vehicleCounts[v.id] }));
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
            const payload = {
                customer_id: formData.customer_id,
                dealer_staff_id: user?.id,
                dealer_id: user?.dealer_id,
                vehicle_id: formData.vehicle_id,
                total_amount: vehicle ? vehicle.base_price : 0,
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
                            {orders.map((o) => (
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
                                    <div className="text-slate-300 text-sm mb-2">Customer: <span className="text-white">{o.customer_id}</span></div>
                                    <div className="text-slate-300 text-sm mb-2">Vehicle: <span className="text-white">{o.vehicle_id}</span></div>
                                    <div className="text-slate-400 text-sm mt-2">Status: <span className="text-white capitalize">{o.order_status || o.status}</span></div>
                                    <div className="text-slate-400 text-sm mt-2">Total: <span className="text-white font-semibold">{formatCurrency(o.total_amount || o.total_price || 0)}</span></div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create Order Modal */}
                <Modal isOpen={isModalOpen} onClose={closeModal} title="Create Order">
                    <form onSubmit={handleCreateOrder}>
                        <div className="grid grid-cols-1 gap-4">
                            <Select id="customer_id" name="customer_id" label="Customer" value={formData.customer_id} onChange={handleInputChange} options={customers.map(c => ({ value: c.id, label: c.full_name }))} />
                            <Select id="vehicle_id" name="vehicle_id" label="Vehicle" value={formData.vehicle_id} onChange={handleInputChange} options={availableVehicles.map(v => ({ value: v.id, label: `${v.model_name} (${v.available} available)` }))} />
                            <Select id="payment_type" name="payment_type" label="Payment Type" value={formData.payment_type} onChange={handleInputChange} options={[{ value: 'full', label: 'Full' }, { value: 'installment', label: 'Installment' }]} />
                        </div>

                        <div className="mt-4 flex items-center justify-end space-x-2">
                            <Button type="button" variant="secondary" onClick={closeModal} disabled={isSubmitting}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Order'}</Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}

export default OrdersPage;