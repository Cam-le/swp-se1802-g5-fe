import apiClient from "./apiClient";

/**
 * Dealer API Service
 * Handles all dealer-related API calls
 */
export const dealerApi = {
  /**
   * Get all dealers
   * @returns {Promise} Response with array of dealers
   */
  getAll: async () => {
    try {
      const response = await apiClient.get("/api/Dealer");
      return response.data; // Returns { data: [...], resultStatus: 0, messages: [...], isSuccess: true }
    } catch (error) {
      console.error("Error fetching dealers:", error);
      throw error;
    }
  },

  /**
   * Get dealer by ID
   * @param {string} id - Dealer UUID
   * @returns {Promise} Response with dealer data
   */
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/api/Dealer/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching dealer:", error);
      throw error;
    }
  },

  /**
   * Create new dealer
   * @param {Object} dealerData - Dealer data
   * @param {string} dealerData.name - Dealer name
   * @param {string} dealerData.address - Dealer address
   * @param {string} dealerData.phone - Dealer phone
   * @param {string} dealerData.email - Dealer email
   * @param {string} dealerData.contractNumber - Contract number
   * @param {number} dealerData.salesTarget - Sales target
   * @param {boolean} dealerData.isActive - Active status
   * @returns {Promise} Response with created dealer
   */
  create: async (dealerData) => {
    try {
      const requestBody = {
        name: dealerData.name,
        address: dealerData.address,
        phone: dealerData.phone,
        email: dealerData.email,
        contractNumber: dealerData.contractNumber,
        salesTarget: dealerData.salesTarget,
        isActive: dealerData.isActive,
      };

      console.log("Creating dealer:", requestBody);
      const response = await apiClient.post("/api/Dealer", requestBody);
      console.log("Dealer created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating dealer:", error);
      throw error;
    }
  },

  /**
   * Update existing dealer
   * @param {string} id - Dealer UUID
   * @param {Object} dealerData - Updated dealer data
   * @returns {Promise} Response with updated dealer
   */
  update: async (id, dealerData) => {
    try {
      const requestBody = {
        name: dealerData.name,
        address: dealerData.address,
        phone: dealerData.phone,
        email: dealerData.email,
        contractNumber: dealerData.contractNumber,
        salesTarget: dealerData.salesTarget,
        isActive: dealerData.isActive,
      };

      console.log("Updating dealer:", id, requestBody);
      const response = await apiClient.put(`/api/Dealer/${id}`, requestBody);
      console.log("Dealer updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating dealer:", error);
      throw error;
    }
  },

  /**
   * Delete dealer
   * @param {string} id - Dealer UUID
   * @returns {Promise} Response confirming deletion
   */
  delete: async (id) => {
    try {
      console.log("Deleting dealer:", id);
      const response = await apiClient.delete(`/api/Dealer/${id}`);
      console.log("Dealer deleted successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error deleting dealer:", error);
      throw error;
    }
  },
};

export default dealerApi;
