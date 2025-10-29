import { useState, useEffect } from "react";
import { DashboardLayout } from "../../layout";
import { Card, Modal, InputField, Select, Alert } from "../../common";
import VehicleSelectRich from "../../common/VehicleSelectRich";
import { useAuth } from "../../../hooks/useAuth";
import { MOCK_APPOINTMENTS } from "../../../data/mockData";
import { formatDateTime } from "../../../utils/helpers";
import { customerApi } from "../../../services/mockApi";
import { vehicleApi } from "../../../services/vehicleApi";


function AppointmentsPage() {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);
    const [formData, setFormData] = useState({ customer_id: '', vehicle_id: '', appointment_datetime: '', note: '' });
    const [formErrors, setFormErrors] = useState({});
    const [alert, setAlert] = useState({ type: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Fetch customers and vehicles for selection
        async function fetchData() {
            try {
                const [custs, vehs] = await Promise.all([
                    customerApi.getAll(user?.id),
                    vehicleApi.getAll(user?.id)
                ]);
                setCustomers(Array.isArray(custs) ? custs : []);
                let vList = Array.isArray(vehs) ? vehs : (vehs?.data || []);
                setVehicles(vList.filter(v => v.status === 'Available' && (v.currentStock || v.stock || 0) > 0));
            } catch (err) {
                setAlert({ type: 'error', message: 'Failed to load customers or vehicles' });
            }
        }
        if (isModalOpen) fetchData();
    }, [isModalOpen, user?.id]);

    const openModal = () => {
        setFormData({ customer_id: '', vehicle_id: '', appointment_datetime: '', note: '' });
        setFormErrors({});
        setAlert({ type: '', message: '' });
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

    const validateForm = () => {
        const errors = {};
        if (!formData.customer_id) errors.customer_id = 'Customer is required';
        if (!formData.vehicle_id) errors.vehicle_id = 'Vehicle is required';
        if (!formData.appointment_datetime) errors.appointment_datetime = 'Date & Time is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            setAlert({ type: 'error', message: 'Please fix the errors below' });
            return;
        }
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            const newAppointment = {
                id: 'A' + (appointments.length + 1),
                customer_id: formData.customer_id,
                vehicle_id: formData.vehicle_id,
                staff_id: user?.id,
                appointment_datetime: formData.appointment_datetime,
                note: formData.note,
                status: 'scheduled',
            };
            setAppointments((prev) => [newAppointment, ...prev]);
            setAlert({ type: 'success', message: 'Appointment added successfully' });
            setTimeout(() => closeModal(), 800);
        }, 800);
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
                {/* Appointments Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {appointments.map((a) => (
                        <Card key={a.id} hover>
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <div className="text-slate-400 text-sm">Appointment ID</div>
                                    <div className="text-white font-medium">{a.id}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-slate-400 text-sm">Date & Time</div>
                                    <div className="text-white font-semibold">{formatDateTime(a.appointment_datetime)}</div>
                                </div>
                            </div>
                            <div className="text-slate-300 text-sm mb-2">Customer: <span className="text-white">{a.customer_id}</span></div>
                            <div className="text-slate-300 text-sm mb-2">Vehicle: <span className="text-white">{a.vehicle_id}</span></div>
                            <div className="text-slate-300 text-sm mb-2">Staff: <span className="text-white">{a.staff_id}</span></div>
                            <div className="text-slate-400 text-sm mt-2">Status: <span className="text-white capitalize">{a.status}</span></div>
                        </Card>
                    ))}
                </div>

                {/* Add Appointment Modal */}
                <Modal isOpen={isModalOpen} onClose={closeModal} title="Add Appointment" size="md">
                    <form onSubmit={handleSubmit}>
                        {alert.message && <Alert type={alert.type} message={alert.message} />}
                        <div className="grid grid-cols-1 gap-4">
                            <Select
                                id="customer_id"
                                name="customer_id"
                                label="Customer"
                                value={formData.customer_id}
                                onChange={handleInputChange}
                                options={customers.map((c) => ({ value: c.id, label: c.full_name }))}
                                error={formErrors.customer_id}
                                placeholder="Select customer"
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
