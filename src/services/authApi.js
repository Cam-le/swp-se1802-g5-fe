import apiClient from "./apiClient";

/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */
export const authApi = {
  /**
   * Get user details by ID
   * @param {string} userId - User UUID
   * @returns {Promise} Response with detailed user data including dealerId
   */
  getUserDetails: async (userId) => {
    try {
      console.log("📋 Fetching user details for:", userId);
      const response = await apiClient.get(`/api/User/${userId}`);
      console.log("✅ User details fetched:", {
        dealerId: response.data?.data?.dealerId,
        fullName: response.data?.data?.fullName,
      });
      return response.data;
    } catch (error) {
      console.error("❌ Error fetching user details:", error);
      throw error;
    }
  },

  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise} Response with user data and token
   */
  login: async (email, password) => {
    try {
      console.log("🔐 Attempting login for:", email);

      const requestBody = {
        email: email.trim(),
        password: password.trim(),
      };

      console.log("📤 Request body:", {
        email: requestBody.email,
        password: "****",
      });

      const response = await apiClient.post("/api/User/login", requestBody);

      console.log("📥 Login response:", {
        isSuccess: response.data?.isSuccess,
        hasToken: !!response.data?.data?.token,
        messages: response.data?.messages,
      });

      // API returns: { data: { userId, username, email, roleid, roleName, token, tokenExpires }, resultStatus, messages, isSuccess }
      return response.data;
    } catch (error) {
      console.error("❌ Login error details:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });

      // Handle specific error cases
      if (error.response?.status === 404) {
        throw new Error("Invalid email or password");
      }

      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.messages?.[0] || "Bad request";
        throw new Error(errorMsg);
      }

      if (error.code === "ECONNABORTED") {
        throw new Error("Request timeout - server took too long to respond");
      }

      if (error.code === "ERR_NETWORK") {
        throw new Error(
          "Network error - check your internet connection or CORS settings"
        );
      }

      throw error;
    }
  },

  /**
   * Logout user (placeholder for future implementation)
   */
  logout: async () => {
    // TODO: Implement logout API call if backend provides one
    // For now, just clear local storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("tokenExpires");
  },

  /**
   * Verify token (placeholder for future implementation)
   */
  verifyToken: async () => {
    try {
      // TODO: Implement token verification endpoint when available
      const response = await apiClient.get("/api/User/verify");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default authApi;
