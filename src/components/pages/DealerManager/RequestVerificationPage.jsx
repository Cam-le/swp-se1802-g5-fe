import { useState, useEffect } from "react";
import { DashboardLayout } from "../../layout";
import { Card, Badge, LoadingSpinner, Alert, Button } from "../../common";
import { useAuth } from "../../../hooks/useAuth";
import { vehicleRequestApi } from "../../../services/vehicleRequestApi";
import { formatDateTime } from "../../../utils/helpers";

function RequestVerificationPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [deletingId, setDeletingId] = useState(null);

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

  const handleDelete = async (requestId) => {
    if (
      !window.confirm(
        "Are you sure you want to deny this request? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeletingId(requestId);
      setAlert({ type: "", message: "" });

      const response = await vehicleRequestApi.delete(requestId);

      if (response.isSuccess) {
        setAlert({
          type: "success",
          message: "Request denied successfully!",
        });
        // Refresh the list
        fetchRequests();
      } else {
        setAlert({
          type: "error",
          message: response.messages?.[0] || "Failed to deny request",
        });
      }
    } catch (error) {
      console.error("Error denying request:", error);
      setAlert({
        type: "error",
        message:
          error.response?.data?.messages?.[0] || "Failed to deny request",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      Pending: "warning",
      Processing: "info",
      Completed: "success",
      Rejected: "danger",
    };
    return variants[status] || "default";
  };

  const pendingRequests = requests.filter((r) => r.status === "Processing");
  const otherRequests = requests.filter((r) => r.status !== "Processing");

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
              Pending Requests ({pendingRequests.length})
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
                        Vehicle ID:{" "}
                        <span className="text-white font-mono text-xs">
                          {req.vehicleId?.substring(0, 8)}...
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
                          Note: <span className="text-white">{req.note}</span>
                        </div>
                      )}
                      <div className="text-slate-400 text-xs">
                        Created: {formatDateTime(req.createdAt)}
                      </div>
                    </div>

                    <div className="mt-4">
                      <Button
                        variant="warning"
                        onClick={() => handleDelete(req.id)}
                        disabled={deletingId === req.id}
                        isLoading={deletingId === req.id}
                        fullWidth
                      >
                        {deletingId === req.id ? "Denying..." : "Deny Request"}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Other Requests History */}
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
                          Note: <span className="text-white">{req.note}</span>
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
    </DashboardLayout>
  );
}

export default RequestVerificationPage;
