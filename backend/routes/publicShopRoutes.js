const express = require('express');
const router = express.Router();
const { getPublicShops, getPublicShopDetails, getPublicProducts } = require('../controllers/publicShopController');
const { getPublicActiveNews } = require('../controllers/rightSidebarNewsController');

router.get('/shops', getPublicShops);
router.get('/shops/:id', getPublicShopDetails);
router.get('/products', getPublicProducts);
router.get('/right-sidebar-news', getPublicActiveNews);

module.exports = router;
