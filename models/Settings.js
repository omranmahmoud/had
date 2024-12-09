import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'Eva Curves Fashion Store'
  },
  email: {
    type: String,
    required: true,
    default: 'contact@evacurves.com'
  },
  phone: {
    type: String,
    default: '+1 (555) 123-4567'
  },
  address: {
    type: String,
    default: '123 Fashion Street, NY 10001'
  },
  currency: {
    type: String,
    required: true,
    enum: ['USD', 'EUR', 'GBP', 'AED', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR', 'JOD', 'LBP', 'EGP', 'IQD', 'ILS'],
    default: 'USD'
  },
  timezone: {
    type: String,
    required: true,
    default: 'UTC-5'
  },
  logo: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Create default settings if none exist
settingsSchema.statics.createDefaultSettings = async function() {
  try {
    const settings = await this.findOne();
    if (!settings) {
      await this.create({});
      console.log('Default store settings created successfully');
    }
  } catch (error) {
    console.error('Error creating default settings:', error);
  }
};

const Settings = mongoose.model('Settings', settingsSchema);

// Create default settings when the model is initialized
Settings.createDefaultSettings();

export default Settings;