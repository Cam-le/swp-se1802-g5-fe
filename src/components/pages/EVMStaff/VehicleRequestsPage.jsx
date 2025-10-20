import { useEffect, useState } from "react";
import { DashboardLayout } from "../../layout";
import {
  Card,
  Table,
  Button,
  Alert,
  Modal,
  LoadingSpinner,
  EmptyState,
  Badge,
} from "../../common";
import { vehicleRequestApi } from "../../../services/vehicleRequestApi";
import { inventoryApi } from "../../../services/inventoryApi";
import { formatDateTime } from "../../../utils/helpers";

function VehicleRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFulfilling, setIsFulfilling] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setAlert({ type: "", message: "" });
    try {
      const response = await vehicleRequestApi.getAll();

      if (response.isSuccess) {
        // Filter for approved requests (client-side filtering)
        const allRequests = response.data || [];
        const approvedRequests =
          vehicleRequestApi.filters.approvedForEVM(allRequests);
        setRequests(approvedRequests);
        console.log("Fetched approved requests for EVM:", {
          total: allRequests.length,
          approved: approvedRequests.length,
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

  const handleFulfill = (request) => {
    setSelectedRequest(request);
    setAlert({ type: "", message: "" });
    setIsModalOpen(true);
  };

  const handleConfirmFulfill = async () => {
    if (!selectedRequest) return;

    setIsFulfilling(true);
    setAlert({ type: "", message: "" });

    try {
      console.log("Fulfilling request by adding inventory:", {
        requestId: selectedRequest.id,
        vehicleId: selectedRequest.vehicleId,
        quantity: selectedRequest.quantity,
        dealerId: selectedRequest.dealerId,
      });

      // Add inventory to fulfill the request
      const response = await inventoryApi.addInventory(
        selectedRequest.vehicleId,
        selectedRequest.quantity
      );

      if (response.isSuccess) {
        const inventoryItems = response.data || [];
        const vinNumbers = inventoryItems
          .map((item) => item.vinNumber)
          .join(", ");

        setAlert({
          type: "success",
          message: `Request fulfilled successfully! ${inventoryItems.length} vehicle(s) added to dealer inventory with VIN(s): ${vinNumbers}`,
        });

        // Close modal and refresh list after delay
        setTimeout(() => {
          setIsModalOpen(false);
          setSelectedRequest(null);
          fetchRequests();
        }, 3000);
      } else {
        setAlert({
          type: "error",
          message: response.messages?.[0] || "Failed to fulfill request",
        });
      }
    } catch (error) {
      console.error("Error fulfilling request:", error);
      setAlert({
        type: "error",
        message:
          error.response?.data?.messages?.[0] ||
          "Failed to fulfill request. Please try again.",
      });
    } finally {
      setIsFulfilling(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
    setAlert({ type: "", message: "" });
  };

  // Get status badge variant
  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "warning";
      case "approved":
        return "info";
      case "fulfilled":
        return "success";
      case "rejected":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Vehicle Requests</h1>
          <p className="text-slate-400">
            Manage and fulfill approved dealer vehicle allocation requests
          </p>
        </div>

        {/* Stats Cards */}
        {!loading && requests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <p className="text-sm text-slate-400">Total Units</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {requests.reduce(
                      (sum, req) => sum + (req.quantity || 0),
                      0
                    )}
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Unique Dealers</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {new Set(requests.map((req) => req.dealerId)).size}
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
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
            title="No Approved Requests"
            description="There are no approved vehicle requests waiting for fulfillment."
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
                <Table.HeaderCell>Request ID</Table.HeaderCell>
                <Table.HeaderCell>Vehicle</Table.HeaderCell>
                <Table.HeaderCell>Quantity</Table.HeaderCell>
                <Table.HeaderCell>Dealer</Table.HeaderCell>
                <Table.HeaderCell>Requested By</Table.HeaderCell>
                <Table.HeaderCell>Approved By</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell align="center">Action</Table.HeaderCell>
              </Table.Header>
              <Table.Body>
                {requests.map((req) => (
                  <Table.Row key={req.id}>
                    <Table.Cell>
                      <span className="text-slate-400 font-mono text-xs">
                        {req.id?.substring(0, 8)}...
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <p className="font-semibold text-white">
                        {req.vehicleModelName || "Unknown Vehicle"}
                      </p>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="font-semibold text-white">
                        {req.quantity} units
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div>
                        <p className="text-white">
                          {req.dealerName || "Unknown Dealer"}
                        </p>
                        <p className="text-xs text-slate-400 font-mono">
                          {req.dealerId?.substring(0, 8)}...
                        </p>
                      </div>
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
                      <div>
                        <p className="text-white">
                          {req.approvedByName || "Unknown"}
                        </p>
                        <p className="text-sm text-slate-400">
                          {req.approvedAt
                            ? formatDateTime(req.approvedAt)
                            : "-"}
                        </p>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge variant={getStatusVariant(req.status)}>
                        {req.status || "Pending"}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell align="center">
                      <Button
                        onClick={() => handleFulfill(req)}
                        variant="primary"
                      >
                        Fulfill
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}
      </div>

      {/* Fulfillment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Fulfill Vehicle Request"
        size="md"
      >
        <Alert type={alert.type} message={alert.message} />

        {selectedRequest && (
          <div className="space-y-4 mb-6">
            <div className="bg-slate-700 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm text-slate-400">Request ID</p>
                <p className="text-white font-mono text-sm">
                  {selectedRequest.id}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Vehicle</p>
                <p className="text-white font-semibold">
                  {selectedRequest.vehicleModelName || "Unknown Vehicle"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Quantity to Fulfill</p>
                <p className="text-white font-semibold text-lg">
                  {selectedRequest.quantity} units
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Dealer</p>
                <p className="text-white">
                  {selectedRequest.dealerName || "Unknown Dealer"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Requested By</p>
                <p className="text-white">
                  {selectedRequest.createdByName || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">Note</p>
                <p className="text-white">
                  {selectedRequest.note || (
                    <span className="italic text-slate-400">
                      No note provided
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-3">
              <p className="text-green-400 text-sm">
                <strong>Action:</strong> Fulfilling this request will add{" "}
                {selectedRequest.quantity} vehicle(s) to the dealer's inventory
                with auto-generated VIN numbers.
              </p>
            </div>
          </div>
        )}

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={closeModal}
            disabled={isFulfilling}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmFulfill}
            isLoading={isFulfilling}
            disabled={isFulfilling}
          >
            {isFulfilling ? "Fulfilling..." : "Confirm Fulfillment"}
          </Button>
        </Modal.Footer>
      </Modal>
    </DashboardLayout>
  );
}

export default VehicleRequestsPage;
