import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Update user profile
router.patch('/profile', auth, async (req, res) => {
  try {
    const { name, email, image } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate email uniqueness if changed
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (image) user.image = image;

    await user.save();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        image: user.image
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update password
router.patch('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete account
router.delete('/account', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.remove();
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update notification preferences
router.patch('/notifications', auth, async (req, res) => {
  try {
    const { preferences } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...preferences
    };

    await user.save();
    res.json({ preferences: user.notificationPreferences });
  } catch (error) {
    console.error('Notification preferences update error:', error);
    res.status(400).json({ message: error.message });
  }
});

export default router;