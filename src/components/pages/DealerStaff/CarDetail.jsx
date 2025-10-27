import { useEffect } from "react";
import { Card, Button, Badge } from "../../common";
import { formatCurrency, formatShortDate } from "../../../utils/helpers";

function CarDetail({ vehicle, onClose }) {
    if (!vehicle) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 overflow-y-auto">
            <div className="w-full max-w-5xl mx-auto my-12">
                <Card className="p-10 relative flex flex-col md:flex-row gap-10 items-center md:items-start">
                    <img
                        src={vehicle.imageUrl}
                        alt={vehicle.modelName}
                        className="w-full max-w-md h-80 object-cover rounded-lg bg-slate-700"
                        onError={(e) => {
                            e.target.src = "https://via.placeholder.com/400x300?text=No+Image";
                        }}
                    />
                    <div className="flex-1 flex flex-col gap-2">
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-slate-400 hover:text-white text-3xl font-bold"
                            aria-label="Close"
                        >
                            ×
                        </button>
                        <h2 className="text-4xl font-bold text-white mb-2">
                            {vehicle.modelName} <span className="text-2xl text-slate-400">- {vehicle.version}</span>
                        </h2>
                        <div className="text-lg text-slate-300 mb-4">{vehicle.description}</div>
                        <div className="flex flex-wrap gap-6 mb-2">
                            <div>
                                <span className="text-base text-slate-400">Category:</span>
                                <span className="ml-1 font-semibold text-white">{vehicle.category}</span>
                            </div>
                            <div>
                                <span className="text-base text-slate-400">Color:</span>
                                <span className="ml-1 font-semibold text-white">{vehicle.color}</span>
                            </div>
                            <div>
                                <span className="text-base text-slate-400">Status:</span>
                                <span className="ml-1 font-semibold"><Badge>{vehicle.status}</Badge></span>
                            </div>
                            <div>
                                <span className="text-base text-slate-400">Stock:</span>
                                <span className="ml-1 font-semibold"><Badge>{vehicle.currentStock}</Badge></span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-6 mb-2">
                            <div>
                                <span className="text-base text-slate-400">Range:</span>
                                <span className="ml-1 font-semibold text-white">{vehicle.rangePerCharge} km</span>
                            </div>
                            <div>
                                <span className="text-base text-slate-400">Battery:</span>
                                <span className="ml-1 font-semibold text-white">{vehicle.batteryCapacity} kWh</span>
                            </div>
                            <div>
                                <span className="text-base text-slate-400">Launch Date:</span>
                                <span className="ml-1 font-semibold text-white">{vehicle.launchDate ? formatShortDate(vehicle.launchDate) : '-'}</span>
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-orange-400 mb-4">
                            {formatCurrency(vehicle.basePrice)}
                        </div>
                        <Button variant="primary" onClick={onClose} className="mt-4 w-max self-end">Return</Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default CarDetail;
