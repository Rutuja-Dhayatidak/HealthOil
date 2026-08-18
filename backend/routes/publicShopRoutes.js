const express = require('express');
const router = express.Router();
const { getPublicShops, getPublicShopDetails, getPublicProducts } = require('../controllers/publicShopController');

router.get('/shops', getPublicShops);
router.get('/shops/:id', getPublicShopDetails);
router.get('/products', getPublicProducts);

module.exports = router;
