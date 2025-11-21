import { useState, useEffect } from "react";
import { DashboardLayout } from "../../layout";
import { Card, Modal, InputField, Select, Alert } from "../../common";
import VehicleSelectRich from "../../common/VehicleSelectRich";
import { useAuth } from "../../../hooks/useAuth";
// import { MOCK_USERS } from "../../../data/mockData";
import { formatDateTime } from "../../../utils/helpers";
import { customerApi } from "../../../services/customerApi";
import { vehicleApi } from "../../../services/vehicleApi";
import { appointmentsApi } from '../../../services/appointmentsApi';
import EmptyState from "../../common/EmptyState";
import LoadingSpinner from "../../common/LoadingSpinner"; // Import the loading spinner component


function AppointmentsPage() {
    // State for Complete modal
    const [isCompleteOpen, setIsCompleteOpen] = useState(false);
    const [completingAppointment, setCompletingAppointment] = useState(null);

    // State for Cancel modal
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancellingAppointment, setCancellingAppointment] = useState(null);

    // State for Reschedule modal
    const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
    const [reschedulingAppointment, setReschedulingAppointment] = useState(null);
    const [rescheduleData, setRescheduleData] = useState({
        appointment_datetime: '',
        note: ''
    });
    const [rescheduleErrors, setRescheduleErrors] = useState({});

    // Notes for confirm/cancel actions
    const [confirmNote, setConfirmNote] = useState("");
    const [cancelNote, setCancelNote] = useState("");
    // Cancel modal state (old functionality - can be removed if not used)
    const [isCancelOpen, setIsCancelOpen] = useState(false);

    // Cancel Test Drive handler (old functionality)
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

    // Complete Appointment handler
    const handleCompleteAppointment = async () => {
        if (!completingAppointment) return;
        try {
            // Convert appointment date to ISO format
            const appointmentDate = completingAppointment.appointment_datetime || completingAppointment.appointmentDate;
            const isoDate = new Date(appointmentDate).toISOString();

            // Send only the required fields as per API spec
            const payload = {
                appointmentDate: isoDate,
                status: "Completed",
                note: completingAppointment.note || ""
            };

            console.log('Complete appointment payload:', payload);
            console.log('Appointment ID:', completingAppointment.id);

            const response = await appointmentsApi.update(completingAppointment.id, payload);
            console.log('Complete appointment response:', response);
            setAlert({ type: 'success', message: 'Appointment marked as completed!' });
            // Refresh appointments list
            const appts = await appointmentsApi.getAll();
            const mappedAppointments = Array.isArray(appts)
                ? appts.map(a => ({
                    id: a.id,
                    customer_id: a.customerId || a.customer_id,
                    customer_name: a.customerName || a.customer_name,
                    customer_phone: a.customerPhone || a.customer_phone,
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
            console.error('Complete appointment error:', err);
            const errorMsg = err.response?.data?.message || err.response?.data || err.message || 'Failed to complete appointment.';
            setAlert({ type: 'error', message: errorMsg });
        } finally {
            setIsCompleteOpen(false);
            setCompletingAppointment(null);
        }
    };

    // Cancel Appointment handler
    const handleCancelAppointment = async () => {
        if (!cancellingAppointment) return;
        try {
            // Convert appointment date to ISO format
            const appointmentDate = cancellingAppointment.appointment_datetime || cancellingAppointment.appointmentDate;
            const isoDate = new Date(appointmentDate).toISOString();

            // Send only the required fields as per API spec
            const payload = {
                appointmentDate: isoDate,
                status: "Canceled",
                note: cancellingAppointment.note || ""
            };

            console.log('Cancel appointment payload:', payload);
            console.log('Appointment ID:', cancellingAppointment.id);

            const response = await appointmentsApi.update(cancellingAppointment.id, payload);
            console.log('Cancel appointment response:', response);
            setAlert({ type: 'success', message: 'Appointment cancelled successfully!' });
            // Refresh appointments list
            const appts = await appointmentsApi.getAll();
            const mappedAppointments = Array.isArray(appts)
                ? appts.map(a => ({
                    id: a.id,
                    customer_id: a.customerId || a.customer_id,
                    customer_name: a.customerName || a.customer_name,
                    customer_phone: a.customerPhone || a.customer_phone,
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
            console.error('Cancel appointment error:', err);
            console.error('Error response:', err.response);
            console.error('Error data:', err.response?.data);
            console.error('Error status:', err.response?.status);
            const errorMsg = err.response?.data?.message || err.response?.data || err.message || 'Failed to cancel appointment.';
            setAlert({ type: 'error', message: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg) });
        } finally {
            setIsCancelModalOpen(false);
            setCancellingAppointment(null);
        }
    };

    // Reschedule Appointment handler
    const handleRescheduleAppointment = async (e) => {
        e.preventDefault();
        if (!reschedulingAppointment) return;

        // Validate reschedule form
        const errors = {};
        if (!rescheduleData.appointment_datetime) {
            errors.appointment_datetime = 'New date & time is required';
        } else {
            const now = new Date();
            const selected = new Date(rescheduleData.appointment_datetime);
            if (selected < now) errors.appointment_datetime = 'Date cannot be in the past';
            const maxDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            if (selected > maxDate) errors.appointment_datetime = 'Date cannot be more than 7 days ahead';
        }

        if (Object.keys(errors).length > 0) {
            setRescheduleErrors(errors);
            return;
        }

        try {
            let appointmentDate = rescheduleData.appointment_datetime;
            if (appointmentDate && appointmentDate.length === 16) {
                appointmentDate += ':00';
            }
            const isoDate = new Date(appointmentDate).toISOString();

            await appointmentsApi.update(reschedulingAppointment.id, {
                appointmentDate: isoDate,
                status: "Rescheduled",
                note: rescheduleData.note || reschedulingAppointment.note || ""
            });
            setAlert({ type: 'success', message: 'Appointment rescheduled successfully!' });
            // Refresh appointments list
            const appts = await appointmentsApi.getAll();
            const mappedAppointments = Array.isArray(appts)
                ? appts.map(a => ({
                    id: a.id,
                    customer_id: a.customerId || a.customer_id,
                    customer_name: a.customerName || a.customer_name,
                    customer_phone: a.customerPhone || a.customer_phone,
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
            console.error('Reschedule appointment error:', err);
            const errorMsg = err.response?.data?.message || err.response?.data || err.message || 'Failed to reschedule appointment.';
            setAlert({ type: 'error', message: errorMsg });
        } finally {
            setIsRescheduleOpen(false);
            setReschedulingAppointment(null);
            setRescheduleData({ appointment_datetime: '', note: '' });
            setRescheduleErrors({});
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
                        customer_phone: a.customerPhone || a.customer_phone,
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
        setFormData({ customer_phone: '', customer_name: '', vehicle_id: '', appointment_datetime: '', note: '' });
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
            // Prepare appointmentDate in ISO format
            let appointmentDate = formData.appointment_datetime;
            if (appointmentDate && appointmentDate.length === 16) {
                appointmentDate += ':00';
            }
            // Convert to ISO string for backend
            const isoDate = new Date(appointmentDate).toISOString();

            // Backend ALWAYS expects newCustomer object
            // It will automatically check if customer exists by phone
            const payload = {
                newCustomer: {
                    fullName: formData.customer_name,
                    phone: formData.customer_phone,
                    email: formData.customer_email || "",
                    address: formData.customer_address || ""
                },
                vehicleId: formData.vehicle_id,
                dealerId: user?.dealer_id,
                appointmentDate: isoDate,
                note: formData.note || ""
            };

            console.log('Appointment payload:', JSON.stringify(payload, null, 2));
            console.log('DealerStaffId (query param):', user?.id);

            const newAppointment = await appointmentsApi.create(payload, user?.id);

            // Map the response to match frontend format
            const mappedAppointment = {
                id: newAppointment.id,
                customer_id: newAppointment.customerId,
                customer_name: newAppointment.customerName,
                customer_phone: newAppointment.customerPhone,
                vehicle_id: newAppointment.vehicleId,
                vehicle_model_name: newAppointment.vehicleModelName,
                vehicle_version: newAppointment.vehicleVersion,
                appointment_datetime: newAppointment.appointmentDate,
                status: newAppointment.status,
                note: newAppointment.note,
                created_at: newAppointment.createdAt,
                dealer_staff_id: newAppointment.dealerStaffId,
                dealer_staff_name: newAppointment.dealerStaffName,
                dealer_id: newAppointment.dealerId,
                dealer_name: newAppointment.dealerName,
            };

            setAppointments((prev) => [mappedAppointment, ...prev]);
            setAlert({ type: 'success', message: 'Appointment created successfully!' });

            // Close add modal and show details modal
            setTimeout(() => {
                closeModal();
                setSelectedAppointment(mappedAppointment);
                setIsDetailsOpen(true);
            }, 500);
        } catch (err) {
            console.error('Full error:', err);
            let errorMsg = 'Failed to add appointment';
            if (err.response?.data) {
                const data = err.response.data;
                if (typeof data === 'string') {
                    errorMsg += ': ' + data;
                } else if (data.errors) {
                    // Handle validation errors
                    const validationErrors = Object.entries(data.errors)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ');
                    errorMsg += ': ' + validationErrors;
                } else if (data.message) {
                    errorMsg += ': ' + data.message;
                } else if (data.error) {
                    errorMsg += ': ' + data.error;
                } else {
                    errorMsg += ': ' + JSON.stringify(data);
                }
            } else if (err.message) {
                errorMsg += ': ' + err.message;
            }
            setAlert({ type: 'error', message: errorMsg });
        } finally {
            setIsSubmitting(false);
        }
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

                {/* Summary Cards - 4 column grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                    <Card className="flex flex-col items-center justify-center py-6">
                        <div className="text-slate-400 text-sm">Total Appointments</div>
                        <div className="text-2xl font-bold text-white">{appointments.length}</div>
                    </Card>
                    <Card className="flex flex-col items-center justify-center py-6">
                        <div className="text-slate-400 text-sm">Booked</div>
                        <div className="text-2xl font-bold text-blue-400">{appointments.filter(a => a.status === "Booked").length}</div>
                    </Card>
                    <Card className="flex flex-col items-center justify-center py-6">
                        <div className="text-slate-400 text-sm">Rescheduled</div>
                        <div className="text-2xl font-bold text-orange-400">{appointments.filter(a => a.status === "Rescheduled").length}</div>
                    </Card>
                    <Card className="flex flex-col items-center justify-center py-6">
                        <div className="text-slate-400 text-sm">Canceled</div>
                        <div className="text-2xl font-bold text-red-400">{appointments.filter(a => a.status === "Canceled").length}</div>
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
                        <option>Booked</option>
                        <option>Completed</option>
                        <option>Rescheduled</option>
                        <option>Canceled</option>
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
                                        // Search by customer name, appointment customer_name, or vehicle name
                                        const customer = customers.find(c => c.id === a.customer_id);
                                        const vehicle = vehicles.find(v => v.id === a.vehicle_id);
                                        const searchLower = search.toLowerCase();
                                        return (
                                            (customer?.full_name?.toLowerCase().includes(searchLower) || "") ||
                                            (a.customer_name?.toLowerCase().includes(searchLower) || "") ||
                                            (vehicle?.model_name?.toLowerCase().includes(searchLower) || "") ||
                                            (vehicle?.modelName?.toLowerCase().includes(searchLower) || "")
                                        );
                                    })
                                    .map(a => {
                                        const customer = customers.find(c => c.id === a.customer_id);
                                        const vehicle = vehicles.find(v => v.id === a.vehicle_id);
                                        return (
                                            <tr key={a.id} className="border-b border-slate-700">
                                                <td className="px-4 py-2">{formatDateTime(a.appointment_datetime)}</td>
                                                <td className="px-4 py-2">{(() => {
                                                    const customer = customers.find(c => c.id === a.customer_id);
                                                    return customer ? (customer.fullName || customer.full_name) : a.customer_id;
                                                })()}</td>
                                                <td className="px-4 py-2">{vehicle ? `${vehicle.model_name || vehicle.modelName} ${vehicle.version || ''}` : a.vehicle_id}</td>
                                                <td className="px-4 py-2">
                                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${a.status === "Booked" ? "bg-blue-500 text-white" :
                                                        a.status === "Completed" ? "bg-green-500 text-white" :
                                                            a.status === "Rescheduled" ? "bg-orange-500 text-white" :
                                                                a.status === "Canceled" ? "bg-red-500 text-white" :
                                                                    a.status === "Pending" ? "bg-yellow-500 text-black" :
                                                                        "bg-slate-600 text-white"
                                                        }`}>{a.status}</span>
                                                </td>
                                                <td className="px-4 py-2">
                                                    {a.note && <div className="text-slate-300 text-sm mb-1">"{a.note}"</div>}
                                                    {a.confirm_note && <div className="text-blue-400 text-xs mt-1">Reason: "{a.confirm_note}"</div>}
                                                    {a.cancel_note && <div className="text-red-400 text-xs mt-1">Reason: "{a.cancel_note}"</div>}
                                                </td>
                                                <td className="px-4 py-2 flex gap-2">
                                                    {/* Details Button - Always visible */}
                                                    <button
                                                        className="bg-slate-600 hover:bg-slate-700 px-2 py-1 rounded text-xs"
                                                        title="Details"
                                                        onClick={() => { setSelectedAppointment(a); setIsDetailsOpen(true); }}
                                                    >
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

                                                    {/* Complete Button - Only for Booked or Rescheduled */}
                                                    {(a.status === "Booked" || a.status === "Rescheduled") && (
                                                        <button
                                                            className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs"
                                                            title="Complete"
                                                            onClick={() => { setCompletingAppointment(a); setIsCompleteOpen(true); }}
                                                        >
                                                            <svg
                                                                className="w-5 h-5 text-white"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M5 13l4 4L19 7"
                                                                />
                                                            </svg>
                                                        </button>
                                                    )}

                                                    {/* Cancel Button - Only for Booked or Rescheduled */}
                                                    {(a.status === "Booked" || a.status === "Rescheduled") && (
                                                        <button
                                                            className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
                                                            title="Cancel"
                                                            onClick={() => { setCancellingAppointment(a); setIsCancelModalOpen(true); }}
                                                        >
                                                            <svg
                                                                className="w-5 h-5 text-white"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M6 18L18 6M6 6l12 12"
                                                                />
                                                            </svg>
                                                        </button>
                                                    )}

                                                    {/* Reschedule Button - Only for Booked or Rescheduled */}
                                                    {(a.status === "Booked" || a.status === "Rescheduled") && (
                                                        <button
                                                            className="bg-amber-600 hover:bg-amber-700 px-2 py-1 rounded text-xs"
                                                            title="Reschedule"
                                                            onClick={() => {
                                                                setReschedulingAppointment(a);
                                                                setRescheduleData({
                                                                    appointment_datetime: '',
                                                                    note: a.note || ''
                                                                });
                                                                setIsRescheduleOpen(true);
                                                            }}
                                                        >
                                                            <svg
                                                                className="w-5 h-5 text-white"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    strokeWidth={2}
                                                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Appointment Details Modal */}
                <Modal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} title="Appointment Details" size="xl">
                    {selectedAppointment && (
                        <div className="space-y-6">
                            {/* Header Section with Status Badge */}
                            <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                                <div>
                                    <div className="text-sm text-slate-400 mb-1">Appointment ID</div>
                                    <div className="text-lg font-bold text-white font-mono">{selectedAppointment.id}</div>
                                </div>
                                <div className={`px-4 py-2 rounded-full font-semibold ${selectedAppointment.status === 'Booked' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                    selectedAppointment.status === 'Completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                        selectedAppointment.status === 'Rescheduled' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                                            selectedAppointment.status === 'Canceled' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                                'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                    }`}>
                                    {selectedAppointment.status}
                                </div>
                            </div>
                            {/* Customer and Dealer Info */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-white mb-3">Customer</h3>
                                    <div className="space-y-2">
                                        <div className="text-slate-300">
                                            <span className="text-slate-400 text-sm">Name:</span>
                                            <div className="text-white font-semibold">{selectedAppointment.customer_name}</div>
                                        </div>
                                        <div className="text-slate-300">
                                            <span className="text-slate-400 text-sm">Phone:</span>
                                            <div className="text-white font-semibold">{selectedAppointment.customer_phone}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-white mb-3">Dealer</h3>
                                    <div className="space-y-2">
                                        <div className="text-slate-300">
                                            <span className="text-slate-400 text-sm">Name:</span>
                                            <div className="text-white font-semibold">{selectedAppointment.dealer_name || 'N/A'}</div>
                                        </div>
                                        <div className="text-slate-300">
                                            <span className="text-slate-400 text-sm">Staff:</span>
                                            <div className="text-white font-semibold">{selectedAppointment.dealer_staff_name || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Date Info */}
                            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-white mb-3">Schedule</h3>
                                <div className="text-white font-semibold text-lg">{formatDateTime(selectedAppointment.appointment_datetime)}</div>
                            </div>
                            {/* Vehicle Info */}
                            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-white mb-3">Vehicle</h3>
                                <div className="text-xl font-bold text-white">{selectedAppointment.vehicle_model_name} {selectedAppointment.vehicle_version}</div>
                            </div>
                            {/* Notes */}
                            {selectedAppointment.note && (
                                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                                    <h3 className="font-semibold text-white mb-2">Notes</h3>
                                    <p className="text-slate-300">{selectedAppointment.note}</p>
                                </div>
                            )}
                        </div>
                    )}
                </Modal>

                {/* Complete Appointment Modal */}
                <Modal isOpen={isCompleteOpen} onClose={() => { setIsCompleteOpen(false); setCompletingAppointment(null); }} title="Complete Appointment" size="sm">
                    <div className="space-y-4">
                        <div className="text-lg font-semibold text-white">Mark Appointment as Completed?</div>
                        <div className="text-slate-400">This action will mark the appointment as completed and cannot be reverted.</div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded" onClick={() => { setIsCompleteOpen(false); setCompletingAppointment(null); }}>Cancel</button>
                            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold" onClick={handleCompleteAppointment}>Confirm</button>
                        </div>
                    </div>
                </Modal>

                {/* Cancel Appointment Modal */}
                <Modal isOpen={isCancelModalOpen} onClose={() => { setIsCancelModalOpen(false); setCancellingAppointment(null); }} title="Cancel Appointment" size="sm">
                    <div className="space-y-4">
                        <div className="text-lg font-semibold text-white">Do you want to cancel this test-drive appointment?</div>
                        <div className="text-slate-400">This action will cancel the appointment and cannot be reverted.</div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded" onClick={() => { setIsCancelModalOpen(false); setCancellingAppointment(null); }}>Cancel</button>
                            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold" onClick={handleCancelAppointment}>Confirm</button>
                        </div>
                    </div>
                </Modal>

                {/* Reschedule Appointment Modal */}
                <Modal isOpen={isRescheduleOpen} onClose={() => { setIsRescheduleOpen(false); setReschedulingAppointment(null); setRescheduleData({ appointment_datetime: '', note: '' }); setRescheduleErrors({}); }} title="Reschedule Appointment" size="md">
                    <form onSubmit={handleRescheduleAppointment}>
                        <div className="space-y-4">
                            <div className="text-slate-400">Change the appointment date and time for this test-drive.</div>
                            <InputField
                                id="reschedule_datetime"
                                name="appointment_datetime"
                                label="New Date & Time"
                                type="datetime-local"
                                value={rescheduleData.appointment_datetime}
                                onChange={(e) => {
                                    setRescheduleData(prev => ({ ...prev, appointment_datetime: e.target.value }));
                                    if (rescheduleErrors.appointment_datetime) {
                                        setRescheduleErrors(prev => ({ ...prev, appointment_datetime: '' }));
                                    }
                                }}
                                error={rescheduleErrors.appointment_datetime}
                                min={new Date().toISOString().slice(0, 16)}
                                max={(() => {
                                    const maxDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                                    return maxDate.toISOString().slice(0, 16);
                                })()}
                            />
                            <InputField
                                id="reschedule_note"
                                name="note"
                                label="Notes (optional)"
                                value={rescheduleData.note}
                                onChange={(e) => setRescheduleData(prev => ({ ...prev, note: e.target.value }))}
                                placeholder="Enter reason for rescheduling..."
                            />
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded"
                                    onClick={() => { setIsRescheduleOpen(false); setReschedulingAppointment(null); setRescheduleData({ appointment_datetime: '', note: '' }); setRescheduleErrors({}); }}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded font-semibold">
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </form>
                </Modal>

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

export default AppointmentsPage;
