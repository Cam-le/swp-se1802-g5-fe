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
  const [showConfirmReceiptModal, setShowConfirmReceiptModal] = useState(false);
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

  const handleConfirmReceipt = (request) => {
    setSelectedRequest(request);
    setShowConfirmReceiptModal(true);
  };

  const confirmReceipt = async () => {
    if (!selectedRequest || !user?.dealer_id) {
      setAlert({
        type: "error",
        message: "Missing required information to confirm receipt",
      });
      return;
    }

    try {
      setProcessingId(selectedRequest.id);
      setAlert({ type: "", message: "" });

      const response = await vehicleRequestApi.confirmReceipt(
        selectedRequest.id,
        user.dealer_id
      );

      if (response.isSuccess) {
        setAlert({
          type: "success",
          message:
            "Receipt confirmed successfully! Vehicles have been added to your inventory.",
        });
        setShowConfirmReceiptModal(false);
        setSelectedRequest(null);
        fetchRequests();
      } else {
        setAlert({
          type: "error",
          message: response.messages?.[0] || "Failed to confirm receipt",
        });
      }
    } catch (error) {
      console.error("Error confirming receipt:", error);
      setAlert({
        type: "error",
        message:
          error.response?.data?.messages?.[0] || "Failed to confirm receipt",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      "Pending Manager Approval": "warning",
      "Pending EVM Allocation": "info",
      Shipped: "success",
      Completed: "success",
      Rejected: "danger",
    };
    return variants[status] || "default";
  };

  const pendingRequests = requests.filter(
    (r) => r.status === "Pending Manager Approval"
  );
  const shippedRequests = requests.filter((r) => r.status === "Shipped");
  const otherRequests = requests.filter(
    (r) => r.status !== "Pending Manager Approval" && r.status !== "Shipped"
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
                      {req.items && req.items.length > 0 ? (
                        <div>
                          <div className="text-slate-300 font-semibold mb-1">
                            Vehicles:
                          </div>
                          {req.items.map((item, idx) => (
                            <div key={idx} className="text-slate-300 ml-2">
                              •{" "}
                              <span className="text-white font-semibold">
                                {item.vehicleModelName}
                              </span>
                              {" × "}
                              <span className="text-blue-400">
                                {item.quantity}
                              </span>
                            </div>
                          ))}
                          <div className="text-slate-400 text-xs mt-1">
                            Total:{" "}
                            {req.items.reduce(
                              (sum, item) => sum + item.quantity,
                              0
                            )}{" "}
                            units
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-300">
                          Vehicle:{" "}
                          <span className="text-white font-semibold">
                            Unknown
                          </span>
                        </div>
                      )}
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

          {/* Shipped Requests - Awaiting Confirmation */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Shipped - Awaiting Confirmation ({shippedRequests.length})
            </h2>
            {shippedRequests.length === 0 ? (
              <Card>
                <p className="text-slate-400 text-center py-8">
                  No shipped requests awaiting confirmation
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shippedRequests.map((req) => (
                  <Card
                    key={req.id}
                    hover
                    className="border-green-500 border-opacity-30"
                  >
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
                      {req.items && req.items.length > 0 ? (
                        <div>
                          <div className="text-slate-300 font-semibold mb-1">
                            Vehicles:
                          </div>
                          {req.items.map((item, idx) => (
                            <div key={idx} className="text-slate-300 ml-2">
                              •{" "}
                              <span className="text-white font-semibold">
                                {item.vehicleModelName}
                              </span>
                              {" × "}
                              <span className="text-blue-400">
                                {item.quantity}
                              </span>
                            </div>
                          ))}
                          <div className="text-slate-400 text-xs mt-1">
                            Total:{" "}
                            {req.items.reduce(
                              (sum, item) => sum + item.quantity,
                              0
                            )}{" "}
                            units
                          </div>
                        </div>
                      ) : (
                        <div className="text-slate-300">
                          Vehicle: <span className="text-white">Unknown</span>
                        </div>
                      )}
                      {req.expectedDeliveryDate && (
                        <div className="text-green-400 bg-green-500 bg-opacity-10 p-2 rounded">
                          Expected Delivery:{" "}
                          <span className="font-semibold">
                            {formatDateTime(req.expectedDeliveryDate)}
                          </span>
                        </div>
                      )}
                      {req.note && (
                        <div className="text-slate-300">
                          Note:{" "}
                          <span className="text-white italic">
                            "{req.note}"
                          </span>
                        </div>
                      )}
                      <div className="text-slate-400 text-xs">
                        Approved: {formatDateTime(req.approvedAt)}
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button
                        variant="primary"
                        onClick={() => handleConfirmReceipt(req)}
                        disabled={processingId === req.id}
                        fullWidth
                      >
                        <svg
                          className="w-5 h-5 mr-2"
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
                        Confirm Receipt
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
                      {req.items && req.items.length > 0 ? (
                        <div>
                          <div className="text-slate-300 font-semibold mb-1">
                            Vehicles:
                          </div>
                          {req.items.slice(0, 2).map((item, idx) => (
                            <div
                              key={idx}
                              className="text-slate-300 ml-2 text-xs"
                            >
                              • {item.vehicleModelName} × {item.quantity}
                            </div>
                          ))}
                          {req.items.length > 2 && (
                            <div className="text-slate-400 text-xs ml-2">
                              +{req.items.length - 2} more...
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-slate-300">
                          Vehicle: <span className="text-white">Unknown</span>
                        </div>
                      )}
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
              {selectedRequest.items && selectedRequest.items.length > 0 ? (
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
              ) : (
                <div className="flex justify-between">
                  <span className="text-slate-400">Vehicle:</span>
                  <span className="text-white font-semibold">Unknown</span>
                </div>
              )}
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
              {selectedRequest.items && selectedRequest.items.length > 0 ? (
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
              ) : (
                <div className="flex justify-between">
                  <span className="text-slate-400">Vehicle:</span>
                  <span className="text-white font-semibold">Unknown</span>
                </div>
              )}
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

      {/* Confirm Receipt Modal */}
      <Modal
        isOpen={showConfirmReceiptModal}
        onClose={() => {
          setShowConfirmReceiptModal(false);
          setSelectedRequest(null);
        }}
        title="Confirm Receipt of Vehicles"
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
                  <span className="text-slate-400 text-sm">
                    Vehicles Received:
                  </span>
                  {selectedRequest.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between mt-1">
                      <span className="text-white text-sm">
                        {item.vehicleModelName}
                      </span>
                      <span className="text-green-400 font-semibold text-sm">
                        {item.quantity} units
                      </span>
                    </div>
                  ))}
                  <div className="text-slate-400 text-xs mt-2">
                    Total:{" "}
                    {selectedRequest.items.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    )}{" "}
                    units
                  </div>
                </div>
              )}
              {selectedRequest.expectedDeliveryDate && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Expected Delivery:</span>
                  <span className="text-white">
                    {formatDateTime(selectedRequest.expectedDeliveryDate)}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-3">
              <p className="text-green-400 text-sm">
                ✓ By confirming receipt, these vehicles will be added to your
                dealership's inventory.
              </p>
            </div>

            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowConfirmReceiptModal(false);
                  setSelectedRequest(null);
                }}
                disabled={processingId}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={confirmReceipt}
                isLoading={processingId === selectedRequest.id}
                disabled={processingId === selectedRequest.id}
              >
                Confirm Receipt
              </Button>
            </Modal.Footer>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}

export default RequestVerificationPage;
