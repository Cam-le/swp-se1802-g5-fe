import { DashboardLayout } from "../../layout";
import { Card } from "../../common";
import { useAuth } from "../../../hooks/useAuth";
import { MOCK_CUSTOMERS } from "../../../data/mockData";
import { getInitials } from "../../../utils/helpers";

function CustomersPage() {
    const { user } = useAuth();

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white">Customers Page</h1>
                    <p className="text-slate-400">Welcome back, {user?.full_name}!</p>
                </div>
                {/* Customers Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_CUSTOMERS.map((c) => (
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
            </div>
        </DashboardLayout>
    );
}
export default CustomersPage;