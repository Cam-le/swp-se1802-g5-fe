import { DashboardLayout } from "../../layout";
import { Card } from "../../common";
import { useAuth } from "../../../hooks/useAuth";
import { MOCK_DEALERS } from "../../../data/mockData";
import { formatDateTime, formatCurrency } from "../../../utils/helpers";

function DealerManagerReportsPage() {
    const { user } = useAuth();

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white">Reports Page</h1>
                    <p className="text-slate-400">Welcome back, {user?.full_name}!</p>
                </div>
                {/* Dealers / Reports Grid — rendering from dealer mock data */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_DEALERS.map((d) => (
                        <Card key={d.id} hover className="flex items-start space-x-4">
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <div className="text-slate-400 text-sm">Dealer</div>
                                        <div className="text-white font-medium">{d.name}</div>
                                    </div>
                                    <div className={`text-sm ${d.is_active ? 'text-green-400' : 'text-red-400'}`}>{d.is_active ? 'Active' : 'Inactive'}</div>
                                </div>

                                <div className="text-slate-300 text-sm mb-2">Address: <span className="text-white">{d.address}</span></div>
                                <div className="text-slate-400 text-sm mt-2">Phone: <span className="text-white">{d.phone}</span></div>
                                <div className="text-white font-semibold mt-2">Sales Target: {formatCurrency(d.sales_target)}</div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
export default DealerManagerReportsPage;