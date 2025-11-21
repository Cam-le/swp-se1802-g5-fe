import apiClient from "./apiClient";

/**
 * Dashboard API Service
 * Handles all dashboard-related API calls for analytics and reporting
 */
export const dashboardApi = {
  /**
   * Get monthly profit data for a specific user/dealer
   * @param {string} userId - User UUID
   * @returns {Promise} Response with monthly profit data (revenue, cost, profit)
   */
  getMonthlyProfit: async (userId) => {
    try {
      const response = await apiClient.get(
        `/api/Dashboard/monthly-profit?userId=${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching monthly profit:", error);
      throw error;
    }
  },

  /**
   * Get monthly vehicle allocation data (EVM Staff)
   * @returns {Promise} Response with monthly allocation counts
   */
  getEVMMonthlyAllocation: async () => {
    try {
      const response = await apiClient.get(
        "/api/Dashboard/evm/monthly-allocation"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching EVM monthly allocation:", error);
      throw error;
    }
  },

  /**
   * Get system-wide monthly profit data (Admin)
   * @returns {Promise} Response with monthly profit data across all dealers
   */
  getAdminMonthlyProfit: async () => {
    try {
      const response = await apiClient.get(
        "/api/Dashboard/admin/monthly-profit"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching admin monthly profit:", error);
      throw error;
    }
  },
};

export default dashboardApi;
