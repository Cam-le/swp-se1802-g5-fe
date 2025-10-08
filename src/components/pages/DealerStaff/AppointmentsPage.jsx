import { DashboardLayout } from "../../layout";
import { Card } from "../../common";
import { useAuth } from "../../../hooks/useAuth";
import { MOCK_APPOINTMENTS } from "../../../data/mockData";
import { formatDateTime } from "../../../utils/helpers";

function AppointmentsPage() {
    const { user } = useAuth();

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white">Appointments Page</h1>
                    <p className="text-slate-400">Welcome back, {user?.full_name}!</p>
                </div>

                {/* Appointments Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_APPOINTMENTS.map((a) => (
                        <Card key={a.id} hover>
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <div className="text-slate-400 text-sm">Appointment</div>
                                    <div className="text-white font-medium">{a.id}</div>
                                </div>
                                <div className="text-sm text-slate-400">{formatDateTime(a.appointment_date)}</div>
                            </div>

                            <div className="text-slate-300 text-sm mb-2">Customer: <span className="text-white">{a.customer_id}</span></div>
                            <div className="text-slate-300 text-sm mb-2">Vehicle: <span className="text-white">{a.vehicle_id}</span></div>
                            <div className="text-slate-300 text-sm mb-2">Staff: <span className="text-white">{a.dealer_staff_id}</span></div>

                            <div className="mt-3 text-sm text-slate-400">
                                Status: <span className="text-white capitalize">{a.status}</span>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}

export default AppointmentsPage;