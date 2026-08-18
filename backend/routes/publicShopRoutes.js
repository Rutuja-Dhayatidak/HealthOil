const express = require('express');
const router = express.Router();
const { getPublicShops, getPublicShopDetails } = require('../controllers/publicShopController');

router.get('/shops', getPublicShops);
router.get('/shops/:id', getPublicShopDetails);

module.exports = router;
