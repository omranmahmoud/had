import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { SUPPORTED_CURRENCIES } from '../utils/currency.js';

// Create order
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, customerInfo, currency = 'USD' } = req.body;

    // Validate required fields
    if (!items?.length) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    if (!customerInfo?.email || !customerInfo?.mobile) {
      return res.status(400).json({ message: 'Customer email and mobile number are required' });
    }

    if (!shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.zipCode) {
      return res.status(400).json({ message: 'Complete shipping address is required' });
    }

    // Validate currency
    if (!SUPPORTED_CURRENCIES[currency]) {
      return res.status(400).json({ message: 'Invalid currency' });
    }

    // Calculate total and validate stock
    let totalAmount = 0;
    const orderItems = [];
    const exchangeRate = SUPPORTED_CURRENCIES[currency].exchangeRate;

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      // Convert price to order currency
      const priceInOrderCurrency = product.price * exchangeRate;
      totalAmount += priceInOrderCurrency * item.quantity;
      
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: priceInOrderCurrency,
        name: product.name,
        image: product.images[0]
      });

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Create order with auto-generated order number
    const order = new Order({
      items: orderItems,
      totalAmount,
      currency,
      exchangeRate,
      shippingAddress,
      paymentMethod,
      customerInfo: {
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        email: customerInfo.email,
        mobile: customerInfo.mobile
      },
      status: 'pending',
      orderNumber: `ORD${Date.now()}`,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed'
    });

    const savedOrder = await order.save();

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        _id: savedOrder._id,
        orderNumber: savedOrder.orderNumber,
        totalAmount: savedOrder.totalAmount,
        currency: savedOrder.currency,
        status: savedOrder.status
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      message: 'Failed to create order',
      error: error.message 
    });
  }
};

// Get user orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.product')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// Get all orders (admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.product')
      .sort('-createdAt');
    res.json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};