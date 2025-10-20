
import { useState, useEffect } from "react";
import { DashboardLayout } from "../../layout";
import { Card, Modal } from "../../common";
import InputField from "../../common/InputField";
import { useAuth } from "../../../hooks/useAuth";

import { vehicleApi } from "../../../services/vehicleApi";
import { vehicleRequestApi } from "../../../services/mockApi";

function RequestVehiclesPage() {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [requestSuccess, setRequestSuccess] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Only allow Dealer Staff and Dealer Manager
    const canRequest = user?.role === "Dealer Staff" || user?.role === "Dealer Manager";

    // Fetch vehicles on mount
    useEffect(() => {
        async function fetchVehicles() {
            setLoading(true);
            try {
                const response = await vehicleApi.getAll(user?.id);
                if (response.isSuccess) {
                    setVehicles(response.data);
                } else {
                    setVehicles([]);
                }
            } catch {
                setVehicles([]);
            } finally {
                setLoading(false);
            }
        }
        fetchVehicles();
    }, [user]);

    // Submit request to mock API
    const handleSubmitRequest = async (e) => {
        e.preventDefault();
        try {
            await vehicleRequestApi.create({
                vehicle_id: selectedVehicle,
                quantity,
                requested_by: user?.id,
                requested_by_role: user?.role,
                dealer_id: user?.dealer_id,
            });
            setRequestSuccess(true);
            setTimeout(() => {
                setIsModalOpen(false);
                setRequestSuccess(false);
                setSelectedVehicle("");
                setQuantity(1);
            }, 1200);
        } catch (err) {
            alert("Failed to submit request");
        }
    };


    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white">Request Vehicles</h1>
                <p className="text-slate-400">Dealer Staff and Dealer Manager can request additional stock for available cars.</p>
            </div>
            {canRequest && (
                <div className="mb-6">
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Request More Stock
                    </button>
                </div>
            )}
            {/* Vehicles List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="text-slate-400">Loading vehicles...</div>
                ) : vehicles.length === 0 ? (
                    <div className="text-slate-400">No vehicles found.</div>
                ) : (
                    vehicles.map((v) => (
                        <Card key={v.id} hover>
                            <div className="flex items-center gap-3 mb-2">
                                <img
                                    src={v.imageUrl}
                                    alt={v.modelName}
                                    className="w-16 h-16 rounded-lg object-cover bg-slate-700"
                                    onError={e => { e.target.src = "https://via.placeholder.com/150?text=No+Image"; }}
                                />
                                <div>
                                    <div className="text-white font-bold text-lg">{v.modelName}</div>
                                    <div className="text-slate-300 text-sm">{v.version}</div>
                                </div>
                            </div>
                            <div className="text-slate-300 text-sm mb-2">Category: <span className="text-white">{v.category}</span></div>
                            <div className="text-slate-300 text-sm mb-2">Color: <span className="text-white">{v.color}</span></div>
                            <div className="text-slate-300 text-sm mb-2">Battery: <span className="text-white">{v.batteryCapacity} kWh</span></div>
                            <div className="text-slate-300 text-sm mb-2">Range: <span className="text-white">{v.rangePerCharge} km</span></div>
                            <div className="text-slate-300 text-sm mb-2">Base Price: <span className="text-white">{v.basePrice?.toLocaleString()} đ</span></div>
                            <div className="text-slate-400 text-sm mt-2">Status: <span className="text-white capitalize">{v.status}</span></div>
                            <div className="text-slate-400 text-sm mt-2">In Stock: <span className="text-white">{v.currentStock ?? 0} units</span></div>
                        </Card>
                    ))
                )}
            </div>
            {/* Modal for Stock Request */}
            {canRequest && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Request More Stock">
                    <form onSubmit={handleSubmitRequest} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Select Vehicle</label>
                            <select
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg text-white px-4 py-3 focus:outline-none"
                                value={selectedVehicle}
                                onChange={e => setSelectedVehicle(e.target.value)}
                                required
                            >
                                <option value="" disabled>Select a vehicle</option>
                                {vehicles.map(v => (
                                    <option key={v.id} value={v.id}>{v.modelName + " " + v.version}</option>
                                ))}
                            </select>
                        </div>
                        <InputField
                            id="quantity"
                            name="quantity"
                            type="number"
                            label="Quantity"
                            value={quantity}
                            onChange={e => setQuantity(Number(e.target.value))}
                            min={1}
                            required
                        />
                        <Modal.Footer>
                            <button
                                type="button"
                                className="bg-slate-600 text-white px-4 py-2 rounded-lg mr-2"
                                onClick={() => setIsModalOpen(false)}
                            >Cancel</button>
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
                                disabled={requestSuccess}
                            >{requestSuccess ? "Request Sent!" : "Send Request"}</button>
                        </Modal.Footer>
                    </form>
                </Modal>
            )}
        </DashboardLayout>
    );
}

export default RequestVehiclesPage;
