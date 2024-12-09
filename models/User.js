import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  image: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  notificationPreferences: {
    orderUpdates: {
      type: Boolean,
      default: true
    },
    newArrivals: {
      type: Boolean,
      default: true
    },
    specialOffers: {
      type: Boolean,
      default: true
    }
  },
  lastPasswordChange: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
    this.lastPasswordChange = new Date();
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create default admin user if none exists
userSchema.statics.createDefaultAdmin = async function() {
  try {
    const adminExists = await this.findOne({ role: 'admin' });
    if (!adminExists) {
      await this.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Default admin user created successfully');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

const User = mongoose.model('User', userSchema);

// Create default admin user when the model is initialized
User.createDefaultAdmin();

export default User;