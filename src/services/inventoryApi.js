import apiClient from "./apiClient";

/**
 * Inventory API Service
 * Handles inventory-related API calls for vehicle stock management
 */
export const inventoryApi = {
  /**
   * Get all inventory items
   * @returns {Promise} Response with array of inventory items
   */
  getAll: async () => {
    try {
      const response = await apiClient.get("/api/Inventory");
      return response.data;
    } catch (error) {
      console.error("Error fetching inventory:", error);
      throw error;
    }
  },

  /**
   * Get available stock quantity for a specific vehicle
   * @param {string} vehicleId - Vehicle UUID
   * @returns {Promise} Response with available stock count
   */
  getAvailableStock: async (vehicleId) => {
    try {
      const response = await apiClient.get(
        `/api/Inventory/available-stock-quantity/${vehicleId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching available stock:", error);
      throw error;
    }
  },

  /**
   * Add inventory for a vehicle (EVM Staff adds manufacturer stock)
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
      return response.data;
    } catch (error) {
      console.error("Error adding inventory:", error);
      throw error;
    }
  },
};

export default inventoryApi;
