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
import InputField from "../../common/InputField";
import { useAuth } from "../../../hooks/useAuth";
import { vehicleRequestApi } from "../../../services/vehicleRequestApi";
import { formatDateTime } from "../../../utils/helpers";

function VehicleRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [processingId, setProcessingId] = useState(null);

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");

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

  const handleApprove = (request) => {
    setSelectedRequest(request);
    // Set default date to 7 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    setExpectedDeliveryDate(defaultDate.toISOString().split("T")[0]);
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

    if (!expectedDeliveryDate) {
      setAlert({
        type: "error",
        message: "Please select an expected delivery date",
      });
      return;
    }

    try {
      setProcessingId(selectedRequest.id);
      setAlert({ type: "", message: "" });

      // Convert to ISO 8601 format with time
      const dateTime = new Date(expectedDeliveryDate).toISOString();

      const response = await vehicleRequestApi.approveByEVM(
        selectedRequest.id,
        user.id,
        dateTime
      );

      if (response.isSuccess) {
        setAlert({
          type: "success",
          message:
            "Request approved successfully! Vehicles will be shipped to the dealer.",
        });
        setShowApproveModal(false);
        setSelectedRequest(null);
        setExpectedDeliveryDate("");
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
      setProcessingId(null);
    }
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!selectedRequest || !user?.id) {
      setAlert({
        type: "error",
        message: "Missing required information to reject request",
      });
      return;
    }

    if (!rejectReason.trim()) {
      setAlert({
        type: "error",
        message: "Please provide a reason for rejection",
      });
      return;
    }

    try {
      setProcessingId(selectedRequest.id);
      setAlert({ type: "", message: "" });

      const response = await vehicleRequestApi.rejectByEVM(
        selectedRequest.id,
        user.id,
        rejectReason.trim()
      );

      if (response.isSuccess) {
        setAlert({
          type: "success",
          message: "Request rejected successfully!",
        });
        setShowRejectModal(false);
        setSelectedRequest(null);
        setRejectReason("");
        fetchRequests();
      } else {
        setAlert({
          type: "error",
          message: response.messages?.[0] || "Failed to reject request",
        });
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      setAlert({
        type: "error",
        message:
          error.response?.data?.messages?.[0] || "Failed to reject request",
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status) {
      case "Pending Manager Approval":
        return "warning";
      case "Pending EVM Allocation":
        return "info";
      case "Shipped":
        return "success";
      case "Rejected":
        return "danger";
      default:
        return "default";
    }
  };

  // Get status counts for stats
  const getStatusCounts = () => {
    const counts = {
      pendingManagerApproval: 0,
      pendingEVMAllocation: 0,
      shipped: 0,
      rejected: 0,
    };

    requests.forEach((req) => {
      const status = req.status;
      if (status === "Pending Manager Approval") {
        counts.pendingManagerApproval++;
      } else if (status === "Pending EVM Allocation") {
        counts.pendingEVMAllocation++;
      } else if (status === "Shipped") {
        counts.shipped++;
      } else if (status === "Rejected") {
        counts.rejected++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

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
                  <p className="text-sm text-slate-400">
                    Awaiting Your Approval
                  </p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {statusCounts.pendingEVMAllocation}
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
                  <p className="text-sm text-slate-400">Shipped</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {statusCounts.shipped}
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
                      (sum, req) =>
                        sum +
                        (req.items?.reduce(
                          (itemSum, item) => itemSum + (item.quantity || 0),
                          0
                        ) || 0),
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
                  <Table.HeaderCell>Vehicles & Quantity</Table.HeaderCell>
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
                          {req.expectedDeliveryDate && (
                            <p className="text-xs text-blue-400">
                              Expected:{" "}
                              {formatDateTime(req.expectedDeliveryDate)}
                            </p>
                          )}
                          {req.cancellationReason && (
                            <p className="text-xs text-red-300 bg-red-500 bg-opacity-10 p-1 rounded">
                              Reason: "{req.cancellationReason}"
                            </p>
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="space-y-1">
                          {req.items && req.items.length > 0 ? (
                            <>
                              {req.items.map((item, idx) => (
                                <div key={idx} className="text-sm">
                                  <span className="font-semibold text-white">
                                    {item.vehicleModelName || "Unknown"}
                                  </span>
                                  <span className="text-blue-400 ml-2">
                                    × {item.quantity}
                                  </span>
                                </div>
                              ))}
                              <div className="text-xs text-slate-400 mt-1">
                                Total:{" "}
                                {req.items.reduce(
                                  (sum, item) => sum + item.quantity,
                                  0
                                )}{" "}
                                units
                              </div>
                            </>
                          ) : (
                            <p className="text-sm text-slate-400">No items</p>
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="space-y-1">
                          <p className="text-white font-medium">
                            {req.dealerName || "Unknown Dealer"}
                          </p>
                          <p className="text-xs text-slate-400">
                            Requested by: {req.createdByName || "Unknown"}
                          </p>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant={getStatusVariant(req.status)}>
                          {req.status || "Unknown"}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        {req.status === "Pending EVM Allocation" && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleApprove(req)}
                              disabled={processingId === req.id}
                              variant="primary"
                              className="text-sm px-3 py-2"
                            >
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleReject(req)}
                              disabled={processingId === req.id}
                              variant="danger"
                              className="text-sm px-3 py-2"
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        {req.status === "Shipped" && (
                          <span className="text-green-400 text-sm">
                            ✓ Shipped
                          </span>
                        )}
                        {req.status === "Rejected" && (
                          <span className="text-red-400 text-sm">
                            ✗ Rejected
                          </span>
                        )}
                        {req.status === "Pending Manager Approval" && (
                          <span className="text-yellow-400 text-sm">
                            ⏳ Awaiting Manager
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
            setExpectedDeliveryDate("");
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
                {selectedRequest.items && selectedRequest.items.length > 0 && (
                  <div className="border-t border-slate-600 pt-2">
                    <span className="text-slate-400 text-sm">Vehicles:</span>
                    {selectedRequest.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between mt-1">
                        <span className="text-white text-sm">
                          {item.vehicleModelName}
                        </span>
                        <span className="text-blue-400 font-semibold text-sm">
                          {item.quantity} units
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Dealer:</span>
                  <span className="text-white">
                    {selectedRequest.dealerName || "Unknown"}
                  </span>
                </div>
                {selectedRequest.note && (
                  <div className="pt-2 border-t border-slate-600">
                    <span className="text-slate-400 text-sm">Note:</span>
                    <p className="text-white mt-1 italic">
                      "{selectedRequest.note}"
                    </p>
                  </div>
                )}
              </div>

              {/* Expected Delivery Date */}
              <InputField
                id="expectedDeliveryDate"
                name="expectedDeliveryDate"
                type="date"
                label="Expected Delivery Date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                error={!expectedDeliveryDate ? "Required" : ""}
                icon={
                  <svg
                    className="w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                }
              />

              <div className="bg-blue-500 bg-opacity-10 border border-blue-500 rounded-lg p-3">
                <p className="text-blue-400 text-sm">
                  ⓘ By approving this request, the vehicles will be allocated
                  and shipped to the dealer by the expected delivery date.
                </p>
              </div>

              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowApproveModal(false);
                    setSelectedRequest(null);
                    setExpectedDeliveryDate("");
                  }}
                  disabled={processingId}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={confirmApprove}
                  isLoading={processingId === selectedRequest.id}
                  disabled={
                    processingId === selectedRequest.id || !expectedDeliveryDate
                  }
                >
                  Confirm Approval
                </Button>
              </Modal.Footer>
            </div>
          )}
        </Modal>

        {/* Reject Modal with Reason */}
        <Modal
          isOpen={showRejectModal}
          onClose={() => {
            setShowRejectModal(false);
            setSelectedRequest(null);
            setRejectReason("");
          }}
          title="Reject Vehicle Request"
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
                {selectedRequest.items && selectedRequest.items.length > 0 && (
                  <div className="border-t border-slate-600 pt-2">
                    <span className="text-slate-400 text-sm">Vehicles:</span>
                    {selectedRequest.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between mt-1">
                        <span className="text-white text-sm">
                          {item.vehicleModelName}
                        </span>
                        <span className="text-blue-400 font-semibold text-sm">
                          {item.quantity} units
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Dealer:</span>
                  <span className="text-white">
                    {selectedRequest.dealerName || "Unknown"}
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="rejectReason"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Rejection Reason <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="rejectReason"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows={4}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please explain why this request is being rejected..."
                  disabled={processingId}
                />
              </div>

              <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-3">
                <p className="text-red-400 text-sm">
                  ⚠️ This action will reject the request. The dealer will be
                  notified with your reason.
                </p>
              </div>

              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedRequest(null);
                    setRejectReason("");
                  }}
                  disabled={processingId}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={confirmReject}
                  isLoading={processingId === selectedRequest.id}
                  disabled={
                    processingId === selectedRequest.id || !rejectReason.trim()
                  }
                >
                  Confirm Rejection
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
