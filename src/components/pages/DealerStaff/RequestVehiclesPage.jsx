import { useState, useEffect } from "react";
import { DashboardLayout } from "../../layout";
import { Card, Modal, Alert, LoadingSpinner, Button } from "../../common";
import { useAuth } from "../../../hooks/useAuth";
import { vehicleApi } from "../../../services/vehicleApi";
import { vehicleRequestApi } from "../../../services/vehicleRequestApi";

function RequestVehiclesPage() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [note, setNote] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const canRequest = user?.role === "Dealer Staff";

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

  const addToRequest = (vehicleId) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    if (!vehicle) return;

    const existingItem = selectedItems.find(
      (item) => item.vehicleId === vehicleId
    );
    if (existingItem) {
      setAlert({
        type: "error",
        message: "This vehicle is already in your request",
      });
      return;
    }

    setSelectedItems([
      ...selectedItems,
      {
        vehicleId: vehicleId,
        quantity: 1,
        modelName: vehicle.modelName,
        version: vehicle.version,
        currentStock: vehicle.currentStock,
        imageUrl: vehicle.imageUrl,
      },
    ]);
  };

  const removeFromRequest = (vehicleId) => {
    setSelectedItems(
      selectedItems.filter((item) => item.vehicleId !== vehicleId)
    );
  };

  const updateQuantity = (vehicleId, quantity) => {
    const value = parseInt(quantity);
    if (isNaN(value) || value < 1) return;

    setSelectedItems(
      selectedItems.map((item) =>
        item.vehicleId === vehicleId ? { ...item, quantity: value } : item
      )
    );
  };

  const openModal = () => {
    if (selectedItems.length === 0) {
      setAlert({
        type: "error",
        message: "Please add at least one vehicle to your request list first",
      });
      return;
    }
    setAlert({ type: "", message: "" });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setNote("");
    setAlert({ type: "", message: "" });
  };

  const clearList = () => {
    setSelectedItems([]);
    setAlert({ type: "success", message: "Request list cleared" });
    setTimeout(() => setAlert({ type: "", message: "" }), 2000);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();

    if (selectedItems.length === 0) {
      setAlert({
        type: "error",
        message: "Please add at least one vehicle to the request",
      });
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

      const requestData = {
        createdBy: user?.id,
        dealerId: user?.dealer_id,
        note: note.trim(),
        items: selectedItems.map((item) => ({
          vehicleId: item.vehicleId,
          quantity: item.quantity,
        })),
      };

      console.log("Submitting vehicle request:", requestData);

      const response = await vehicleRequestApi.create(requestData);

      if (response.isSuccess) {
        setAlert({
          type: "success",
          message:
            response.messages?.[0] ||
            "Request submitted successfully! Waiting for manager approval.",
        });

        setTimeout(() => {
          setIsModalOpen(false);
          setSelectedItems([]);
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

  const getTotalUnits = () => {
    return selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Request Vehicles</h1>
        <p className="text-slate-400">
          Request additional stock for available cars
        </p>
      </div>

      {canRequest && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-3">
              {selectedItems.length > 0 && (
                <>
                  <Button onClick={openModal} variant="primary">
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
                    Submit Request
                  </Button>
                  <Button onClick={clearList} variant="danger">
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Clear List
                  </Button>
                </>
              )}
            </div>
            {selectedItems.length > 0 && (
              <div className="bg-blue-600 px-4 py-2 rounded-lg">
                <div className="text-white font-semibold">
                  📋 Request List: {selectedItems.length} vehicle(s) •{" "}
                  {getTotalUnits()} units
                </div>
              </div>
            )}
          </div>
          {selectedItems.length === 0 && (
            <div className="bg-slate-700 rounded-lg p-4 text-slate-300 text-center">
              <svg
                className="w-8 h-8 mx-auto mb-2 text-slate-500"
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
              Your request list is empty. Add vehicles below to create a
              request.
            </div>
          )}
        </div>
      )}

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
            vehicles.map((v) => {
              const isSelected = selectedItems.some(
                (item) => item.vehicleId === v.id
              );
              return (
                <Card
                  key={v.id}
                  hover
                  className={isSelected ? "ring-2 ring-blue-500" : ""}
                >
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
                    <div className="flex-1">
                      <div className="text-white font-bold text-lg">
                        {v.modelName}
                      </div>
                      <div className="text-slate-300 text-sm">{v.version}</div>
                    </div>
                    {isSelected && (
                      <div className="text-blue-500">
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
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
                  <div className="text-slate-400 text-sm mt-2 mb-3">
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
                  {canRequest &&
                    (isSelected ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          value={
                            selectedItems.find(
                              (item) => item.vehicleId === v.id
                            )?.quantity || 1
                          }
                          onChange={(e) => updateQuantity(v.id, e.target.value)}
                          className="w-20 bg-slate-600 border border-slate-500 rounded px-2 py-2 text-white text-center"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                          variant="danger"
                          fullWidth
                          onClick={() => removeFromRequest(v.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        fullWidth
                        onClick={() => addToRequest(v.id)}
                      >
                        Add to List
                      </Button>
                    ))}
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Modal for Review and Submit */}
      {canRequest && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title="Review and Submit Request"
          size="lg"
        >
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <Alert type={alert.type} message={alert.message} />

            {/* Review Selected Items */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Review Selected Vehicles
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedItems.map((item) => (
                  <div
                    key={item.vehicleId}
                    className="bg-slate-700 rounded-lg p-3 flex items-center gap-3"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.modelName}
                      className="w-12 h-12 rounded object-cover bg-slate-600"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/80x60?text=No+Image";
                      }}
                    />
                    <div className="flex-1">
                      <div className="text-white font-semibold text-sm">
                        {item.modelName} {item.version}
                      </div>
                      <div className="text-xs text-slate-400">
                        Current Stock: {item.currentStock ?? 0}
                      </div>
                    </div>
                    <div className="text-blue-400 font-bold text-lg">
                      {item.quantity} units
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 bg-blue-500 bg-opacity-10 border border-blue-500 rounded-lg p-3">
                <div className="text-blue-400 text-sm font-semibold">
                  Total: {getTotalUnits()} units across {selectedItems.length}{" "}
                  vehicle model(s)
                </div>
              </div>
            </div>

            {/* Note */}
            <div>
              <label
                htmlFor="note"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Reason for Request <span className="text-red-400">*</span>
              </label>
              <textarea
                id="note"
                name="note"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Explain why these vehicles need to be restocked..."
                required
                disabled={isSubmitting}
              />
            </div>

            <Modal.Footer>
              <Button
                type="button"
                variant="secondary"
                onClick={closeModal}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Submit Request
              </Button>
            </Modal.Footer>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
}

export default RequestVehiclesPage;
