import { useState, useEffect } from "react";
import { DashboardLayout } from "../../layout";
import { Card, Modal, Alert, LoadingSpinner, Button } from "../../common";
import InputField from "../../common/InputField";
import { useAuth } from "../../../hooks/useAuth";

import { vehicleApi } from "../../../services/vehicleApi";
import { vehicleRequestApi } from "../../../services/vehicleRequestApi";

function RequestVehiclesPage() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  // Only allow Dealer Staff and Dealer Manager
  const canRequest =
    user?.role === "Dealer Staff" || user?.role === "Dealer Manager";

  // Fetch vehicles on mount
  useEffect(() => {
    async function fetchVehicles() {
      setLoading(true);
      try {
        const response = await vehicleApi.getAll(user?.id);
        if (response.isSuccess) {
          setVehicles(response.data);
        } else {
          setAlert({
            type: "error",
            message: response.messages?.[0] || "Failed to load vehicles",
          });
          setVehicles([]);
        }
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        setAlert({
          type: "error",
          message:
            error.response?.data?.messages?.[0] || "Failed to load vehicles",
        });
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    }
    if (user?.id) {
      fetchVehicles();
    }
  }, [user]);

  // Submit request to real API
  const handleSubmitRequest = async (e) => {
    e.preventDefault();

    // Validation
    if (!selectedVehicle) {
      setAlert({ type: "error", message: "Please select a vehicle" });
      return;
    }
    if (!quantity || quantity < 1) {
      setAlert({ type: "error", message: "Quantity must be at least 1" });
      return;
    }
    if (!note.trim()) {
      setAlert({
        type: "error",
        message: "Please provide a reason for the restock request",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setAlert({ type: "", message: "" });

      // Find selected vehicle to get its details
      const vehicleObj = vehicles.find((v) => v.id === selectedVehicle);

      // Create request payload
      const requestData = {
        createdBy: user?.id,
        vehicleId: selectedVehicle,
        dealerId: user?.dealer_id || vehicleObj?.dealerId,
        quantity: parseInt(quantity),
        note: note.trim(),
      };

      console.log("Submitting vehicle request:", requestData);

      // Call real API
      const response = await vehicleRequestApi.create(requestData);

      if (response.isSuccess) {
        setAlert({
          type: "success",
          message:
            response.messages?.[0] ||
            "Request submitted successfully! Waiting for manager approval.",
        });

        // Reset form and close modal after delay
        setTimeout(() => {
          setIsModalOpen(false);
          setSelectedVehicle("");
          setQuantity(1);
          setNote("");
          setAlert({ type: "", message: "" });
        }, 2000);
      } else {
        setAlert({
          type: "error",
          message: response.messages?.[0] || "Failed to submit request",
        });
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      setAlert({
        type: "error",
        message:
          error.response?.data?.messages?.[0] ||
          error.message ||
          "Failed to submit request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = () => {
    setSelectedVehicle("");
    setQuantity(1);
    setNote("");
    setAlert({ type: "", message: "" });
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Request Vehicles</h1>
        <p className="text-slate-400">
          Dealer Staff and Dealer Manager can request additional stock for
          available cars.
        </p>
      </div>

      {canRequest && (
        <div className="mb-6">
          <Button onClick={openModal}>
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Request More Stock
          </Button>
        </div>
      )}

      {/* Vehicles List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" text="Loading vehicles..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-400">No vehicles found.</p>
            </div>
          ) : (
            vehicles.map((v) => (
              <Card key={v.id} hover>
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={v.imageUrl}
                    alt={v.modelName}
                    className="w-16 h-16 rounded-lg object-cover bg-slate-700"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/150?text=No+Image";
                    }}
                  />
                  <div>
                    <div className="text-white font-bold text-lg">
                      {v.modelName}
                    </div>
                    <div className="text-slate-300 text-sm">{v.version}</div>
                  </div>
                </div>
                <div className="text-slate-300 text-sm mb-2">
                  Category: <span className="text-white">{v.category}</span>
                </div>
                <div className="text-slate-300 text-sm mb-2">
                  Color: <span className="text-white">{v.color}</span>
                </div>
                <div className="text-slate-300 text-sm mb-2">
                  Battery:{" "}
                  <span className="text-white">{v.batteryCapacity} kWh</span>
                </div>
                <div className="text-slate-300 text-sm mb-2">
                  Range:{" "}
                  <span className="text-white">{v.rangePerCharge} km</span>
                </div>
                <div className="text-slate-300 text-sm mb-2">
                  Base Price:{" "}
                  <span className="text-white">
                    {v.basePrice?.toLocaleString()} đ
                  </span>
                </div>
                <div className="text-slate-400 text-sm mt-2">
                  Status:{" "}
                  <span className="text-white capitalize">{v.status}</span>
                </div>
                <div className="text-slate-400 text-sm mt-2">
                  In Stock:{" "}
                  <span
                    className={`font-semibold ${
                      v.currentStock === 0
                        ? "text-red-400"
                        : v.currentStock <= 5
                        ? "text-yellow-400"
                        : "text-green-400"
                    }`}
                  >
                    {v.currentStock ?? 0} units
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Modal for Stock Request */}
      {canRequest && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Request More Stock"
        >
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <Alert type={alert.type} message={alert.message} />

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Select Vehicle <span className="text-red-400">*</span>
              </label>
              <select
                className="w-full bg-slate-700 border border-slate-600 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                required
                disabled={isSubmitting}
              >
                <option value="" disabled>
                  Select a vehicle
                </option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.modelName} {v.version} - Current Stock:{" "}
                    {v.currentStock ?? 0}
                  </option>
                ))}
              </select>
            </div>

            <InputField
              id="quantity"
              name="quantity"
              type="number"
              label="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min={1}
              required
              disabled={isSubmitting}
            />

            <div>
              <label
                htmlFor="note"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Note (Reason for restock){" "}
                <span className="text-red-400">*</span>
              </label>
              <textarea
                id="note"
                name="note"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter reason for restock request..."
                required
                disabled={isSubmitting}
              />
            </div>

            <Modal.Footer>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Send Request"}
              </Button>
            </Modal.Footer>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}

export default RequestVehiclesPage;
