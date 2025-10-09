import { DashboardLayout } from "../../layout";
import { Card } from "../../common";
import { useAuth } from "../../../hooks/useAuth";
import { MOCK_VEHICLES } from "../../../data/mockData";
import { formatCurrency, formatShortDate, truncateText } from "../../../utils/helpers";

function VehiclesPage() {
    const { user } = useAuth();

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white">Vehicle Page</h1>
                    <p className="text-slate-400">Welcome back, {user?.full_name}!</p>
                </div>

                {/* Vehicles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {MOCK_VEHICLES.map((v) => (
                        <Card key={v.id} hover className="flex flex-col">
                            <div className="h-40 w-full rounded-md overflow-hidden mb-4 bg-slate-900 flex items-center justify-center">
                                <img
                                    src={v.image_url}
                                    alt={v.model_name}
                                    className="object-cover h-full w-full"
                                />
                            </div>

                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white">
                                    {v.model_name} {v.version && <span className="text-sm text-slate-400">- {v.version}</span>}
                                </h3>
                                <p className="text-slate-400 text-sm mb-2">{truncateText(v.description, 80)}</p>

                                <div className="flex items-center justify-between text-sm text-slate-300">
                                    <div>
                                        <div>Range: <span className="font-medium text-white">{v.range_per_charge} km</span></div>
                                        <div>Battery: <span className="font-medium text-white">{v.battery_capacity} kWh</span></div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-slate-400">Status</div>
                                        <div className="font-medium text-white capitalize">{v.status}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-slate-400">Launch Date</div>
                                    <div className="text-sm font-medium text-white">{formatShortDate(v.launch_date)}</div>
                                </div>
                                <div className="mt-2 text-xl font-semibold text-white">{formatCurrency(v.base_price)}</div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}

export default VehiclesPage;