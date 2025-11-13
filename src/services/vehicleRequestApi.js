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

      // API returns array directly, not wrapped in { data, isSuccess }
      const data = response.data;

      // If it's already an array, wrap it in standard format
      if (Array.isArray(data)) {
        return {
          data: data,
          isSuccess: true,
          messages: [],
          resultStatus: 0,
        };
      }

      // Otherwise return as-is (in case API changes to standard format)
      return data;
    } catch (error) {
      console.error("Error fetching vehicle requests:", error);
      throw error;
    }
  },

  /**
   * Create new vehicle request (Dealer Staff creates restock order)
   * Supports requesting multiple vehicles at once
   * @param {Object} requestData - Request data
   * @param {string} requestData.createdBy - User UUID who creates the request
   * @param {string} requestData.dealerId - Dealer UUID
   * @param {string} requestData.note - Optional note/reason for request
   * @param {Array} requestData.items - Array of items [{vehicleId: string, quantity: number}]
   * @returns {Promise} Response with created vehicle request
   */
  create: async (requestData) => {
    try {
      const requestBody = {
        createdBy: requestData.createdBy,
        dealerId: requestData.dealerId,
        note: requestData.note || "",
        items: requestData.items || [],
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
   * Approve vehicle request by Dealer Manager
   * @param {string} requestId - Request UUID
   * @param {string} managerId - Dealer Manager UUID who approves the request
   * @returns {Promise} Response with approved request
   */
  approveByManager: async (requestId, managerId) => {
    try {
      console.log("Manager approving vehicle request:", {
        requestId,
        managerId,
      });
      const response = await apiClient.post(
        `/api/VehicleRequest/${requestId}/approve-manager?managerId=${managerId}`
      );
      console.log(
        "Vehicle request approved by manager successfully:",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error("Error approving vehicle request by manager:", error);
      throw error;
    }
  },

  /**
   * Reject vehicle request by Dealer Manager
   * @param {string} requestId - Request UUID
   * @param {string} managerId - Dealer Manager UUID who rejects the request
   * @param {string} reason - Rejection reason
   * @returns {Promise} Response with rejected request
   */
  rejectByManager: async (requestId, managerId, reason) => {
    try {
      console.log("Manager rejecting vehicle request:", {
        requestId,
        managerId,
        reason,
      });
      const response = await apiClient.post(
        `/api/VehicleRequest/${requestId}/reject-manager?managerId=${managerId}`,
        { reason }
      );
      console.log(
        "Vehicle request rejected by manager successfully:",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error("Error rejecting vehicle request by manager:", error);
      throw error;
    }
  },

  /**
   * Approve vehicle request by EVM Staff
   * @param {string} requestId - Request UUID
   * @param {string} evmStaffId - EVM Staff UUID who approves the request
   * @param {string} expectedDeliveryDate - Expected delivery date (ISO 8601 format)
   * @returns {Promise} Response with approved request
   */
  approveByEVM: async (requestId, evmStaffId, expectedDeliveryDate) => {
    try {
      console.log("EVM Staff approving vehicle request:", {
        requestId,
        evmStaffId,
        expectedDeliveryDate,
      });
      const response = await apiClient.post(
        `/api/VehicleRequest/${requestId}/approve-evm?evmStaffId=${evmStaffId}`,
        { expectedDeliveryDate }
      );
      console.log(
        "Vehicle request approved by EVM Staff successfully:",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error("Error approving vehicle request by EVM Staff:", error);
      throw error;
    }
  },

  /**
   * Reject vehicle request by EVM Staff
   * @param {string} requestId - Request UUID
   * @param {string} evmStaffId - EVM Staff UUID who rejects the request
   * @param {string} reason - Rejection reason
   * @returns {Promise} Response with rejected request
   */
  rejectByEVM: async (requestId, evmStaffId, reason) => {
    try {
      console.log("EVM Staff rejecting vehicle request:", {
        requestId,
        evmStaffId,
        reason,
      });
      const response = await apiClient.post(
        `/api/VehicleRequest/${requestId}/reject-evm?evmStaffId=${evmStaffId}`,
        { reason }
      );
      console.log(
        "Vehicle request rejected by EVM Staff successfully:",
        response.data
      );
      return response.data;
    } catch (error) {
      console.error("Error rejecting vehicle request by EVM Staff:", error);
      throw error;
    }
  },

  /**
   * Confirm receipt of shipped vehicles (Dealer Manager)
   * @param {string} requestId - Request UUID
   * @param {string} dealerId - Dealer UUID
   * @returns {Promise} Response with confirmed request
   */
  confirmReceipt: async (requestId, dealerId) => {
    try {
      console.log("Confirming receipt of vehicle request:", {
        requestId,
        dealerId,
      });
      const response = await apiClient.put(
        `/api/VehicleRequest/${requestId}/confirm-receipt?dealerId=${dealerId}`
      );
      console.log("Receipt confirmed successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error confirming receipt:", error);
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
        (req) =>
          req.dealerId === dealerId && req.status === "Pending Manager Approval"
      );
    },

    /**
     * Get approved requests for EVM Staff to process
     */
    processingForEVM: (requests) => {
      return requests.filter((req) => req.status === "Pending EVM Allocation");
    },
  },
};

export default vehicleRequestApi;
