import { DashboardLayout } from "../../layout";
import { Card } from "../../common";
import { useAuth } from "../../../hooks/useAuth";
import { MOCK_ORDERS } from "../../../data/mockData";
import { formatCurrency, formatDateTime } from "../../../utils/helpers";

function OrdersPage() {
    const { user } = useAuth();
    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white">Orders Page</h1>
                    <p className="text-slate-400">Welcome back, {user?.full_name}!</p>
                </div>
                {/* Orders Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_ORDERS.map((o) => (
                        <Card key={o.id} hover>
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <div className="text-slate-400 text-sm">Order ID</div>
                                    <div className="text-white font-medium">{o.id}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-slate-400 text-sm">Date</div>
                                    <div className="text-white font-semibold">{formatDateTime(o.order_date)}</div>
                                </div>
                            </div>
                            <div className="text-slate-300 text-sm mb-2">Customer: <span className="text-white">{o.customer_id}</span></div>
                            <div className="text-slate-300 text-sm mb-2">Vehicle: <span className="text-white">{o.vehicle_id}</span></div>
                            <div className="text-slate-400 text-sm mt-2">Status: <span className="text-white capitalize">{o.status}</span></div>
                            <div className="text-slate-400 text-sm mt-2">Total: <span className="text-white font-semibold">{formatCurrency(o.total_amount)}</span></div>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
export default OrdersPage;