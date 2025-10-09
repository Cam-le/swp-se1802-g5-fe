import apiClient from "./apiClient";

/**
 * Vehicle API Service
 * Handles all vehicle-related API calls
 */
export const vehicleApi = {
  /**
   * Get all vehicles
   * @returns {Promise} Response with array of vehicles
   */
  getAll: async () => {
    try {
      const response = await apiClient.get("/api/Vehicle");
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
   * Create new vehicle
   * @param {Object} vehicleData - Vehicle data (without evmId and status - backend handles these)
   * @returns {Promise} Response with created vehicle
   */
  create: async (vehicleData) => {
    try {
      // Prepare request body - exclude evmId and status as backend handles them
      const requestBody = {
        modelName: vehicleData.modelName,
        version: vehicleData.version,
        category: vehicleData.category,
        color: vehicleData.color,
        imageUrl: vehicleData.imageUrl,
        description: vehicleData.description,
        batteryCapacity: vehicleData.batteryCapacity,
        rangePerCharge: vehicleData.rangePerCharge,
        basePrice: vehicleData.basePrice,
        launchDate: vehicleData.launchDate,
      };

      const response = await apiClient.post("/api/Vehicle", requestBody);
      return response.data; // Returns { data: {...}, resultStatus: 0, messages: [...], isSuccess: true }
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update existing vehicle
   * @param {string} id - Vehicle UUID
   * @param {Object} vehicleData - Updated vehicle data
   * @returns {Promise} Response with updated vehicle
   */
  update: async (id, vehicleData) => {
    try {
      // Prepare request body - exclude evmId and status as backend handles them
      const requestBody = {
        modelName: vehicleData.modelName,
        version: vehicleData.version,
        category: vehicleData.category,
        color: vehicleData.color,
        imageUrl: vehicleData.imageUrl,
        description: vehicleData.description,
        batteryCapacity: vehicleData.batteryCapacity,
        rangePerCharge: vehicleData.rangePerCharge,
        basePrice: vehicleData.basePrice,
        launchDate: vehicleData.launchDate,
      };

      const response = await apiClient.put(`/api/Vehicle/${id}`, requestBody);
      return response.data; // Returns { data: {...}, resultStatus: 0, messages: [...], isSuccess: true }
    } catch (error) {
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
};

export default vehicleApi;
