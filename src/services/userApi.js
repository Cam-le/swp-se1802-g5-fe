import apiClient from "./apiClient";

/**
 * User API Service
 * Handles all user-related API calls
 */
export const userApi = {
  /**
   * Get all users
   * @returns {Promise} Response with array of users
   */
  getAll: async () => {
    try {
      const response = await apiClient.get("/api/User");
      return response.data; // Returns { data: [...], resultStatus: 0, messages: [...], isSuccess: true }
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  /**
   * Get user by ID
   * @param {string} id - User UUID
   * @returns {Promise} Response with user data
   */
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/api/User/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  /**
   * Get users by dealer ID (client-side filtering)
   * @param {string} dealerId - Dealer UUID
   * @returns {Promise} Response with filtered users
   */
  getByDealerId: async (dealerId) => {
    try {
      const response = await userApi.getAll();
      if (response.isSuccess) {
        const filteredUsers = response.data.filter(
          (user) => user.dealerId === dealerId
        );
        return {
          ...response,
          data: filteredUsers,
        };
      }
      return response;
    } catch (error) {
      console.error("Error fetching users by dealer:", error);
      throw error;
    }
  },

  /**
   * Create new user (Admin only)
   * @param {Object} userData - User data
   * @param {string} userData.email - User email
   * @param {string} userData.fullName - User full name
   * @param {string} userData.password - User password
   * @param {string} userData.phone - User phone number (optional)
   * @param {string} userData.roleName - Role name (e.g., "Dealer Staff", "EVM Staff", etc.)
   * @param {string} userData.dealerId - Dealer UUID (optional, required for dealer roles)
   * @param {boolean} userData.isActive - Account active status
   * @returns {Promise} Response with created user
   */
  create: async (userData) => {
    try {
      const requestBody = {
        email: userData.email,
        fullName: userData.fullName,
        password: userData.password,
        phone: userData.phone || "",
        roleName: userData.roleName,
        dealerId: userData.dealerId || null,
        isActive: userData.isActive !== undefined ? userData.isActive : true,
      };

      console.log("Creating user:", { ...requestBody, password: "****" });
      const response = await apiClient.post(
        "/api/User/admin/Create-user",
        requestBody
      );
      console.log("User created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  /**
   * Update existing user
   * @param {string} id - User UUID
   * @param {Object} userData - Updated user data
   * @param {number} userData.roleId - Role ID
   * @param {string} userData.dealerId - Dealer UUID (optional)
   * @param {boolean} userData.isActive - Account active status
   * @returns {Promise} Response with updated user
   */
  update: async (id, userData) => {
    try {
      const requestBody = {
        roleId: userData.roleId,
        dealerId: userData.dealerId || null,
        isActive: userData.isActive,
      };

      console.log("Updating user:", id, requestBody);
      const response = await apiClient.put(`/api/User/${id}`, requestBody);
      console.log("User updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  /**
   * Delete user
   * @param {string} id - User UUID
   * @returns {Promise} Response confirming deletion
   */
  delete: async (id) => {
    try {
      console.log("Deleting user:", id);
      const response = await apiClient.delete(`/api/User/${id}`);
      console.log("User deleted successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },
};

export default userApi;
