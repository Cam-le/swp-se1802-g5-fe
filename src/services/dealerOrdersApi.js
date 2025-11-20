import apiClient from "./apiClient";

const dealerOrdersApi = {
  // Get all orders for a dealer
  getAll: async (dealerId) => {
    try {
      const response = await apiClient.get(
        `/api/dealer/orders?dealerId=${dealerId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching dealer orders:", error);
      throw error;
    }
  },

  // Create a new order
  create: async (orderData) => {
    try {
      const response = await apiClient.post(
        `/api/dealer/orders?dealerStaffId=${orderData.dealerStaffId}`,
        {
          vehicleId: orderData.vehicleId,
          dealerId: orderData.dealerId,
          newCustomer: {
            fullName: orderData.customerName,
            phone: orderData.customerPhone,
            email: orderData.customerEmail || "",
            address: orderData.customerAddress,
          },
          paymentType: orderData.paymentType,
          totalPrice: orderData.totalPrice,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating dealer order:", error);
      throw error;
    }
  },

  // Get order by ID
  getById: async (orderId) => {
    try {
      const response = await apiClient.get(`/api/dealer/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching dealer order by ID:", error);
      throw error;
    }
  },
};

export default dealerOrdersApi;
