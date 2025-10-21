import apiClient from "./apiClient";

/**
 * Vehicle Request API Service
 * Handles all vehicle request-related API calls for the dealer restock flow
 */
export const vehicleRequestApi = {
  /**
   * Get all vehicle requests
   * Note: Backend doesn't support filtering, so we'll filter client-side
   * @returns {Promise} Response with array of vehicle requests
   */
  getAll: async () => {
    try {
      const response = await apiClient.get("/api/VehicleRequest");
      return response.data; // Returns { data: [...], resultStatus: 0, messages: [...], isSuccess: true }
    } catch (error) {
      console.error("Error fetching vehicle requests:", error);
      throw error;
    }
  },

  /**
   * Create new vehicle request (Dealer Staff creates restock order)
   * @param {Object} requestData - Request data
   * @param {string} requestData.createdBy - User UUID who creates the request
   * @param {string} requestData.vehicleId - Vehicle UUID
   * @param {string} requestData.dealerId - Dealer UUID
   * @param {number} requestData.quantity - Quantity requested
   * @param {string} requestData.note - Optional note/reason for request
   * @returns {Promise} Response with created vehicle request
   */
  create: async (requestData) => {
    try {
      const requestBody = {
        createdBy: requestData.createdBy,
        vehicleId: requestData.vehicleId,
        dealerId: requestData.dealerId,
        quantity: requestData.quantity,
        note: requestData.note || "",
      };

      console.log("Creating vehicle request:", requestBody);
      const response = await apiClient.post("/api/VehicleRequest", requestBody);
      console.log("Vehicle request created successfully:", response.data);
      return response.data; // Returns { data: {...}, resultStatus: 0, messages: [...], isSuccess: true }
    } catch (error) {
      console.error("Error creating vehicle request:", error);
      throw error;
    }
  },

  /**
   * Approve vehicle request (EVM Staff approves)
   * @param {string} requestId - Request UUID
   * @param {string} evmStaffId - EVM Staff UUID who will handle the request
   * @returns {Promise} Response with approved request
   */
  approve: async (requestId, evmStaffId) => {
    try {
      console.log("Approving vehicle request:", { requestId, evmStaffId });
      const response = await apiClient.post(
        `/api/VehicleRequest/approve?id=${requestId}&evmStaffId=${evmStaffId}`
      );
      console.log("Vehicle request approved successfully:", response.data);
      return response.data; // Returns { data: {...}, resultStatus: 0, messages: [...], isSuccess: true }
    } catch (error) {
      console.error("Error approving vehicle request:", error);
      throw error;
    }
  },

  /**
   * Delete vehicle request (Dealer Manager deletes/rejects)
   * @param {string} requestId - Request UUID
   * @returns {Promise} Response confirming deletion
   */
  delete: async (requestId) => {
    try {
      console.log("Deleting vehicle request:", requestId);
      const response = await apiClient.delete(
        `/api/VehicleRequest/${requestId}`
      );
      console.log("Vehicle request deleted successfully:", response.data);
      return response.data; // Returns { data: {...}, resultStatus: 0, messages: [...], isSuccess: true }
    } catch (error) {
      console.error("Error deleting vehicle request:", error);
      throw error;
    }
  },

  /**
   * Client-side filter helpers (since backend doesn't support filtering)
   */
  filters: {
    /**
     * Filter requests by dealer ID
     */
    byDealer: (requests, dealerId) => {
      return requests.filter((req) => req.dealerId === dealerId);
    },

    /**
     * Filter requests by status
     */
    byStatus: (requests, status) => {
      return requests.filter((req) => req.status === status);
    },

    /**
     * Filter requests by creator
     */
    byCreator: (requests, createdBy) => {
      return requests.filter((req) => req.createdBy === createdBy);
    },

    /**
     * Get pending requests for Dealer Manager review
     */
    pendingForManager: (requests, dealerId) => {
      return requests.filter(
        (req) => req.dealerId === dealerId && req.status === "Processing"
      );
    },

    /**
     * Get approved requests for EVM Staff to process
     */
    approvedForEVM: (requests) => {
      return requests.filter((req) => req.status === "Processing");
    },
  },
};

export default vehicleRequestApi;
