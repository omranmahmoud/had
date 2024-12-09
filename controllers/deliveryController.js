import DeliveryService from '../services/deliveryService.js';
import DeliveryCompany from '../models/DeliveryCompany.js';

// Get all delivery companies
export const getDeliveryCompanies = async (req, res) => {
  try {
    const companies = await DeliveryCompany.find().select('-credentials');
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create delivery company
export const createDeliveryCompany = async (req, res) => {
  try {
    const company = new DeliveryCompany(req.body);
    await company.save();
    res.status(201).json(company);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update delivery company
export const updateDeliveryCompany = async (req, res) => {
  try {
    const company = await DeliveryCompany.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!company) {
      return res.status(404).json({ message: 'Delivery company not found' });
    }
    
    res.json(company);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete delivery company
export const deleteDeliveryCompany = async (req, res) => {
  try {
    const company = await DeliveryCompany.findByIdAndDelete(req.params.id);
    
    if (!company) {
      return res.status(404).json({ message: 'Delivery company not found' });
    }
    
    res.json({ message: 'Delivery company deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create delivery order
export const createDeliveryOrder = async (req, res) => {
  try {
    const { order, companyId } = req.body;
    
    if (!companyId) {
      return res.status(400).json({ message: 'Delivery company ID is required' });
    }

    // Validate required fields
    if (!order.shippingAddress?.street || !order.customerInfo?.mobile) {
      return res.status(400).json({ 
        message: 'Missing required order information' 
      });
    }

    // Validate mobile number
    const mobileNumber = order.customerInfo.mobile.replace(/\D/g, '');
    if (mobileNumber.length < 10) {
      return res.status(400).json({
        message: 'Invalid mobile number'
      });
    }

    // Send order to delivery service
    const deliveryResponse = await DeliveryService.sendOrderToDelivery(order, companyId);

    if (deliveryResponse.success) {
      res.json({
        message: 'Order sent to delivery service successfully',
        deliveryDetails: deliveryResponse,
        orderStatus: 'processing'
      });
    } else {
      throw new Error(deliveryResponse.message || 'Delivery service error');
    }
  } catch (error) {
    console.error('Delivery creation error:', error);
    res.status(error.response?.status || 500).json({ 
      message: 'Failed to create delivery order',
      error: error.message 
    });
  }
};

// Calculate delivery fee
export const calculateDeliveryFee = async (req, res) => {
  try {
    const { order, companyId } = req.body;
    const fee = await DeliveryService.calculateDeliveryFee(order, companyId);
    res.json({ fee });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get delivery status
export const getDeliveryStatus = async (req, res) => {
  try {
    const { orderId, companyId } = req.params;
    
    const company = await DeliveryCompany.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Delivery company not found' });
    }

    // Here you would implement the status check with the specific company's API
    // For now, return a mock status
    res.json({
      orderId,
      companyName: company.name,
      status: 'processing',
      lastUpdate: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};