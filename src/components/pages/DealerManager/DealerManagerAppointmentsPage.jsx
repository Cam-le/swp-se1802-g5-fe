import { useState, useEffect } from "react";
import { DashboardLayout } from "../../layout";
import { Card, Modal, InputField, Select, Alert } from "../../common";
import VehicleSelectRich from "../../common/VehicleSelectRich";
import { useAuth } from "../../../hooks/useAuth";
import { formatDateTime } from "../../../utils/helpers";
import { customerApi } from "../../../services/customerApi";
import { vehicleApi } from "../../../services/vehicleApi";
import { appointmentsApi } from '../../../services/appointmentsApi';
import EmptyState from "../../common/EmptyState";
import LoadingSpinner from "../../common/LoadingSpinner";


function DealerManagerAppointmentsPage() {
    // Phone lookup logic
    const handlePhoneChange = async (e) => {
        const phone = e.target.value;
        setFormData((prev) => ({ ...prev, customer_phone: phone }));
        if (/[a-zA-Z]/.test(phone)) {
            setPhoneError("Letter is not allowed");
            setExistingCustomer(null);
            return;
        } else {
            setPhoneError("");
        }
        if (!phone) {
            setExistingCustomer(null);
            setFormData((prev) => ({ ...prev, customer_name: "", customer_email: "", customer_address: "" }));
            return;
        }
        if (phone.length >= 10) {
            try {
                const customer = await customerApi.getByPhone(phone);
                if (customer) {
                    setExistingCustomer(customer);
                    setFormData((prev) => ({
                        ...prev,
                        customer_name: customer.fullName || customer.customerName || "",
                        customer_email: customer.email || customer.customerEmail || "",
                        customer_address: customer.address || customer.customerAddress || ""
                    }));
                } else {
                    setExistingCustomer(null);
                }
            } catch (error) {
                setExistingCustomer(null);
            }
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.customer_phone) errors.customer_phone = 'Phone is required';
        if (!formData.customer_name) errors.customer_name = 'Customer name is required';
        if (!formData.customer_email) errors.customer_email = 'Email is required';
        if (!formData.customer_address) errors.customer_address = 'Address is required';
        if (!formData.vehicle_id) errors.vehicle_id = 'Vehicle is required';
        if (!formData.appointment_datetime) errors.appointment_datetime = 'Date & Time is required';
        // Date validation
        const now = new Date();
        const selected = new Date(formData.appointment_datetime);
        if (selected < now) errors.appointment_datetime = 'Date cannot be in the past';
        const maxDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        if (selected > maxDate) errors.appointment_datetime = 'Date cannot be more than 7 days ahead';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            setAlert({ type: 'error', message: 'Please add the missing fields below' });
            return;
        }
        setIsSubmitting(true);
        try {
            // Prepare payload for backend
            let appointmentDate = formData.appointment_datetime;
            if (appointmentDate && appointmentDate.length === 16) {
                appointmentDate += ':00';
            }
            const payload = {
                vehicleId: formData.vehicle_id,
                dealerStaffId: user?.id,
                dealerId: user?.dealer_id,
                appointmentDate,
                note: formData.note,
                status: "Booked"
            };
            if (existingCustomer && existingCustomer.id) {
                payload.customerId = existingCustomer.id;
                payload.customerName = existingCustomer.fullName || existingCustomer.customerName || formData.customer_name;
                payload.customerPhone = existingCustomer.phone || existingCustomer.customerPhone || formData.customer_phone;
                payload.customerEmail = existingCustomer.email || existingCustomer.customerEmail || formData.customer_email;
                payload.customerAddress = existingCustomer.address || existingCustomer.customerAddress || formData.customer_address;
            } else {
                payload.customerName = formData.customer_name;
                payload.customerPhone = formData.customer_phone;
                payload.customerEmail = formData.customer_email;
                payload.customerAddress = formData.customer_address;
            }
            // Create appointment
            console.log('Appointment payload:', payload);
            const newAppointment = await appointmentsApi.create(payload);
            setAppointments((prev) => [newAppointment, ...prev]);
            setAlert({ type: 'success', message: 'Appointment added successfully' });
            setTimeout(() => closeModal(), 800);
        } catch (err) {
            let errorMsg = 'Failed to add appointment';
            if (err.response && err.response.data) {
                if (typeof err.response.data === 'string') {
                    errorMsg += ': ' + err.response.data;
                } else if (err.response.data.message) {
                    errorMsg += ': ' + err.response.data.message;
                } else if (err.response.data.error) {
                    errorMsg += ': ' + err.response.data.error;
                } else {
                    errorMsg += ': ' + JSON.stringify(err.response.data);
                }
            }
            setAlert({ type: 'error', message: errorMsg });
        } finally {
            setIsSubmitting(false);
        }
    };
    // Notes for confirm/cancel actions
    const [confirmNote, setConfirmNote] = useState("");
    const [cancelNote, setCancelNote] = useState("");
    // Cancel modal state
    const [isCancelOpen, setIsCancelOpen] = useState(false);
    const [cancellingAppointment, setCancellingAppointment] = useState(null);

    // Cancel Test Drive handler
    const handleCancelTestDrive = async () => {
        if (!cancellingAppointment) return;
        try {
            // Append cancel note to appointment
            await appointmentApi.updateStatus(cancellingAppointment.id, "Cancelled", cancelNote);
            setAlert({ type: 'success', message: 'Test drive schedule cancelled.' });
            // Refresh appointments list
            const appts = await appointmentApi.getAll(user?.id);
            setAppointments(Array.isArray(appts) ? appts : []);
        } catch (err) {
            setAlert({ type: 'error', message: 'Failed to cancel test drive.' });
        } finally {
            setIsCancelOpen(false);
            setCancellingAppointment(null);
            setCancelNote("");
        }
    };
    // Confirm modal state
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [confirmingAppointment, setConfirmingAppointment] = useState(null);

    // Confirm Test Drive handler
    const handleConfirmTestDrive = async () => {
        if (!confirmingAppointment) return;
        try {
            // Append confirm note to appointment
            await appointmentApi.updateStatus(confirmingAppointment.id, "Scheduled", confirmNote);
            setAlert({ type: 'success', message: 'Test drive confirmed and scheduled!' });
            // Refresh appointments list
            const appts = await appointmentApi.getAll(user?.id);
            setAppointments(Array.isArray(appts) ? appts : []);
        } catch (err) {
            setAlert({ type: 'error', message: 'Failed to confirm test drive.' });
        } finally {
            setIsConfirmOpen(false);
            setConfirmingAppointment(null);
            setConfirmNote("");
        }
    };
    // Details modal state
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    // Find staff by id (fallback to id only)
    const getStaff = (id) => ({ full_name: id });
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [formData, setFormData] = useState({
        customer_phone: '',
        customer_name: '',
        customer_email: '',
        customer_address: '',
        vehicle_id: '',
        appointment_datetime: '',
        note: ''
    });
    const [existingCustomer, setExistingCustomer] = useState(null);
    const [phoneError, setPhoneError] = useState("");
    const [formErrors, setFormErrors] = useState({});
    const [alert, setAlert] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("All appointments");

    useEffect(() => {
        // Fetch customers, vehicles, and appointments for selection and display
        async function fetchData() {
            setLoading(true);
            try {
                const [custs, vehs, appts] = await Promise.all([
                    customerApi.getAll(),
                    vehicleApi.getAll(user?.id),
                    appointmentsApi.getAll()
                ]);
                setCustomers(Array.isArray(custs) ? custs : []);
                let vList = Array.isArray(vehs) ? vehs : (vehs?.data || []);
                setVehicles(vList.filter(v => v.status === 'Available' && (v.currentStock || v.stock || 0) > 0));
                // Map backend fields to frontend format
                const mappedAppointments = Array.isArray(appts)
                    ? appts.map(a => ({
                        id: a.id,
                        customer_id: a.customerId || a.customer_id,
                        customer_name: a.customerName || a.customer_name,
                        vehicle_id: a.vehicleId || a.vehicle_id,
                        vehicle_model_name: a.vehicleModelName || a.vehicle_model_name,
                        vehicle_version: a.vehicleVersion || a.vehicle_version,
                        appointment_datetime: a.appointmentDate || a.appointment_datetime,
                        status: a.status,
                        note: a.note,
                        created_at: a.createdAt || a.created_at,
                        dealer_staff_id: a.dealerStaffId || a.dealer_staff_id,
                        dealer_staff_name: a.dealerStaffName || a.dealer_staff_name,
                        dealer_id: a.dealerId || a.dealer_id,
                        dealer_name: a.dealerName || a.dealer_name,
                    }))
                    : [];
                setAppointments(mappedAppointments);
            } catch (err) {
                setAlert({ type: 'error', message: 'Failed to load customers, vehicles, or appointments' });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [isModalOpen, user?.id]);

    const openModal = () => {
        setFormData({
            customer_phone: '',
            customer_name: '',
            customer_email: '',
            customer_address: '',
            vehicle_id: '',
            appointment_datetime: '',
            note: ''
        });
        setFormErrors({});
        setAlert({ type: '', message: '' });
        setExistingCustomer(null);
        setPhoneError("");
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setIsSubmitting(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
    };


    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Appointments Page</h1>
                        <p className="text-slate-400">Manage Test Drive Appointments</p>
                    </div>
                    <button
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors duration-150"
                        onClick={openModal}
                        type="button"
                    >
                        Add Appointment
                    </button>
                </div>

                {/* Summary Cards - 3 column grid for wider cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <Card className="flex flex-col items-center justify-center py-6">
                        <div className="text-slate-400 text-sm">Total Appointments</div>
                        <div className="text-2xl font-bold text-white">{appointments.length}</div>
                    </Card>
                    <Card className="flex flex-col items-center justify-center py-6">
                        <div className="text-slate-400 text-sm">Pending Appointments</div>
                        <div className="text-2xl font-bold text-white">{appointments.filter(a => a.status === "Pending").length}</div>
                    </Card>
                </div>

                {/* Search & Filter - wider search bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <input
                        type="text"
                        className="bg-slate-700 text-white px-4 py-2 rounded col-span-2 border border-slate-600 w-full"
                        placeholder="Search by customer or vehicle name..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <select
                        className="bg-slate-700 text-white px-4 py-2 rounded border border-slate-600 w-full"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        <option>All appointments</option>
                        <option>Pending</option>
                        <option>Scheduled</option>
                        <option>Cancelled</option>
                    </select>
                </div>

                {/* Appointments Table */}
                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <LoadingSpinner size="lg" text="Loading appointments..." />
                    </div>
                ) : appointments.length === 0 ? (
                    <EmptyState
                        title="No appointments found"
                        description="You don't have any appointments yet."
                        action={openModal}
                        actionLabel="Add Appointment"
                    />
                ) : (
                    <div className="overflow-x-auto rounded-lg shadow">
                        <table className="min-w-full bg-slate-800 text-white">
                            <thead>
                                <tr className="bg-slate-700">
                                    <th className="px-4 py-2 text-left">Appointment ID</th>
                                    <th className="px-4 py-2 text-left">Date & Time</th>
                                    <th className="px-4 py-2 text-left">Customer</th>
                                    <th className="px-4 py-2 text-left">Vehicle</th>
                                    <th className="px-4 py-2 text-left">Status</th>
                                    <th className="px-4 py-2 text-left">Notes</th>
                                    <th className="px-4 py-2 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments
                                    .filter(a => {
                                        // Filter by status
                                        if (filterStatus === "All appointments") return true;
                                        return a.status === filterStatus;
                                    })
                                    .filter(a => {
                                        // Search by customer or vehicle name
                                        const customer = customers.find(c => c.id === a.customer_id);
                                        const vehicle = vehicles.find(v => v.id === a.vehicle_id);
                                        const searchLower = search.toLowerCase();
                                        return (
                                            (customer?.full_name?.toLowerCase().includes(searchLower) || "") ||
                                            (vehicle?.model_name?.toLowerCase().includes(searchLower) || "") ||
                                            (vehicle?.modelName?.toLowerCase().includes(searchLower) || "")
                                        );
                                    })
                                    .map(a => {
                                        const customer = customers.find(c => c.id === a.customer_id);
                                        const vehicle = vehicles.find(v => v.id === a.vehicle_id);
                                        return (
                                            <tr key={a.id} className="border-b border-slate-700">
                                                <td className="px-4 py-2">{a.id}</td>
                                                <td className="px-4 py-2">{formatDateTime(a.appointment_datetime)}</td>
                                                <td className="px-4 py-2">{(() => {
                                                    const customer = customers.find(c => c.id === a.customer_id);
                                                    return customer ? (customer.fullName || customer.full_name) : a.customer_id;
                                                })()}</td>
                                                <td className="px-4 py-2">{vehicle ? `${vehicle.model_name || vehicle.modelName} ${vehicle.version || ''}` : a.vehicle_id}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${a.status === "Pending" ? "bg-yellow-500 text-black" : a.status === "Scheduled" ? "bg-green-500 text-white" : a.status === "Cancelled" ? "bg-red-500 text-white" : "bg-slate-600"}`}>{a.status}</span>
                                                </td>
                                                <td className="px-4 py-2">
                                                    {a.note && <div className="text-slate-300 text-sm mb-1">"{a.note}"</div>}
                                                    {a.confirm_note && <div className="text-blue-400 text-xs mt-1">Reason: "{a.confirm_note}"</div>}
                                                    {a.cancel_note && <div className="text-red-400 text-xs mt-1">Reason: "{a.cancel_note}"</div>}
                                                </td>
                                                <td className="px-4 py-2 flex gap-2">
                                                    <button className="bg-slate-600 hover:bg-slate-700 px-2 py-1 rounded text-xs" title="Details" onClick={() => { setSelectedAppointment(a); setIsDetailsOpen(true); }}>
                                                        <svg
                                                            className="w-5 h-5 text-blue-400"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                            />
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                            />
                                                        </svg>
                                                    </button>
                                                    {/* Appointment Details Modal */}
                                                    <Modal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} title="Appointment Details" size="lg">
                                                        {selectedAppointment && (
                                                            <div className="space-y-4">
                                                                <div className="text-lg font-bold text-white">Appointment ID: <span className="font-normal">{selectedAppointment.id}</span></div>
                                                                <div className="text-slate-400">Date & Time: <span className="text-white">{formatDateTime(selectedAppointment.appointment_datetime)}</span></div>
                                                                <div className="text-slate-400">Customer: <span className="text-white">{(customers.find(c => c.id === selectedAppointment.customer_id)?.fullName || customers.find(c => c.id === selectedAppointment.customer_id)?.full_name) || selectedAppointment.customer_id}</span></div>
                                                                <div className="text-slate-400">Vehicle: <span className="text-white">{(vehicles.find(v => v.id === selectedAppointment.vehicle_id)?.modelName || vehicles.find(v => v.id === selectedAppointment.vehicle_id)?.model_name) || selectedAppointment.vehicle_id}</span></div>
                                                                <div className="text-slate-400">Staff: <span className="text-white">{getStaff(selectedAppointment.dealer_staff_id)?.full_name || selectedAppointment.dealer_staff_id}</span></div>
                                                                <div className="text-slate-400">Status: <span className="text-white capitalize">{selectedAppointment.status}</span></div>
                                                                {/* Full vehicle info */}
                                                                {(() => {
                                                                    const vehicle = vehicles.find(v => v.id === selectedAppointment.vehicle_id);
                                                                    if (!vehicle) return null;
                                                                    return (
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
                                                                    );
                                                                })()}
                                                            </div>
                                                        )}
                                                    </Modal>
                                                    {a.status === "Pending" && (
                                                        <button className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs text-white" title="Confirm Test Drive" onClick={() => { setConfirmingAppointment(a); setIsConfirmOpen(true); }}>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                        </button>
                                                    )}
                                                    {(a.status === "Pending" || a.status === "Scheduled") && (
                                                        <button className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs text-white" title="Cancel Test Drive" onClick={() => { setCancellingAppointment(a); setIsCancelOpen(true); }}>
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    )}
                                                    {/* Cancel Test Drive Modal */}
                                                    <Modal isOpen={isCancelOpen} onClose={() => { setIsCancelOpen(false); setCancellingAppointment(null); setCancelNote(""); }} title="Cancel Test Drive" size="sm">
                                                        <div className="space-y-4">
                                                            <div className="text-lg font-semibold text-white">Cancel Test Drive Schedule?</div>
                                                            <div className="text-slate-400">Are you sure you want to cancel this test drive schedule?</div>
                                                            <InputField label="Notes (Reason for cancellation)" value={cancelNote} onChange={e => setCancelNote(e.target.value)} placeholder="Enter reason..." />
                                                            <div className="flex justify-end gap-2 mt-6">
                                                                <button className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded" onClick={() => { setIsCancelOpen(false); setCancellingAppointment(null); setCancelNote(""); }}>Keep</button>
                                                                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold" onClick={handleCancelTestDrive}>Cancel Schedule</button>
                                                            </div>
                                                        </div>
                                                    </Modal>
                                                    {/* Confirm Test Drive Modal */}
                                                    <Modal isOpen={isConfirmOpen} onClose={() => { setIsConfirmOpen(false); setConfirmingAppointment(null); setConfirmNote(""); }} title="Confirm Test Drive" size="sm">
                                                        <div className="space-y-4">
                                                            <div className="text-lg font-semibold text-white">Confirm Test Drive Schedule?</div>
                                                            <div className="text-slate-400">Are you sure you want to confirm and schedule this test drive?</div>
                                                            <InputField label="Notes (Reason for confirmation)" value={confirmNote} onChange={e => setConfirmNote(e.target.value)} placeholder="Enter note..." />
                                                            <div className="flex justify-end gap-2 mt-6">
                                                                <button className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded" onClick={() => { setIsConfirmOpen(false); setConfirmingAppointment(null); setConfirmNote(""); }}>Cancel</button>
                                                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold" onClick={handleConfirmTestDrive}>Confirm</button>
                                                            </div>
                                                        </div>
                                                    </Modal>
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Add Appointment Modal */}
                <Modal isOpen={isModalOpen} onClose={closeModal} title="Add Appointment" size="md">
                    <form onSubmit={handleSubmit}>
                        {alert.message && <Alert type={alert.type} message={alert.message} />}
                        <div className="grid grid-cols-1 gap-4">
                            <InputField
                                id="customer_phone"
                                name="customer_phone"
                                label="Customer Phone"
                                value={formData.customer_phone}
                                onChange={handlePhoneChange}
                                error={formErrors.customer_phone || phoneError}
                                placeholder="Enter phone number"
                            />
                            <InputField
                                id="customer_name"
                                name="customer_name"
                                label="Customer Name"
                                value={formData.customer_name}
                                onChange={handleInputChange}
                                error={formErrors.customer_name}
                                placeholder="Enter customer name"
                                disabled={!!existingCustomer}
                            />
                            <InputField
                                id="customer_email"
                                name="customer_email"
                                label="Customer Email"
                                value={formData.customer_email}
                                onChange={handleInputChange}
                                error={formErrors.customer_email}
                                placeholder="Enter customer email"
                                disabled={!!existingCustomer}
                            />
                            <InputField
                                id="customer_address"
                                name="customer_address"
                                label="Customer Address"
                                value={formData.customer_address}
                                onChange={handleInputChange}
                                error={formErrors.customer_address}
                                placeholder="Enter customer address"
                                disabled={!!existingCustomer}
                            />
                            <VehicleSelectRich
                                id="vehicle_id"
                                name="vehicle_id"
                                label="Vehicle"
                                value={formData.vehicle_id}
                                onChange={handleInputChange}
                                options={vehicles.map((v) => ({
                                    value: v.id,
                                    label: v.modelName || v.model_name,
                                    imageUrl: v.imageUrl,
                                    stock: v.currentStock ?? v.stock,
                                    status: v.status
                                }))}
                                error={formErrors.vehicle_id}
                                placeholder="Select vehicle"
                            />
                            <InputField
                                id="appointment_datetime"
                                name="appointment_datetime"
                                label="Date & Time"
                                type="datetime-local"
                                value={formData.appointment_datetime}
                                onChange={handleInputChange}
                                error={formErrors.appointment_datetime}
                                min={new Date().toISOString().slice(0, 16)}
                                max={(() => {
                                    const maxDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                                    return maxDate.toISOString().slice(0, 16);
                                })()}
                            />
                            <InputField
                                id="note"
                                name="note"
                                label="Note (optional)"
                                value={formData.note}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="mt-4 flex items-center justify-end space-x-2">
                            <button
                                type="button"
                                className="bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg"
                                onClick={closeModal}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Adding...' : 'Add Appointment'}
                            </button>
                        </div>
                    </form>
                </Modal>
            </div>
        </DashboardLayout>
    );
}

export default DealerManagerAppointmentsPage;
