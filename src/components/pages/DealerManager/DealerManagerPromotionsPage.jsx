
import { useEffect, useState } from "react";
import { DashboardLayout } from "../../layout";
import { Card, Badge } from "../../common";
import Table from "../../common/Table";
import { useAuth } from "../../../hooks/useAuth";
import vehicleApi from "../../../services/vehicleApi";
import Modal from "../../common/Modal";
import InputField from "../../common/InputField";
import Button from "../../common/Button";

function DealerManagerPromotionsPage() {
    const { user } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [promoName, setPromoName] = useState("");
    const [promoDiscount, setPromoDiscount] = useState("");
    const [promoError, setPromoError] = useState("");
    const [promoLoading, setPromoLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                setLoading(true);
                setError(null);
                // Fetch vehicles for this dealer manager
                const res = await vehicleApi.getAll(user?.id);
                setVehicles(res.data || []);
            } catch (err) {
                setError("Failed to load vehicles");
            } finally {
                setLoading(false);
            }
        };
        if (user?.id) fetchVehicles();
    }, [user?.id]);

    const openPromotionModal = (vehicle) => {
        setSelectedVehicle(vehicle);
        setPromoName("");
        setPromoDiscount("");
        setPromoError("");
        setShowModal(true);
    };

    const closePromotionModal = () => {
        setShowModal(false);
        setSelectedVehicle(null);
        setPromoName("");
        setPromoDiscount("");
        setPromoError("");
    };

    const handleCreatePromotion = async (e) => {
        e.preventDefault();
        setPromoError("");
        if (!promoName || !promoDiscount) {
            setPromoError("Please enter promotion name and discount.");
            return;
        }
        if (isNaN(Number(promoDiscount)) || Number(promoDiscount) <= 0) {
            setPromoError("Discount must be a positive number.");
            return;
        }
        setPromoLoading(true);
        // TODO: Call API to create promotion for selectedVehicle
        setTimeout(() => {
            setPromoLoading(false);
            setShowModal(false);
            // Optionally show success message or refresh data
        }, 1000);
    };

    // Filtered and searched vehicles
    const filteredVehicles = vehicles.filter((v) => {
        const matchesSearch =
            !search ||
            (v.modelName || v.model_name || "").toLowerCase().includes(search.toLowerCase()) ||
            (v.version || "").toLowerCase().includes(search.toLowerCase()) ||
            (v.category || "").toLowerCase().includes(search.toLowerCase());
        const matchesStatus = !statusFilter || (v.status || "").toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    // Helper for badge color
    const getStockBadge = (count) => {
        if (count >= 6) return "bg-green-500";
        if (count >= 3) return "bg-yellow-500";
        return "bg-red-500";
    };

    // Helper for status badge
    const getStatusBadge = (status) => {
        if ((status || "").toLowerCase() === "available") return "bg-green-500";
        return "bg-slate-500";
    };

    // Helper for formatting VND
    const formatVND = (value) => {
        if (!value && value !== 0) return "";
        return value.toLocaleString("vi-VN") + " ₫";
    };

    // Helper for battery/range
    const getBatteryRange = (v) => {
        return `${v.batteryCapacity || v.battery_capacity || "-"} kWh\n${v.rangePerCharge || v.range_per_charge || "-"} km`;
    };

    // Helper for stock: use currentStock if available, else fallback
    const getStock = (v) => v.currentStock ?? v.inStock ?? v.stock ?? v.inventory ?? 0;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white">Promotions Page</h1>
                    <p className="text-slate-400">Welcome back, {user?.full_name}!</p>
                </div>
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-800 p-6 rounded-xl">
                    <input
                        type="text"
                        className="w-full md:w-1/2 px-4 py-3 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Search by model, version, or category..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <select
                        className="w-full md:w-1/4 px-4 py-3 rounded-lg bg-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="">Filter by status</option>
                        <option value="available">Available</option>
                        <option value="sold">Sold</option>
                    </select>
                </div>
                {/* Promotions Content */}
                <Card>
                    <Table>
                        <Table.Header>
                            <Table.HeaderCell>Vehicle</Table.HeaderCell>
                            <Table.HeaderCell>Category</Table.HeaderCell>
                            <Table.HeaderCell>Battery & Range</Table.HeaderCell>
                            <Table.HeaderCell>Base Price</Table.HeaderCell>
                            <Table.HeaderCell>In Stock</Table.HeaderCell>
                            <Table.HeaderCell>Status</Table.HeaderCell>
                            <Table.HeaderCell>Actions</Table.HeaderCell>
                        </Table.Header>
                        <Table.Body>
                            {loading ? (
                                <Table.Row>
                                    <Table.Cell colSpan={7}>
                                        <div className="text-slate-400">Loading vehicles...</div>
                                    </Table.Cell>
                                </Table.Row>
                            ) : error ? (
                                <Table.Row>
                                    <Table.Cell colSpan={7}>
                                        <div className="text-red-400">{error}</div>
                                    </Table.Cell>
                                </Table.Row>
                            ) : filteredVehicles.length === 0 ? (
                                <Table.Empty colSpan={7}>No vehicles found</Table.Empty>
                            ) : (
                                filteredVehicles.map((v) => (
                                    <Table.Row key={v.id}>
                                        <Table.Cell>
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={v.imageUrl || v.image_url || "https://via.placeholder.com/64x48?text=EV"}
                                                    alt={v.modelName || v.model_name}
                                                    className="w-14 h-10 object-cover rounded-lg border border-slate-700"
                                                />
                                                <div>
                                                    <div className="font-semibold text-white">{v.modelName || v.model_name}</div>
                                                    <div className="text-slate-400 text-xs">{v.version}</div>
                                                </div>
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell>{v.category}</Table.Cell>
                                        <Table.Cell>
                                            <div className="whitespace-pre text-slate-300">
                                                {getBatteryRange(v)}
                                            </div>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <span className="font-semibold text-white">{formatVND(v.finalPrice !== undefined ? v.finalPrice : v.base_price)}</span>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStockBadge(getStock(v))}`}>
                                                {getStock(v)} units
                                            </span>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusBadge(v.status)}`}>
                                                {v.status || "-"}
                                            </span>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <button
                                                className="text-blue-400 hover:text-blue-600 transition-colors"
                                                title="Create Promotion"
                                                onClick={() => openPromotionModal(v)}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3zm-2 2h.01M7 17h.01M17 7h.01" />
                                                </svg>
                                            </button>
                                        </Table.Cell>
                                    </Table.Row>
                                ))
                            )}
                        </Table.Body>
                    </Table>
                </Card>

                {/* Promotion Modal */}
                <Modal isOpen={showModal} onClose={closePromotionModal} title="Create Promotion">
                    {selectedVehicle && (
                        <form onSubmit={handleCreatePromotion} className="space-y-4">
                            <div>
                                <div className="text-slate-300 mb-2">
                                    <span className="font-semibold">Vehicle:</span> {selectedVehicle.modelName || selectedVehicle.model_name} ({selectedVehicle.version})
                                </div>
                                <div className="text-slate-300 mb-2">
                                    <span className="font-semibold">Final Price:</span> {formatVND(selectedVehicle.finalPrice !== undefined ? selectedVehicle.finalPrice : selectedVehicle.base_price)}
                                </div>
                            </div>
                            <InputField
                                id="promoName"
                                name="promoName"
                                label="Promotion Name"
                                value={promoName}
                                onChange={e => setPromoName(e.target.value)}
                                placeholder="Enter promotion name"
                            />
                            <InputField
                                id="promoDiscount"
                                name="promoDiscount"
                                label="Discount Amount (VND)"
                                type="number"
                                value={promoDiscount}
                                onChange={e => setPromoDiscount(e.target.value)}
                                placeholder="Enter discount amount"
                            />
                            {promoError && <div className="text-red-400">{promoError}</div>}
                            <Modal.Footer>
                                <Button variant="secondary" onClick={closePromotionModal} type="button">Cancel</Button>
                                <Button variant="primary" type="submit" isLoading={promoLoading}>Create Promotion</Button>
                            </Modal.Footer>
                        </form>
                    )}
                </Modal>
            </div>
        </DashboardLayout>
    );
}

export default DealerManagerPromotionsPage;