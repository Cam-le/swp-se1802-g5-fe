import { useEffect, useState } from "react";
import { DashboardLayout } from "../../layout";
import {
  Table,
  LoadingSpinner,
  EmptyState,
  Badge,
  Card,
  Alert,
  Button,
  Modal,
} from "../../common";
import { useAuth } from "../../../hooks/useAuth";
import { vehicleRequestApi } from "../../../services/vehicleRequestApi";
import { formatDateTime } from "../../../utils/helpers";

function VehicleRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [approvingId, setApprovingId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setAlert({ type: "", message: "" });
    try {
      const response = await vehicleRequestApi.getAll();

      if (response.isSuccess) {
        const allRequests = response.data || [];
        setRequests(allRequests);
        console.log("Fetched all vehicle requests:", {
          total: allRequests.length,
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

  const handleApprove = async (request) => {
    setSelectedRequest(request);
    setShowApproveModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedRequest || !user?.id) {
      setAlert({
        type: "error",
        message: "Missing required information to approve request",
      });
      return;
    }

    try {
      setApprovingId(selectedRequest.id);
      setAlert({ type: "", message: "" });

      const response = await vehicleRequestApi.approve(
        selectedRequest.id,
        user.id // Current EVM Staff user ID
      );

      if (response.isSuccess) {
        setAlert({
          type: "success",
          message: "Request approved successfully!",
        });
        setShowApproveModal(false);
        setSelectedRequest(null);
        // Refresh the list
        fetchRequests();
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
          error.response?.data?.messages?.[0] || "Failed to approve request",
      });
    } finally {
      setApprovingId(null);
    }
  };

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "warning";
      case "processing":
        return "info";
      case "completed":
        return "success";
      case "rejected":
        return "danger";
      default:
        return "default";
    }
  };

  // Get status counts for stats
  const getStatusCounts = () => {
    const counts = {
      pending: 0,
      processing: 0,
      completed: 0,
      rejected: 0,
    };

    requests.forEach((req) => {
      const status = req.status?.toLowerCase();
      if (counts.hasOwnProperty(status)) {
        counts[status]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();
  const processingRequests = requests.filter(
    (req) => req.status === "Processing"
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Vehicle Requests</h1>
          <p className="text-slate-400">
            Review and approve dealer vehicle allocation requests
          </p>
        </div>

        {/* Stats Cards */}
        {!loading && requests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Requests</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {requests.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Awaiting Approval</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {statusCounts.processing}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-yellow-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Completed</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {statusCounts.completed}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-500"
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
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Units</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {requests.reduce(
                      (sum, req) => sum + (req.quantity || 0),
                      0
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Alert */}
        <Alert type={alert.type} message={alert.message} />

        {/* Requests Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" text="Loading requests..." />
          </div>
        ) : requests.length === 0 ? (
          <EmptyState
            title="No Requests Found"
            description="There are no vehicle requests in the system yet."
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
          <div className="bg-slate-800 rounded-lg border border-slate-700">
            <div className="overflow-x-auto">
              <Table>
                <Table.Header>
                  <Table.HeaderCell>Request Details</Table.HeaderCell>
                  <Table.HeaderCell>Vehicle & Quantity</Table.HeaderCell>
                  <Table.HeaderCell>Dealer Info</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Header>
                <Table.Body>
                  {requests.map((req) => (
                    <Table.Row key={req.id}>
                      <Table.Cell>
                        <div className="space-y-1">
                          <p className="text-slate-400 font-mono text-xs">
                            {req.id?.substring(0, 8)}...
                          </p>
                          <p className="text-xs text-slate-400">
                            {formatDateTime(req.createdAt)}
                          </p>
                          {req.note && (
                            <p className="text-xs text-slate-300 italic">
                              "{req.note}"
                            </p>
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="space-y-1">
                          <p className="font-semibold text-white">
                            {req.vehicleModelName || "Unknown Vehicle"}
                          </p>
                          <p className="text-sm text-blue-400 font-semibold">
                            {req.quantity} units
                          </p>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="space-y-1">
                          <p className="text-white font-medium">
                            {req.dealerName || "Unknown Dealer"}
                          </p>
                          <p className="text-xs text-slate-400">
                            By: {req.createdByName || "Unknown"}
                          </p>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant={getStatusVariant(req.status)}>
                          {req.status || "Unknown"}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        {req.status === "Processing" && (
                          <Button
                            onClick={() => handleApprove(req)}
                            disabled={approvingId === req.id}
                            variant="primary"
                          >
                            Approve
                          </Button>
                        )}
                        {req.status === "Completed" && (
                          <span className="text-green-400 text-sm">
                            ✓ Completed
                          </span>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          </div>
        )}

        {/* Approve Confirmation Modal */}
        <Modal
          isOpen={showApproveModal}
          onClose={() => {
            setShowApproveModal(false);
            setSelectedRequest(null);
          }}
          title="Approve Vehicle Request"
          size="md"
        >
          {selectedRequest && (
            <div className="space-y-4">
              <div className="bg-slate-700 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Request ID:</span>
                  <span className="text-white font-mono text-sm">
                    {selectedRequest.id?.substring(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vehicle:</span>
                  <span className="text-white font-semibold">
                    {selectedRequest.vehicleModelName || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Quantity:</span>
                  <span className="text-white font-semibold">
                    {selectedRequest.quantity} units
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dealer:</span>
                  <span className="text-white">
                    {selectedRequest.dealerName || "Unknown"}
                  </span>
                </div>
                {selectedRequest.note && (
                  <div className="pt-2 border-t border-slate-600">
                    <span className="text-slate-400 text-sm">Note:</span>
                    <p className="text-white mt-1">{selectedRequest.note}</p>
                  </div>
                )}
              </div>

              <div className="bg-blue-500 bg-opacity-10 border border-blue-500 rounded-lg p-3">
                <p className="text-blue-400 text-sm">
                  ⓘ By approving this request, you confirm that the vehicles
                  will be allocated to the dealer's inventory.
                </p>
              </div>

              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowApproveModal(false);
                    setSelectedRequest(null);
                  }}
                  disabled={approvingId}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={confirmApprove}
                  isLoading={approvingId === selectedRequest.id}
                  disabled={approvingId === selectedRequest.id}
                >
                  Confirm Approval
                </Button>
              </Modal.Footer>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}

export default VehicleRequestsPage;
