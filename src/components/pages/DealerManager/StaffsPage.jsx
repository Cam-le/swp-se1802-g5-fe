import { DashboardLayout } from "../../layout";
import { Card } from "../../common";
import { useAuth } from "../../../hooks/useAuth";
import { MOCK_USERS } from "../../../data/mockData";
import { getInitials } from "../../../utils/helpers";

function StaffsPage() {
    const { user } = useAuth();

    // Filter out admin/evm users if you want only dealer staff/manager
    const staffs = MOCK_USERS.filter((u) => ["Dealer Manager", "Dealer Staff"].includes(u.role));

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white">Staffs Management</h1>
                    <p className="text-slate-400">Welcome back, {user?.full_name}!</p>
                </div>

                {/* Staffs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {staffs.map((s) => (
                        <Card key={s.id} hover className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                                <div className="h-12 w-12 rounded-full bg-slate-700 flex items-center justify-center text-white font-semibold">
                                    {getInitials(s.full_name)}
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-white font-medium">{s.full_name}</h3>
                                    <div className="text-sm text-slate-400">{s.role}</div>
                                </div>
                                <div className="text-slate-300 text-sm mt-1">{s.email}</div>
                                {s.dealer_name && (
                                    <div className="text-slate-400 text-sm mt-2">Dealer: {s.dealer_name}</div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}

export default StaffsPage;