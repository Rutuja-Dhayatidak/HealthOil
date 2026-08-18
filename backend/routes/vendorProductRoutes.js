const express = require('express');
const router = express.Router();
const { protectVendor } = require('../middleware/vendorAuth');

const {
  getOilConfig,
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  getInventory,
  adjustVariantStock,
  updateThreshold,
  getLedger,
  exportInventory,
  uploadProductImages
} = require('../controllers/vendorProductController');

const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'HelthOil_Products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    public_id: (req, file) => `product-${req.params.id}-${Date.now()}`
  }
});

const upload = multer({ storage });

// Configuration Routes
router.get('/config/oil-options', getOilConfig);

// Product Routes (Protected)
router.post('/products', protectVendor, createProduct);
router.get('/products', protectVendor, getProducts);
router.get('/products/:id', protectVendor, getProductById);
router.patch('/products/:id', protectVendor, updateProduct);
router.post('/products/:id/images', protectVendor, upload.fields([{ name: 'mainImage', maxCount: 1 }, { name: 'gallery', maxCount: 5 }]), uploadProductImages);

// Inventory Routes (Protected)
router.get('/inventory', protectVendor, getInventory);
router.patch('/inventory/:variantId/adjust', protectVendor, adjustVariantStock);
router.patch('/inventory/:variantId/threshold', protectVendor, updateThreshold);
router.get('/inventory/ledger', protectVendor, getLedger);
router.get('/inventory/export', protectVendor, exportInventory);

module.exports = router;
