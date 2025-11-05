import React from "react";
import { formatCurrency, formatDateTime } from "../../../utils/helpers";

export default function OrdersDetail({ order, customer, vehicle }) {
    if (!order) return null;
    return (
        <div className="space-y-4">
            <div className="text-lg font-bold text-white">Order ID: <span className="font-normal">{order.id}</span></div>
            <div className="text-slate-400">Date: <span className="text-white">{formatDateTime(order.created_at)}</span></div>
            <div className="text-slate-400">Customer: <span className="text-white">{customer ? customer.full_name : order.customer_id}</span></div>
            <div className="text-slate-400">Total Amount: <span className="text-orange-400 font-bold">{formatCurrency(order.total_amount || order.total_price || 0)}</span></div>
            <div className="text-slate-400">Status: <span className="text-white capitalize">{order.order_status || order.status}</span></div>
            <div className="text-slate-400">Payment Type: <span className="text-white">{order.payment_type}</span></div>
            {vehicle && (
                <div className="mt-6 p-4 rounded bg-slate-800 border border-slate-700">
                    <div className="flex gap-6 items-center">
                        <img src={vehicle.imageUrl || vehicle.image_url || "https://via.placeholder.com/160x120?text=No+Image"} alt={vehicle.modelName || vehicle.model_name} className="w-40 h-28 object-cover rounded bg-slate-700" />
                        <div>
                            <div className="text-xl font-bold text-white">{vehicle.modelName || vehicle.model_name} <span className="text-base text-slate-400">{vehicle.version}</span></div>
                            <div className="text-slate-300 mt-2">{vehicle.description}</div>
                            <div className="flex gap-8 mt-2">
                                <div className="text-slate-400">Range: <span className="text-white font-semibold">{vehicle.rangePerCharge || vehicle.range_per_charge} km</span></div>
                                <div className="text-slate-400">Battery: <span className="text-white font-semibold">{vehicle.batteryCapacity || vehicle.battery_capacity} kWh</span></div>
                            </div>
                            <div className="text-slate-400 mt-2">Color: <span className="text-white">{vehicle.color}</span></div>
                            <div className="text-slate-400 mt-2">Launch Date: <span className="text-white">{vehicle.launchDate || vehicle.launch_date}</span></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
