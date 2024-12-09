import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    name: String,
    image: String
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    enum: ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR', 'JOD', 'LBP', 'EGP', 'IQD', 'ILS'],
    default: 'USD'
  },
  exchangeRate: {
    type: Number,
    required: true,
    default: 1
  },
  shippingAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: String,
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'US'
    }
  },
  customerInfo: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    mobile: {
      type: String,
      required: true
    }
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cod'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Add index for orderNumber
orderSchema.index({ orderNumber: 1 }, { unique: true });

// Add index for user to optimize queries
orderSchema.index({ user: 1 });

// Add compound index for status and createdAt for filtered queries
orderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Order', orderSchema);