import axios from 'axios';
import DeliveryCompany from '../models/DeliveryCompany.js';

class DeliveryService {
  async sendOrderToDelivery(order, companyId) {
    try {
      const company = await DeliveryCompany.findById(companyId);
      if (!company) {
        throw new Error('Delivery company not found');
      }

      if (!company.isActive) {
        throw new Error('Delivery company is not active');
      }

      // Format order data based on company
      const formattedOrder = await this.formatOrderForCompany(order, company);

      // Send to delivery company API
      const response = await axios.post(company.apiUrl, formattedOrder, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return this.parseResponse(response.data, company.code);
    } catch (error) {
      console.error(`Delivery API Error (${companyId}):`, error);
      throw new Error(error.response?.data?.message || 'Failed to send order to delivery service');
    }
  }

  async formatOrderForCompany(order, company) {
    switch (company.code) {
      case 'THREE_MINDS':
        return {
          jsonrpc: "2.0",
          params: {
            login: company.credentials.login,
            password: company.credentials.password,
            db: company.credentials.database,
            orders_list: [{
              customer_address: order.shippingAddress.street,
              customer_mobile: order.customerInfo.mobile.replace(/\D/g, ''),
              customer_name: `${order.customerInfo.firstName} ${order.customerInfo.lastName}`,
              customer_area: order.shippingAddress.city,
              cost: order.totalAmount,
              order_type_id: "1",
              latitude: order.shippingAddress.latitude || "31.889883437603157",
              longitude: order.shippingAddress.longitude || "35.01046782913909"
            }]
          }
        };

      case 'ARAMEX':
        return {
          // Format for Aramex API
          shipments: [{
            reference: order.orderNumber,
            recipient: {
              name: `${order.customerInfo.firstName} ${order.customerInfo.lastName}`,
              phone: order.customerInfo.mobile,
              email: order.customerInfo.email,
              address: {
                line1: order.shippingAddress.street,
                city: order.shippingAddress.city,
                country: order.shippingAddress.country
              }
            },
            weight: 1, // Default weight
            cod_amount: order.totalAmount
          }]
        };

      default:
        throw new Error(`Unsupported delivery company: ${company.code}`);
    }
  }

  parseResponse(response, companyCode) {
    switch (companyCode) {
      case 'THREE_MINDS':
        return {
          success: !response.error,
          trackingNumber: response.result?.tracking_number,
          status: response.result?.status || 'pending',
          message: response.error?.message
        };

      case 'ARAMEX':
        return {
          success: response.success,
          trackingNumber: response.data?.tracking_number,
          status: response.data?.status || 'pending',
          message: response.error
        };

      default:
        return {
          success: false,
          message: 'Unknown delivery company response format'
        };
    }
  }

  async calculateDeliveryFee(order, companyId) {
    try {
      const company = await DeliveryCompany.findById(companyId);
      if (!company) {
        throw new Error('Delivery company not found');
      }

      switch (company.settings.priceCalculation) {
        case 'fixed':
          return company.settings.basePrice;

        case 'weight':
          // Calculate based on order weight
          const totalWeight = order.items.reduce((sum, item) => sum + (item.weight || 0), 0);
          return company.settings.basePrice * totalWeight;

        case 'distance':
          // Calculate based on delivery distance
          // This would require integration with a mapping service
          return company.settings.basePrice;

        default:
          return company.settings.basePrice;
      }
    } catch (error) {
      console.error('Error calculating delivery fee:', error);
      throw error;
    }
  }
}

export default new DeliveryService();