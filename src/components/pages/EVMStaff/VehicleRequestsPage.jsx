
import { useEffect, useState } from "react";
import { DashboardLayout } from "../../layout";
import { vehicleRequestApi } from "../../../services/mockApi";
import { MOCK_VEHICLES, MOCK_USERS } from "../../../data/mockData";

function VehicleRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      setLoading(true);
      const data = await vehicleRequestApi.getAll();
      setRequests(data);
      setLoading(false);
    }
    fetchRequests();
  }, []);

  const getVehicleName = (id) => {
    const v = MOCK_VEHICLES.find((veh) => veh.id === id);
    return v ? `${v.model_name} (${v.version})` : id;
  };
  const getUserName = (id) => {
    const u = MOCK_USERS.find((user) => user.id === id);
    return u ? u.full_name : id;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Vehicle Requests</h1>
          <p className="text-slate-400">Manage and approve dealer vehicle allocation requests</p>
        </div>
        {loading ? (
          <div className="text-slate-400">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="text-slate-400">No vehicle requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-slate-800 rounded-lg">
              <thead>
                <tr className="text-slate-300 text-left">
                  <th className="px-4 py-2">Request ID</th>
                  <th className="px-4 py-2">Vehicle</th>
                  <th className="px-4 py-2">Quantity</th>
                  <th className="px-4 py-2">Dealer</th>
                  <th className="px-4 py-2">Requested By</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Created At</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.id} className="border-b border-slate-700">
                    <td className="px-4 py-2 text-white">{req.id}</td>
                    <td className="px-4 py-2 text-white">{getVehicleName(req.vehicle_id)}</td>
                    <td className="px-4 py-2 text-white">{req.quantity}</td>
                    <td className="px-4 py-2 text-white">{req.dealer_id}</td>
                    <td className="px-4 py-2 text-white">{getUserName(req.requested_by)}</td>
                    <td className="px-4 py-2 text-white">{req.requested_by_role}</td>
                    <td className="px-4 py-2 text-white capitalize">{req.status}</td>
                    <td className="px-4 py-2 text-white">{new Date(req.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default VehicleRequestsPage;
