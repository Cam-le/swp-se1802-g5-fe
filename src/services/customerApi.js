// src/services/customerApi.js
import apiClient from "./apiClient";

/**
 * Customer API Service
 * Handles all customer-related API calls
 */
export const customerApi = {
    /**
     * Get all customers
     * @returns {Promise} Response with array of customers
     */
    getAll: async () => {
        try {
            const response = await apiClient.get("/api/Customer");
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get customer by ID
     * @param {string} id - Customer UUID
     * @returns {Promise} Response with customer data
     */
    getById: async (id) => {
        try {
            const response = await apiClient.get(`/api/Customer/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Create new customer
     * @param {Object} customerData - Customer data
     * @returns {Promise} Response with created customer
     */
    create: async (customerData) => {
        try {
            const response = await apiClient.post("/api/Customer", customerData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update customer
     * @param {string} id - Customer UUID
     * @param {Object} customerData - Updated customer data
     * @returns {Promise} Response with updated customer
     */
    update: async (id, customerData) => {
        try {
            const response = await apiClient.put(`/api/Customer/${id}`, customerData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Delete customer
     * @param {string} id - Customer UUID
     * @returns {Promise} Response from delete operation
     */
    delete: async (id) => {
        try {
            const response = await apiClient.delete(`/api/Customer/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};
