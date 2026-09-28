const express = require('express');
const router = express.Router();
const {
  getAllNewsAdmin,
  getNewsById,
  createNews,
  updateNews,
  toggleNewsStatus,
  reorderNews,
  deleteNews,
  getNewsResources
} = require('../controllers/rightSidebarNewsController');
const { protectAdmin } = require('../middleware/adminAuth');
const { uploadNewsImage } = require('../middleware/newsUpload');

// All admin routes are protected by Super Admin JWT authentication
router.use(protectAdmin);

// Resources for selector dropdowns (products, offers, blogs)
router.get('/resources', getNewsResources);

// Reorder endpoint (MUST be declared before /:id)
router.put('/reorder', reorderNews);

// List all news with pagination & search
router.get('/', getAllNewsAdmin);

// Create news with image upload
router.post('/', uploadNewsImage.single('image'), createNews);

// Get single news item
router.get('/:id', getNewsById);

// Update news item
router.put('/:id', uploadNewsImage.single('image'), updateNews);

// Status toggle endpoint
router.patch('/:id/status', toggleNewsStatus);

// Delete news item
router.delete('/:id', deleteNews);

module.exports = router;
