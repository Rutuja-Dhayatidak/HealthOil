const Offer = require('../models/Offer');
const VendorProduct = require('../models/VendorProduct');

// Get all offers for current vendor with pagination and search
exports.getVendorOffers = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { page, limit = 15, status, search } = req.query;

    const query = { vendor: vendorId };

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      query.$or = [
        { title: searchRegex },
        { code: searchRegex },
        { description: searchRegex }
      ];
    }

    // Auto-update expired offers
    const now = new Date();
    await Offer.updateMany(
      { vendor: vendorId, endDate: { $lt: now }, status: 'ACTIVE' },
      { status: 'EXPIRED' }
    );

    // Calculate Summary Stats
    const [allOffers, totalCount] = await Promise.all([
      Offer.find({ vendor: vendorId }).populate('applicableProducts', 'basicDetails.name basicDetails.brandName variants images'),
      Offer.countDocuments(query)
    ]);

    const activeCount = allOffers.filter(o => o.status === 'ACTIVE').length;
    const pausedCount = allOffers.filter(o => o.status === 'PAUSED').length;
    const expiredCount = allOffers.filter(o => o.status === 'EXPIRED').length;

    // Count unique products with active offers
    const activeProductsSet = new Set();
    allOffers.filter(o => o.status === 'ACTIVE').forEach(o => {
      if (o.applicableTo === 'ALL_PRODUCTS') {
        // will represent all
      } else if (Array.isArray(o.applicableProducts)) {
        o.applicableProducts.forEach(p => activeProductsSet.add(p?._id?.toString() || p?.toString()));
      }
    });

    const summary = {
      total: allOffers.length,
      active: activeCount,
      paused: pausedCount,
      expired: expiredCount,
      productsWithOffers: activeProductsSet.size
    };

    if (page !== undefined && page !== null && page !== '') {
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.max(1, parseInt(limit) || 15);
      const skip = (pageNum - 1) * limitNum;

      const paginatedOffers = await Offer.find(query)
        .populate('applicableProducts', 'basicDetails.name basicDetails.brandName variants images')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const totalPages = Math.ceil(totalCount / limitNum) || 1;

      return res.status(200).json({
        success: true,
        offers: paginatedOffers,
        summary,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalOffers: totalCount,
          limit: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      });
    }

    const offers = await Offer.find(query)
      .populate('applicableProducts', 'basicDetails.name basicDetails.brandName variants images')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      offers,
      summary,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalOffers: offers.length,
        limit: offers.length,
        hasNextPage: false,
        hasPrevPage: false
      }
    });
  } catch (error) {
    console.error('Get Vendor Offers Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching offers' });
  }
};

// Create a new offer
exports.createVendorOffer = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const {
      title,
      code,
      discountType = 'PERCENTAGE',
      discountValue,
      applicableTo = 'SPECIFIC_PRODUCTS',
      applicableProducts = [],
      minOrderValue = 0,
      maxDiscountAmount = null,
      startDate = new Date(),
      endDate,
      usageLimit = null,
      description = ''
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Offer title is required' });
    }
    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Offer coupon code is required' });
    }
    if (discountValue === undefined || discountValue === null || Number(discountValue) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid discount value is required' });
    }
    if (!endDate) {
      return res.status(400).json({ success: false, message: 'Offer expiry date is required' });
    }

    const cleanCode = code.trim().toUpperCase();

    // Check code duplication for this vendor
    const existing = await Offer.findOne({ vendor: vendorId, code: cleanCode, status: { $ne: 'EXPIRED' } });
    if (existing) {
      return res.status(400).json({ success: false, message: `Offer code "${cleanCode}" is already active for your store.` });
    }

    const newOffer = new Offer({
      vendor: vendorId,
      title: title.trim(),
      code: cleanCode,
      discountType,
      discountValue: Number(discountValue),
      applicableTo,
      applicableProducts: applicableTo === 'ALL_PRODUCTS' ? [] : applicableProducts,
      minOrderValue: Number(minOrderValue) || 0,
      maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      usageLimit: usageLimit ? Number(usageLimit) : null,
      description: description.trim(),
      status: 'ACTIVE'
    });

    await newOffer.save();
    await newOffer.populate('applicableProducts', 'basicDetails.name basicDetails.brandName variants images');

    res.status(201).json({
      success: true,
      message: 'Offer created successfully',
      offer: newOffer
    });
  } catch (error) {
    console.error('Create Vendor Offer Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create offer' });
  }
};

// Update an existing offer
exports.updateVendorOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;
    const updates = req.body;

    if (updates.code) {
      updates.code = updates.code.trim().toUpperCase();
      const existing = await Offer.findOne({
        _id: { $ne: id },
        vendor: vendorId,
        code: updates.code,
        status: { $ne: 'EXPIRED' }
      });
      if (existing) {
        return res.status(400).json({ success: false, message: `Offer code "${updates.code}" is already in use.` });
      }
    }

    const offer = await Offer.findOneAndUpdate(
      { _id: id, vendor: vendorId },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('applicableProducts', 'basicDetails.name basicDetails.brandName variants images');

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found or unauthorized' });
    }

    res.status(200).json({
      success: true,
      message: 'Offer updated successfully',
      offer
    });
  } catch (error) {
    console.error('Update Vendor Offer Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update offer' });
  }
};

// Toggle offer status (ACTIVE <-> PAUSED)
exports.toggleOfferStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;

    const offer = await Offer.findOne({ _id: id, vendor: vendorId });
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    if (offer.status === 'EXPIRED') {
      return res.status(400).json({ success: false, message: 'Cannot reactivate expired offer. Please extend the expiry date.' });
    }

    offer.status = offer.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    await offer.save();

    res.status(200).json({
      success: true,
      message: `Offer ${offer.status === 'ACTIVE' ? 'activated' : 'paused'} successfully`,
      offer
    });
  } catch (error) {
    console.error('Toggle Offer Status Error:', error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

// Delete an offer
exports.deleteVendorOffer = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;

    const offer = await Offer.findOneAndDelete({ _id: id, vendor: vendorId });
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Offer deleted successfully'
    });
  } catch (error) {
    console.error('Delete Vendor Offer Error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete offer' });
  }
};
