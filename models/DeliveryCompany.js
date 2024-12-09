import mongoose from 'mongoose';

const deliveryCompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Company code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  apiUrl: {
    type: String,
    required: [true, 'API URL is required']
  },
  credentials: {
    login: String,
    password: String,
    apiKey: String,
    database: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    supportedRegions: [String],
    priceCalculation: {
      type: String,
      enum: ['fixed', 'weight', 'distance'],
      default: 'fixed'
    },
    basePrice: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

export default mongoose.model('DeliveryCompany', deliveryCompanySchema);