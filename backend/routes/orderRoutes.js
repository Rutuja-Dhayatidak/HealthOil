const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController');

router.post('/create-razorpay-order', protect, orderController.createRazorpayOrder);
router.post('/verify-payment', protect, orderController.verifyPaymentAndCreateOrders);
router.get('/my-orders', protect, orderController.getUserOrders);
router.get('/track/:id', protect, orderController.trackOrder);

module.exports = router;
