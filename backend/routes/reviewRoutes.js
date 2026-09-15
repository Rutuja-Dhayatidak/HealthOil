const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const VendorProduct = require('../models/VendorProduct');
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
    const [reviews, products] = await Promise.all([
      Review.find({ vendor: req.params.vendorId })
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 }),
      VendorProduct.find({ vendor: req.params.vendorId })
    ]);

    const enrichedReviews = reviews.map(rev => {
      const revObj = rev.toObject();
      const matchedProd = products.find(p => 
        (p.basicDetails?.name && rev.productName && p.basicDetails.name.trim().toLowerCase() === rev.productName.trim().toLowerCase()) ||
        (rev.productName && p.basicDetails?.name && rev.productName.toLowerCase().includes(p.basicDetails.name.toLowerCase())) ||
        (rev.productName && p.basicDetails?.name && p.basicDetails.name.toLowerCase().includes(rev.productName.toLowerCase()))
      );

      if (matchedProd) {
        revObj.productImage = matchedProd.images?.mainImage || 
                              (matchedProd.images?.gallery && matchedProd.images?.gallery[0]) || 
                              matchedProd.bannerImage || 
                              matchedProd.image || null;
        revObj.oilType = matchedProd.compliance?.oilType;
        revObj.brandName = matchedProd.basicDetails?.brandName;
        revObj.productId = matchedProd._id;
      }
      return revObj;
    });

    res.json({ success: true, reviews: enrichedReviews });
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
    ).populate('user', 'name email phone');
    res.json({ success: true, review });
  } catch (error) {
    console.error('Error toggling feature status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/reviews/:id/reply
// @desc    Vendor replies to customer review
router.put('/:id/reply', async (req, res) => {
  try {
    const { message } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { 
        vendorReply: {
          message,
          repliedAt: new Date()
        }
      },
      { new: true }
    ).populate('user', 'name email phone');
    res.json({ success: true, message: 'Reply sent successfully', review });
  } catch (error) {
    console.error('Error replying to review:', error);
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
