import React from "react";
import { formatCurrency, formatDateTime } from "../../../utils/helpers";

export default function OrdersDetail({ order, customer, vehicle }) {
    if (!order) return null;
    return (
        <div className="space-y-4">
            <div className="text-lg font-bold text-white">Order ID: <span className="font-normal">{order.id}</span></div>
            <div className="text-slate-400">Date: <span className="text-white">{formatDateTime(order.createdAt || order.created_at)}</span></div>
            <div className="text-slate-400">Customer: <span className="text-white">{order.customerName || (customer ? customer.full_name : order.customerId)}</span></div>
            <div className="text-slate-400">Customer Phone: <span className="text-white">{customer?.phone || order.customerPhone || 'N/A'}</span></div>
            <div className="text-slate-400">Total Amount: <span className="text-orange-400 font-bold">{formatCurrency(order.totalPrice || order.total_amount || order.total_price || 0)}</span></div>
            <div className="text-slate-400">Status: <span className="text-white capitalize">{order.orderStatus || order.order_status || order.status}</span></div>
            <div className="text-slate-400">Payment Type: <span className="text-white">{order.paymentType || order.payment_type}</span></div>
            {vehicle && (
                <div className="mt-6 p-6 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Vehicle Details
                    </h3>
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0">
                            <img
                                src={vehicle.imageUrl || vehicle.image_url || "https://via.placeholder.com/320x240?text=No+Image"}
                                alt={vehicle.modelName || vehicle.model_name}
                                className="w-full md:w-80 h-60 object-cover rounded-lg bg-slate-700 border border-slate-600 shadow-lg"
                            />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <div className="text-3xl font-bold text-white mb-2">
                                    {vehicle.modelName || vehicle.model_name}
                                </div>
                                <div className="text-lg text-blue-400 font-semibold mb-3">{vehicle.version}</div>
                                <div className="text-slate-300 leading-relaxed">{vehicle.description || 'No description available'}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                                    <div className="text-slate-400 text-sm mb-1">Range per Charge</div>
                                    <div className="text-white font-bold text-lg">{vehicle.rangePerCharge || vehicle.range_per_charge} km</div>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                                    <div className="text-slate-400 text-sm mb-1">Battery Capacity</div>
                                    <div className="text-white font-bold text-lg">{vehicle.batteryCapacity || vehicle.battery_capacity} kWh</div>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                                    <div className="text-slate-400 text-sm mb-1">Color</div>
                                    <div className="text-white font-bold text-lg">{vehicle.color}</div>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                                    <div className="text-slate-400 text-sm mb-1">Launch Date</div>
                                    <div className="text-white font-bold text-lg">{vehicle.launchDate || vehicle.launch_date}</div>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                                    <div className="text-slate-400 text-sm mb-1">Price</div>
                                    <div className="text-orange-400 font-bold text-lg">{formatCurrency(vehicle.price || 0)}</div>
                                </div>
                                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                                    <div className="text-slate-400 text-sm mb-1">Stock</div>
                                    <div className="text-white font-bold text-lg">{vehicle.currentStock || vehicle.stock || 0}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
