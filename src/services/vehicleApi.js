import apiClient from "./apiClient";

/**
 * Vehicle API Service
 * Handles all vehicle-related API calls
 */
export const vehicleApi = {
  /**
   * Get all vehicles
   * @param {string} userId - User UUID (required)
   * @returns {Promise} Response with array of vehicles including stock information
   */
  getAll: async (userId) => {
    try {
      if (!userId) {
        throw new Error("userId is required to fetch vehicles");
      }
      const response = await apiClient.get(`/api/Vehicle?userId=${userId}`);
      return response.data; // Returns { data: [...], resultStatus: 0, messages: [...], isSuccess: true }
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get vehicle by ID
   * @param {string} id - Vehicle UUID
   * @returns {Promise} Response with vehicle data
   */
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/api/Vehicle/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new vehicle with FormData (supports file upload)
   * @param {FormData} formData - FormData object with vehicle data and image file
   * @returns {Promise} Response with created vehicle
   */
  createWithFormData: async (formData) => {
    try {
      const response = await apiClient.post("/api/Vehicle", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update existing vehicle (JSON based - used for edit)
   * @param {string} id - Vehicle UUID
   * @param {Object} vehicleData - Updated vehicle data
   * @returns {Promise} Response with updated vehicle
   */
  update: async (id, vehicleData) => {
    try {
      console.log("Updating vehicle:", id, vehicleData);
      const response = await apiClient.put(`/api/Vehicle/${id}`, vehicleData);
      console.log("Vehicle updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating vehicle:", error);
      throw error;
    }
  },

  /**
   * Delete vehicle
   * @param {string} id - Vehicle UUID
   * @returns {Promise} Response confirming deletion
   */
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/api/Vehicle/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Set dealer selling price for a vehicle (Dealer Manager only)
   * @param {string} userId - User UUID (Dealer Manager)
   * @param {Object} priceData - Price data
   * @param {string} priceData.vehicleId - Vehicle UUID
   * @param {number} priceData.sellingPrice - New selling price
   * @returns {Promise} Response confirming price update
   */
  setDealerPrice: async (userId, priceData) => {
    try {
      const requestBody = {
        vehicleId: priceData.vehicleId,
        sellingPrice: priceData.sellingPrice,
      };

      console.log("Setting dealer price:", requestBody);
      const response = await apiClient.post(
        `/api/Vehicle/set-dealer-price?userId=${userId}`,
        requestBody
      );
      console.log("Dealer price set successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error setting dealer price:", error);
      throw error;
    }
  },
};

export default vehicleApi;
