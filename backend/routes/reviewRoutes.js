const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/reviews
// @desc    Submit a new review (Customer side)
router.post('/', protect, async (req, res) => {
  try {
    const { vendorId, orderId, productName, rating, comment } = req.body;

    const newReview = new Review({
      user: req.user.id,
      vendor: vendorId,
      order: orderId,
      productName,
      rating,
      comment
    });

    const savedReview = await newReview.save();
    res.json({ success: true, review: savedReview });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/reviews/vendor/:vendorId
// @desc    Get all reviews for a vendor (Vendor side)
router.get('/vendor/:vendorId', async (req, res) => {
  try {
    const reviews = await Review.find({ vendor: req.params.vendorId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    console.error('Error fetching vendor reviews:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/reviews/:id/feature
// @desc    Toggle feature status of a review (Vendor side)
router.put('/:id/feature', async (req, res) => {
  try {
    const { isFeatured } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isFeatured },
      { new: true }
    );
    res.json({ success: true, review });
  } catch (error) {
    console.error('Error toggling feature status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/reviews/shop/:vendorId
// @desc    Get featured reviews for shop details page (Public)
router.get('/shop/:vendorId', async (req, res) => {
  try {
    const reviews = await Review.find({ vendor: req.params.vendorId, isFeatured: true })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (error) {
    console.error('Error fetching public reviews:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
