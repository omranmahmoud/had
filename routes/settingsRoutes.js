import express from 'express';
import { adminAuth } from '../middleware/auth.js';
import Settings from '../models/Settings.js';

const router = express.Router();

// Get store settings
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update store settings (admin only)
router.put('/', adminAuth, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    // Update settings
    Object.assign(settings, req.body);
    await settings.save();

    res.json(settings);
  } catch (error) {
    if (error.name === 'ValidationError') {
      res.status(400).json({ 
        message: 'Validation error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

export default router;