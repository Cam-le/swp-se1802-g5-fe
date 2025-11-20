

import apiClient from "./apiClient";

/**
 * Appointments API Service
 * Handles all appointment-related API calls
 */
export const appointmentsApi = {
    /**
     * Get all appointments
     * @returns {Promise} Response with array of appointments
     */
    getAll: async () => {
        try {
            const response = await apiClient.get("/api/Appointment");
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    /**
     * Create new appointment
     * @param {Object} appointmentData - Appointment data
     * @param {string} dealerStaffId - Dealer staff ID (sent as query param)
     * @returns {Promise} Response with created appointment
     */
    create: async (appointmentData, dealerStaffId) => {
        try {
            const url = dealerStaffId
                ? `/api/Appointment?dealerStaffId=${encodeURIComponent(dealerStaffId)}`
                : "/api/Appointment";
            const response = await apiClient.post(url, appointmentData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};
