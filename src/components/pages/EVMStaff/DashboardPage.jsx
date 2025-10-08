import { DashboardLayout } from "../../layout";
import { Card } from "../../common";
import { useAuth } from "../../../hooks/useAuth";

function EVMStaffDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">EVM Staff Dashboard</h1>
          <p className="text-slate-400">Welcome back, {user?.full_name}!</p>
        </div>

        <Card>
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 bg-opacity-20 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              EVM Dashboard Coming Soon
            </h3>
            <p className="text-slate-400">
              Dashboard with inventory management and dealer overview
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default EVMStaffDashboard;
