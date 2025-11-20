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
   * Search/filter inventory by VehicleModelName, DealerName, Status with pagination
   * @param {Object} options - Search and pagination options
   * @param {Object} options.filters - Filter parameters (all optional)
   * @param {string} options.filters.vehicleModelName - Vehicle model name to filter by
   * @param {string} options.filters.dealerName - Dealer name to filter by
   * @param {string} options.filters.status - Status to filter by
   * @param {number} options.pageNumber - Current page number (default: 1)
   * @param {number} options.pageSize - Items per page (default: 10)
   * @returns {Promise} Response with filtered inventory items and pagination info
   */
  search: async (options = {}) => {
    try {
      const filters = options.filters || {};
      const pageNumber = options.pageNumber || 1;
      const pageSize = options.pageSize || 10;

      const params = new URLSearchParams();

      if (filters.vehicleModelName) {
        params.append("VehicleModelName", filters.vehicleModelName);
      }
      if (filters.dealerName) {
        params.append("DealerName", filters.dealerName);
      }
      if (filters.status) {
        params.append("Status", filters.status);
      }

      params.append("PageNumber", pageNumber);
      params.append("PageSize", pageSize);

      const queryString = params.toString();
      const url = `/api/Inventory?${queryString}`;

      console.log(
        "Searching inventory with filters:",
        filters,
        "Page:",
        pageNumber
      );
      const response = await apiClient.get(url);

      // API returns array directly, wrap in standard format
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || [];

      // Extract pagination info from response headers (case-insensitive)
      let paginationHeader = response.headers["pagination"];

      // Try case-insensitive lookup if not found
      if (!paginationHeader) {
        for (const key in response.headers) {
          if (key.toLowerCase() === "pagination") {
            paginationHeader = response.headers[key];
            break;
          }
        }
      }

      let paginationInfo = {
        currentPage: pageNumber,
        pageSize: pageSize,
        totalCount: 0,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false,
      };

      if (paginationHeader) {
        try {
          const pagination =
            typeof paginationHeader === "string"
              ? JSON.parse(paginationHeader)
              : paginationHeader;
          paginationInfo = {
            currentPage: pagination.CurrentPage || pageNumber,
            pageSize: pagination.PageSize || pageSize,
            totalCount: pagination.TotalCount || 0,
            totalPages: pagination.TotalPages || 1,
            hasNext: pagination.HasNext || false,
            hasPrevious: pagination.HasPrevious || false,
          };
        } catch (e) {
          console.warn("Could not parse pagination header:", e);
        }
      } else {
        console.warn("Pagination header not found in response");
      }

      console.log(
        "Inventory search results:",
        data,
        "Pagination:",
        paginationInfo
      );
      return {
        isSuccess: true,
        data: data,
        pagination: paginationInfo,
        messages: [],
      };
    } catch (error) {
      console.error("Error searching inventory:", error);
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
