import { useState, useEffect } from "react";
import { DashboardLayout } from "../../layout";
import {
  Card,
  Badge,
  LoadingSpinner,
  Alert,
  Button,
  Modal,
} from "../../common";
import InputField from "../../common/InputField";
import { useAuth } from "../../../hooks/useAuth";
import { vehicleRequestApi } from "../../../services/vehicleRequestApi";
import { formatDateTime } from "../../../utils/helpers";

function RequestVerificationPage() {
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

  useEffect(() => {
    if (user?.dealer_id) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await vehicleRequestApi.getAll();
      if (response.isSuccess) {
        // Filter requests for this dealer
        const dealerRequests = vehicleRequestApi.filters.byDealer(
          response.data,
          user.dealer_id
        );
        setRequests(dealerRequests);
      } else {
        setAlert({
          type: "error",
          message: response.messages?.[0] || "Failed to load requests",
        });
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      setAlert({
        type: "error",
        message:
          error.response?.data?.messages?.[0] || "Failed to load requests",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (request) => {
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
      setProcessingId(selectedRequest.id);
      setAlert({ type: "", message: "" });

      const response = await vehicleRequestApi.approveByManager(
        selectedRequest.id,
        user.id
      );

      if (response.isSuccess) {
        setAlert({
          type: "success",
          message:
            "Request approved successfully! Forwarded to EVM Staff for processing.",
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

      const response = await vehicleRequestApi.rejectByManager(
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
        // Refresh the list
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

  const getStatusBadge = (status) => {
    const variants = {
      "Pending Manager Approval": "warning",
      Processing: "info",
      completed: "success",
      Rejected: "danger",
    };
    return variants[status] || "default";
  };

  const pendingRequests = requests.filter(
    (r) => r.status === "Pending Manager Approval"
  );
  const otherRequests = requests.filter(
    (r) => r.status !== "Pending Manager Approval"
  );

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">
          Manage Vehicle Requests
        </h1>
        <p className="text-slate-400">
          Review and manage restock requests from your staff
        </p>
      </div>

      <Alert type={alert.type} message={alert.message} />

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" text="Loading requests..." />
        </div>
      ) : (
        <>
          {/* Pending Requests */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Pending Approval ({pendingRequests.length})
            </h2>
            {pendingRequests.length === 0 ? (
              <Card>
                <p className="text-slate-400 text-center py-8">
                  No pending requests
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingRequests.map((req) => (
                  <Card key={req.id} hover>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-slate-400 text-sm">Request ID</div>
                        <div className="text-white font-medium text-sm">
                          {req.id.substring(0, 8)}...
                        </div>
                      </div>
                      <Badge variant={getStatusBadge(req.status)}>
                        {req.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="text-slate-300">
                        Vehicle:{" "}
                        <span className="text-white font-semibold">
                          {req.vehicleModelName || "Unknown"}
                        </span>
                      </div>
                      <div className="text-slate-300">
                        Quantity:{" "}
                        <span className="text-white font-semibold">
                          {req.quantity}
                        </span>
                      </div>
                      <div className="text-slate-300">
                        Created by:{" "}
                        <span className="text-white">
                          {req.createdByName || "Unknown"}
                        </span>
                      </div>
                      {req.note && (
                        <div className="text-slate-300">
                          Note:{" "}
                          <span className="text-white italic">
                            "{req.note}"
                          </span>
                        </div>
                      )}
                      <div className="text-slate-400 text-xs">
                        Created: {formatDateTime(req.createdAt)}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="primary"
                        onClick={() => handleApprove(req)}
                        disabled={processingId === req.id}
                        className="flex-1"
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => handleReject(req)}
                        disabled={processingId === req.id}
                        className="flex-1"
                      >
                        Reject
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Request History */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Request History ({otherRequests.length})
            </h2>
            {otherRequests.length === 0 ? (
              <Card>
                <p className="text-slate-400 text-center py-8">
                  No request history
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherRequests.map((req) => (
                  <Card key={req.id} hover>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-slate-400 text-sm">Request ID</div>
                        <div className="text-white font-medium text-sm">
                          {req.id.substring(0, 8)}...
                        </div>
                      </div>
                      <Badge variant={getStatusBadge(req.status)}>
                        {req.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="text-slate-300">
                        Vehicle:{" "}
                        <span className="text-white">
                          {req.vehicleModelName || "Unknown"}
                        </span>
                      </div>
                      <div className="text-slate-300">
                        Quantity:{" "}
                        <span className="text-white">{req.quantity}</span>
                      </div>
                      {req.note && (
                        <div className="text-slate-300">
                          Note:{" "}
                          <span className="text-white italic">
                            "{req.note}"
                          </span>
                        </div>
                      )}
                      {req.cancellationReason && (
                        <div className="text-red-300 bg-red-500 bg-opacity-10 p-2 rounded">
                          Reason:{" "}
                          <span className="text-red-200">
                            "{req.cancellationReason}"
                          </span>
                        </div>
                      )}
                      <div className="text-slate-400 text-xs">
                        {formatDateTime(req.createdAt)}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
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
                <span className="text-slate-400">Created by:</span>
                <span className="text-white">
                  {selectedRequest.createdByName || "Unknown"}
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

            <div className="bg-blue-500 bg-opacity-10 border border-blue-500 rounded-lg p-3">
              <p className="text-blue-400 text-sm">
                ⓘ By approving this request, it will be forwarded to EVM Staff
                for final processing and inventory allocation.
              </p>
            </div>

            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedRequest(null);
                }}
                disabled={processingId}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={confirmApprove}
                isLoading={processingId === selectedRequest.id}
                disabled={processingId === selectedRequest.id}
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
                ⚠️ This action will reject the request. The staff member will be
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
    </DashboardLayout>
  );
}

export default RequestVerificationPage;
