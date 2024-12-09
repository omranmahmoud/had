import express from 'express';
import { adminAuth } from '../middleware/auth.js';
import {
  getDeliveryCompanies,
  createDeliveryCompany,
  updateDeliveryCompany,
  deleteDeliveryCompany,
  createDeliveryOrder,
  calculateDeliveryFee,
  getDeliveryStatus
} from '../controllers/deliveryController.js';

const router = express.Router();

// Company management routes (admin only)
router.get('/companies', adminAuth, getDeliveryCompanies);
router.post('/companies', adminAuth, createDeliveryCompany);
router.put('/companies/:id', adminAuth, updateDeliveryCompany);
router.delete('/companies/:id', adminAuth, deleteDeliveryCompany);

// Delivery order routes
router.post('/order', adminAuth, createDeliveryOrder);
router.post('/calculate-fee', adminAuth, calculateDeliveryFee);
router.get('/status/:orderId/:companyId', adminAuth, getDeliveryStatus);

export default router;