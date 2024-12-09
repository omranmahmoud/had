import mongoose from 'mongoose';

const heroSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  primaryButtonText: {
    type: String,
    default: 'Shop Collection'
  },
  secondaryButtonText: {
    type: String,
    default: 'Explore Lookbook'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Hero', heroSchema);