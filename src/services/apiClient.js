import axios from "axios";

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: "http://evmdealersystem.somee.com",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      } else if (status === 403) {
        // Forbidden
        console.error("Access forbidden:", data);
      } else if (status === 404) {
        // Not found
        console.error("Resource not found:", data);
      } else if (status >= 500) {
        // Server error
        console.error("Server error:", data);
      }
    } else if (error.request) {
      // Request made but no response
      console.error("Network error - no response received");
    } else {
      // Error in request setup
      console.error("Request error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
