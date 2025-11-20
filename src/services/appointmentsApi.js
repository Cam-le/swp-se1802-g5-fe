

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
     * @returns {Promise} Response with created appointment
     */
    create: async (appointmentData) => {
        try {
            const response = await apiClient.post("/api/Appointment", appointmentData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};
