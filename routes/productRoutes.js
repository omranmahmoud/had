import express from 'express';
import { auth, adminAuth } from '../middleware/auth.js';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  updateRelatedProducts,
  searchProducts,
  reorderFeaturedProducts
} from '../controllers/productController.js';
import {
  getAllReviews,
  addReview,
  markReviewHelpful,
  reportReview,
  verifyReview,
  deleteReview
} from '../controllers/reviewController.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/:id', getProduct);

// Protected routes (admin only)
router.post('/', adminAuth, createProduct);
router.put('/:id', adminAuth, updateProduct);
router.put('/:id/related', adminAuth, updateRelatedProducts);
router.put('/featured/reorder', adminAuth, reorderFeaturedProducts);
router.delete('/:id', adminAuth, deleteProduct);

// Review routes
router.get('/reviews/all', adminAuth, getAllReviews);
router.post('/:id/reviews', auth, addReview);
router.post('/:id/reviews/:reviewId/helpful', auth, markReviewHelpful);
router.post('/:id/reviews/:reviewId/report', auth, reportReview);
router.put('/:id/reviews/:reviewId/verify', adminAuth, verifyReview);
router.delete('/:id/reviews/:reviewId', adminAuth, deleteReview);

export default router;