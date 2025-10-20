import { useEffect, useState } from "react";
import { DashboardLayout } from "../../layout";
import { Table, Button, Alert, Modal } from "../../common";
import { vehicleRequestApi } from "../../../services/mockApi";
import { MOCK_VEHICLES } from "../../../data/mockData";
import { useAuth } from "../../../hooks/useAuth";

function RequestVerificationPage() {
    // Helper to get vehicle name by id
    const getVehicleName = (id) => {
        const v = MOCK_VEHICLES.find((veh) => veh.id === id);
        return v ? `${v.model_name} ${v.version}` : id;
    };
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState({ type: "", message: "" });
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const allRequests = await vehicleRequestApi.getAll();
            // Only show requests for this dealer, pending manager verification
            const filtered = allRequests.filter(
                (r) => r.dealer_id === user?.dealer_id && r.status === "pending_manager"
            );
            setRequests(filtered);
        } catch (err) {
            setAlert({ type: "error", message: "Failed to load requests" });
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = (request) => {
        setSelectedRequest(request);
        setIsModalOpen(true);
    };

    const handleApprove = async () => {
        if (!selectedRequest) return;
        // Update status to pending_evm
        selectedRequest.status = "pending_evm";
        setAlert({ type: "success", message: "Request approved and sent to EVM Staff." });
        setIsModalOpen(false);
        setSelectedRequest(null);
        await fetchRequests();
    };

    const handleReject = async () => {
        if (!selectedRequest) return;
        selectedRequest.status = "rejected";
        setAlert({ type: "warning", message: "Request rejected." });
        setIsModalOpen(false);
        setSelectedRequest(null);
        await fetchRequests();
    };

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white">Verify Stock Requests</h1>
                <p className="text-slate-400">Review and verify vehicle stock requests from Dealer Staff before sending to EVM Staff.</p>
            </div>
            {alert.message && <Alert type={alert.type}>{alert.message}</Alert>}
            {loading ? (
                <div className="text-slate-400">Loading requests...</div>
            ) : requests.length === 0 ? (
                <div className="text-slate-400">No pending requests to verify.</div>
            ) : (
                <Table>
                    <thead className="bg-slate-800 text-white">
                        <tr>
                            <th>Vehicle</th>
                            <th>Quantity</th>
                            <th>Requested By</th>
                            <th>Date</th>
                            <th>Note</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-white">
                        {requests.map((r) => (
                            <tr key={r.id}>
                                <td>{r.modelName ? `${r.modelName} ${r.version}` : r.vehicle_id}</td>
                                <td>{r.quantity}</td>
                                <td>{r.requested_by}</td>
                                <td>{new Date(r.created_at).toLocaleString()}</td>
                                <td>{r.note || <span className="italic text-slate-400">No note</span>}</td>
                                <td>
                                    <Button onClick={() => handleVerify(r)}>Verify</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {/* Modal for Approve/Reject */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Verify Request">
                <div className="mb-4">
                    <p className="text-white">Vehicle: {selectedRequest ? `${selectedRequest.modelName || ""} ${selectedRequest.version || ""}` : ""}</p>
                    <p className="text-white">Quantity: {selectedRequest?.quantity}</p>
                    <p className="text-white">Requested By: {selectedRequest?.requested_by}</p>
                    <p className="text-white">Note: {selectedRequest?.note ? selectedRequest.note : <span className="italic text-slate-400">No note provided</span>}</p>
                </div>
                <div className="flex gap-2 justify-end">
                    <Button variant="secondary" onClick={handleReject}>Reject</Button>
                    <Button variant="primary" onClick={handleApprove}>Approve</Button>
                </div>
            </Modal>
        </DashboardLayout>
    );
}

export default RequestVerificationPage;
