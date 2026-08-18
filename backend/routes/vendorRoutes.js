const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const { protectVendor } = require('../middleware/vendorAuth');

const { registerVendor, sendOtp, verifyOtp, loginVendor, forgotPassword } = require('../controllers/vendorAuthController');
const { saveBusinessDetails, uploadDocument, savePickupAddress, saveBankDetails, submitApplication } = require('../controllers/vendorOnboardingController');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'HelthOil',
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
    public_id: (req, file) => `vendor-${req.user.id}-${Date.now()}`
  }
});

const upload = multer({ storage });

// Auth Routes
router.post('/register', registerVendor);
router.post('/otp/send', sendOtp);
router.post('/otp/verify', verifyOtp);
router.post('/login', loginVendor);
router.post('/forgot-password', forgotPassword);

// Onboarding Routes (Protected)
router.post('/onboarding/business', protectVendor, saveBusinessDetails);
router.post('/onboarding/documents', protectVendor, upload.single('document'), uploadDocument);
router.post('/onboarding/pickup', protectVendor, savePickupAddress);
router.post('/onboarding/bank', protectVendor, saveBankDetails);
router.post('/onboarding/submit', protectVendor, submitApplication);

const { getStoreProfile, updateStoreProfile, uploadStoreImages } = require('../controllers/vendorShopController');

// Shop Profile Routes
router.get('/shop/profile', protectVendor, getStoreProfile);
router.put('/shop/profile', protectVendor, updateStoreProfile);
router.post('/shop/profile/images', protectVendor, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), uploadStoreImages);

module.exports = router;
