import { DashboardLayout } from "../../layout";
import { Card } from "../../common";
import { useAuth } from "../../../hooks/useAuth";
import { MOCK_DEALERS } from "../../../data/mockData";
import { formatCurrency, getInitials } from "../../../utils/helpers";

function ReportsPage() {
    const { user } = useAuth();

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white">Reports</h1>
                    <p className="text-slate-400">Welcome back, {user?.full_name}!</p>
                </div>

                {/* Dealers / Reports Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_DEALERS.map((d) => (
                        <Card key={d.id} hover className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="h-12 w-12 rounded-full bg-slate-700 flex items-center justify-center text-white font-semibold">
                                    {getInitials(d.name)}
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-white font-medium">{d.name}</h3>
                                    <div className={`text-sm ${d.is_active ? 'text-green-400' : 'text-red-400'}`}>{d.is_active ? 'Active' : 'Inactive'}</div>
                                </div>
                                <div className="text-slate-300 text-sm mt-1">{d.address}</div>
                                <div className="text-slate-400 text-sm mt-2">{d.phone} • {d.email}</div>
                                <div className="text-slate-400 text-sm mt-2">Contract: {d.contract_number}</div>
                                <div className="text-white font-semibold mt-2">Sales Target: {formatCurrency(d.sales_target)}</div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}

export default ReportsPage;