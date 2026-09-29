const express = require('express');
const router = express.Router();
const { 
  sendOtp, 
  registerUser, 
  sendForgotPasswordOtp, 
  resetPassword, 
  getUserProfile, 
  loginUser,
  googleLogin,
  deleteAccount 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send-otp', sendOtp);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google-login', googleLogin);
router.post('/forgot-password-otp', sendForgotPasswordOtp);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getUserProfile);
router.delete('/delete-account', protect, deleteAccount);
router.delete('/me', protect, deleteAccount);


module.exports = router;
