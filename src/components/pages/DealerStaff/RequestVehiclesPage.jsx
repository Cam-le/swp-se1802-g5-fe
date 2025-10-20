import { useEffect, useState } from "react";
import { DashboardLayout } from "../../layout";
import {
  Table,
  Button,
  Alert,
  Modal,
  LoadingSpinner,
  EmptyState,
  Badge,
} from "../../common";
import { vehicleRequestApi } from "../../../services/vehicleRequestApi";
import { useAuth } from "../../../hooks/useAuth";
import { formatDateTime } from "../../../utils/helpers";

function RequestVerificationPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    setLoading(true);
    setAlert({ type: "", message: "" });
    try {
      const response = await vehicleRequestApi.getAll();

      if (response.isSuccess) {
        const allRequests = response.data || [];

        // Filter for pending/processing requests for this dealer
        const filtered = allRequests.filter((req) => {
          const statusMatch =
            req.status?.toLowerCase() === "processing" ||
            req.status?.toLowerCase() === "pending";
          const dealerMatch = req.dealerId === user?.dealer_id;
          return true && dealerMatch;
        });

        setRequests(filtered);
        console.log("📋 Filtered Requests:", {
          total: allRequests.length,
          pending: filtered.length,
          dealerId: user?.dealer_id,
        });
      } else {
        setAlert({
          type: "error",
          message: response.messages?.[0] || "Failed to load requests",
        });
        setRequests([]);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      setAlert({
        type: "error",
        message:
          error.response?.data?.messages?.[0] || "Failed to load requests",
      });
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = (request) => {
    setSelectedRequest(request);
    setAlert({ type: "", message: "" });
    setIsModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setIsApproving(true);
    setAlert({ type: "", message: "" });

    try {
      const evmStaffId = "5c136c4a-d99c-488b-8859-a90d0c702557";

      console.log("Approving request:", {
        requestId: selectedRequest.id,
        evmStaffId: evmStaffId,
      });

      const response = await vehicleRequestApi.approve(
        selectedRequest.id,
        evmStaffId
      );

      if (response.isSuccess) {
        setAlert({
          type: "success",
          message:
            response.messages?.[0] ||
            "Request approved successfully and sent to EVM Staff!",
        });

        setTimeout(() => {
          setIsModalOpen(false);
          setSelectedRequest(null);
          fetchRequests();
        }, 1500);
      } else {
        setAlert({
          type: "error",
          message: response.messages?.[0] || "Failed to approve request",
        });
      }
    } catch (error) {
      console.error("Error approving request:", error);
      setAlert({
        type: "error",
        message:
          error.response?.data?.messages?.[0] ||
          "Failed to approve request. Please try again.",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
    setAlert({ type: "", message: "" });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Verify Stock Requests
          </h1>
          <p className="text-slate-400">
            Review and verify vehicle stock requests from Dealer Staff before
            sending to EVM Staff.
          </p>
        </div>

        <Alert type={alert.type} message={alert.message} />

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" text="Loading requests..." />
          </div>
        ) : requests.length === 0 ? (
          <EmptyState
            title="No Pending Requests"
            description="There are no vehicle restock requests waiting for your approval."
            icon={
              <svg
                className="w-16 h-16 text-slate-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
        ) : (
          <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
            <Table>
              <Table.Header>
                <Table.HeaderCell>Vehicle</Table.HeaderCell>
                <Table.HeaderCell>Quantity</Table.HeaderCell>
                <Table.HeaderCell>Requested By</Table.HeaderCell>
                <Table.HeaderCell>Date</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell align="center">Action</Table.HeaderCell>
              </Table.Header>
              <Table.Body>
                {requests.map((req) => (
                  <Table.Row key={req.id}>
                    <Table.Cell>
                      <div>
                        <p className="font-semibold text-white">
                          {req.vehicleModelName || "Unknown Vehicle"}
                        </p>
                        <p className="text-sm text-slate-400">
                          ID: {req.vehicleId?.substring(0, 8)}...
                        </p>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="font-semibold text-white">
                        {req.quantity} units
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div>
                        <p className="text-white">
                          {req.createdByName || "Unknown"}
                        </p>
                        <p className="text-sm text-slate-400">
                          {formatDateTime(req.createdAt)}
                        </p>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-slate-300">
                        {formatDateTime(req.createdAt)}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant="warning">{req.status || "Pending"}</Badge>
                    </Table.Cell>
                    <Table.Cell align="center">
                      <Button
                        onClick={() => handleVerify(req)}
                        variant="primary"
                      >
                        Review
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}

        {!loading && requests.length > 0 && (
          <div className="text-sm text-slate-400">
            Showing {requests.length} pending request(s) for approval
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Review Restock Request"
        size="md"
      >
        <Alert type={alert.type} message={alert.message} />

        {selectedRequest && (
          <div className="space-y-4 mb-6">
            <div className="bg-slate-700 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm text-slate-400">Vehicle</p>
                <p className="text-white font-semibold">
                  {selectedRequest.vehicleModelName || "Unknown Vehicle"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Quantity Requested</p>
                <p className="text-white font-semibold">
                  {selectedRequest.quantity} units
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Requested By</p>
                <p className="text-white">
                  {selectedRequest.createdByName || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Request Date</p>
                <p className="text-white">
                  {formatDateTime(selectedRequest.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Reason/Note</p>
                <p className="text-white">
                  {selectedRequest.note || (
                    <span className="italic text-slate-400">
                      No note provided
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="bg-blue-500 bg-opacity-10 border border-blue-500 rounded-lg p-3">
              <p className="text-blue-400 text-sm">
                <strong>Note:</strong> Approving this request will forward it to
                EVM Staff for processing and fulfillment.
              </p>
            </div>
          </div>
        )}

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={closeModal}
            disabled={isApproving}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleApprove}
            isLoading={isApproving}
            disabled={isApproving}
          >
            {isApproving ? "Approving..." : "Approve Request"}
          </Button>
        </Modal.Footer>
      </Modal>
    </DashboardLayout>
  );
}

export default RequestVerificationPage;
