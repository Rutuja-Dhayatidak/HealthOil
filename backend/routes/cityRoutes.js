const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

const {
  getAllCities,
  getActiveCities,
  createCity,
  updateCity,
  deleteCity,
  toggleCityStatus,
  addArea,
  updateArea,
  deleteArea,
  toggleAreaStatus,
  getCityVendorDistribution
} = require('../controllers/cityController');

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'HelthOil_Cities',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'svg'],
    public_id: (req, file) => `city-${Date.now()}`
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Admin City Routes
router.get('/', getAllCities);
router.get('/vendor-distribution', getCityVendorDistribution);
router.post('/', upload.single('image'), createCity);
router.put('/:id', upload.single('image'), updateCity);
router.delete('/:id', deleteCity);
router.patch('/:id/toggle', toggleCityStatus);

// Sub-cities / Areas routes
router.post('/:cityId/areas', addArea);
router.put('/:cityId/areas/:areaId', updateArea);
router.delete('/:cityId/areas/:areaId', deleteArea);
router.patch('/:cityId/areas/:areaId/toggle', toggleAreaStatus);

// Public route for active cities
router.get('/active', getActiveCities);

module.exports = router;
