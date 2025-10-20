import apiClient from "./apiClient";

/**
 * Inventory API Service
 * Handles inventory-related API calls for vehicle stock management
 */
export const inventoryApi = {
  /**
   * Add inventory for a vehicle (EVM Staff fulfills request)
   * This endpoint creates inventory items with auto-generated VIN numbers
   * @param {string} vehicleId - Vehicle UUID
   * @param {number} quantity - Number of vehicles to add to inventory
   * @returns {Promise} Response with created inventory items
   */
  addInventory: async (vehicleId, quantity) => {
    try {
      const requestBody = {
        vehicleId: vehicleId,
        quantity: quantity,
      };

      console.log("Adding inventory:", requestBody);
      const response = await apiClient.post(
        `/api/Vehicle/${vehicleId}/inventory`,
        requestBody
      );
      console.log("Inventory added successfully:", response.data);
      return response.data; // Returns { data: [...], resultStatus: 0, messages: [...], isSuccess: true }
    } catch (error) {
      console.error("Error adding inventory:", error);
      throw error;
    }
  },

  /**
   * Helper to fulfill multiple vehicle requests at once
   * @param {Array} requests - Array of vehicle requests to fulfill
   * @returns {Promise} Array of results
   */
  fulfillRequests: async (requests) => {
    try {
      const results = [];
      for (const request of requests) {
        const result = await inventoryApi.addInventory(
          request.vehicleId,
          request.quantity
        );
        results.push({
          requestId: request.id,
          vehicleId: request.vehicleId,
          result: result,
        });
      }
      return results;
    } catch (error) {
      console.error("Error fulfilling requests:", error);
      throw error;
    }
  },
};

export default inventoryApi;
