import apiClient from "./apiClient";

/**
 * Promotion API Service
 * Handles all promotion-related API calls
 */
export const promotionApi = {
  /**
   * Get all promotions
   * @returns {Promise} Response with array of promotions
   */
  getAll: async () => {
    try {
      const response = await apiClient.get("/api/Promotion");
      return response.data;
    } catch (error) {
      console.error("Error fetching promotions:", error);
      throw error;
    }
  },

  /**
   * Get promotions by dealer ID
   * @param {string} dealerId - Dealer UUID
   * @returns {Promise} Response with array of dealer promotions
   */
  getByDealerId: async (dealerId) => {
    try {
      const response = await apiClient.get(`/api/Promotion/dealer/${dealerId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching dealer promotions:", error);
      throw error;
    }
  },

  /**
   * Get promotion by ID
   * @param {string} id - Promotion UUID
   * @returns {Promise} Response with promotion data
   */
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/api/Promotion/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching promotion:", error);
      throw error;
    }
  },

  /**
   * Create new promotion
   * @param {Object} promotionData - Promotion data
   * @param {string} promotionData.createdBy - User UUID who creates the promotion
   * @param {string} promotionData.name - Promotion name
   * @param {string} promotionData.description - Promotion description
   * @param {number} promotionData.discountPercent - Discount percentage
   * @param {string} promotionData.startDate - Start date (ISO string)
   * @param {string} promotionData.endDate - End date (ISO string)
   * @param {boolean} promotionData.isActive - Active status
   * @param {string} promotionData.note - Optional note
   * @returns {Promise} Response with created promotion
   */
  create: async (promotionData) => {
    try {
      const requestBody = {
        createdBy: promotionData.createdBy,
        name: promotionData.name,
        description: promotionData.description,
        discountPercent: promotionData.discountPercent,
        startDate: promotionData.startDate,
        endDate: promotionData.endDate,
        isActive: promotionData.isActive,
        note: promotionData.note || null,
      };

      console.log("Creating promotion:", requestBody);
      const response = await apiClient.post("/api/Promotion", requestBody);
      console.log("Promotion created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating promotion:", error);
      throw error;
    }
  },

  /**
   * Update existing promotion
   * @param {string} id - Promotion UUID
   * @param {Object} promotionData - Updated promotion data
   * @param {string} promotionData.name - Promotion name
   * @param {string} promotionData.description - Promotion description
   * @param {number} promotionData.discountPercent - Discount percentage
   * @param {string} promotionData.startDate - Start date (ISO string)
   * @param {string} promotionData.endDate - End date (ISO string)
   * @param {boolean} promotionData.isActive - Active status
   * @param {string} promotionData.note - Optional note
   * @returns {Promise} Response with updated promotion
   */
  update: async (id, promotionData) => {
    try {
      const requestBody = {
        name: promotionData.name,
        description: promotionData.description,
        discountPercent: promotionData.discountPercent,
        startDate: promotionData.startDate,
        endDate: promotionData.endDate,
        isActive: promotionData.isActive,
        note: promotionData.note || null,
      };

      console.log("Updating promotion:", id, requestBody);
      const response = await apiClient.put(`/api/Promotion/${id}`, requestBody);
      console.log("Promotion updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating promotion:", error);
      throw error;
    }
  },

  /**
   * Delete promotion
   * @param {string} id - Promotion UUID
   * @returns {Promise} Response confirming deletion
   */
  delete: async (id) => {
    try {
      console.log("Deleting promotion:", id);
      const response = await apiClient.delete(`/api/Promotion/${id}`);
      console.log("Promotion deleted successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error deleting promotion:", error);
      throw error;
    }
  },

  /**
   * Apply promotion to vehicle
   * @param {string} promotionId - Promotion UUID
   * @param {string} vehicleId - Vehicle UUID
   * @returns {Promise} Response confirming promotion applied
   */
  applyToVehicle: async (promotionId, vehicleId) => {
    try {
      console.log("Applying promotion to vehicle:", { promotionId, vehicleId });
      const response = await apiClient.post(
        `/api/Promotion/${promotionId}/vehicle/${vehicleId}`
      );
      console.log("Promotion applied successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error applying promotion:", error);
      throw error;
    }
  },

  /**
   * Remove promotion from vehicle
   * @param {string} promotionId - Promotion UUID
   * @param {string} vehicleId - Vehicle UUID
   * @returns {Promise} Response confirming promotion removed
   */
  removeFromVehicle: async (promotionId, vehicleId) => {
    try {
      console.log("Removing promotion from vehicle:", {
        promotionId,
        vehicleId,
      });
      const response = await apiClient.delete(
        `/api/Promotion/${promotionId}/vehicle/${vehicleId}`
      );
      console.log("Promotion removed successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error removing promotion:", error);
      throw error;
    }
  },

  /**
   * Get active promotions for a vehicle
   * @param {string} vehicleId - Vehicle UUID
   * @param {string} userId - User UUID
   * @returns {Promise} Response with array of active promotions for the vehicle
   */
  getActiveByVehicle: async (vehicleId, userId) => {
    try {
      const response = await apiClient.get(
        `/api/Promotion/active-by-vehicle?vehicleId=${vehicleId}&userId=${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching active promotions for vehicle:", error);
      throw error;
    }
  },
};

export default promotionApi;
