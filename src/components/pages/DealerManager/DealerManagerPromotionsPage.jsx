import { DashboardLayout } from "../../layout";
import { Card } from "../../common";
import { useAuth } from "../../../hooks/useAuth";

function DealerManagerPromotionsPage() {
    const { user } = useAuth();
    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white">Promotions Page</h1>
                    <p className="text-slate-400">Welcome back, {user?.full_name}!</p>
                </div>
                {/* Promotions Content */}
                <div className="text-slate-400">Promotions content will go here.</div>
            </div>
        </DashboardLayout>
    );
}
export default DealerManagerPromotionsPage;