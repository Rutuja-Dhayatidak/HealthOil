const mongoose = require('mongoose');
const Vendor = require('../models/Vendor');
const VendorProduct = require('../models/VendorProduct');

// Get all active/approved vendor shops for public display
exports.getPublicShops = async (req, res) => {
  try {
    const vendors = await Vendor.find({
      $or: [
        { onboardingStatus: 'APPROVED' },
        { vendorStatus: 'ACTIVE' }
      ]
    }).sort({ createdAt: -1 });

    const formattedShops = vendors.map((vendor, index) => {
      const storeProfile = vendor.storeProfile || {};
      const business = vendor.business || {};
      const addressObj = business.address || vendor.pickupAddress || {};

      const addressStr = [
        addressObj.addressLine1,
        addressObj.city,
        addressObj.state,
        addressObj.pincode
      ].filter(Boolean).join(', ');

      return {
        id: vendor._id.toString(),
        name: storeProfile.storeName || business.storeName || vendor.fullName,
        owner: vendor.fullName,
        distance: '2.5',
        rating: 4.8,
        reviews: 0,
        fssai: business.gstNumber || '',
        status: vendor.vendorStatus === 'INACTIVE' ? 'Closed' : 'Open Now',
        timing: '9:00 AM - 9:00 PM',
        phone: vendor.mobile,
        email: vendor.email,
        address: addressStr,
        specialty: storeProfile.businessCategory || '',
        description: storeProfile.description || '',
        image: storeProfile.banner || storeProfile.logo || '',
        logo: storeProfile.logo || '',
        banner: storeProfile.banner || '',
        socialLinks: storeProfile.socialLinks || {},
        lat: 35,
        lng: 40,
        oilType: storeProfile.businessCategory || ''
      };
    });

    res.json({ success: true, count: formattedShops.length, shops: formattedShops });
  } catch (error) {
    console.error('Error fetching public shops:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get shop details & vendor products by vendor ID
exports.getPublicShopDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    const storeProfile = vendor.storeProfile || {};
    const business = vendor.business || {};
    const addressObj = business.address || vendor.pickupAddress || {};

    const addressStr = [
      addressObj.addressLine1,
      addressObj.city,
      addressObj.state,
      addressObj.pincode
    ].filter(Boolean).join(', ');

    const shop = {
      id: vendor._id.toString(),
      name: storeProfile.storeName || business.storeName || vendor.fullName,
      owner: vendor.fullName,
      distance: '2.5',
      rating: 4.8,
      reviews: 0,
      fssai: business.gstNumber || '',
      status: vendor.vendorStatus === 'INACTIVE' ? 'Closed' : 'Open Now',
      timing: '9:00 AM - 9:00 PM',
      phone: vendor.mobile,
      email: vendor.email,
      address: addressStr,
      specialty: storeProfile.businessCategory || '',
      description: storeProfile.description || '',
      image: storeProfile.banner || storeProfile.logo || '',
      logo: storeProfile.logo || '',
      banner: storeProfile.banner || '',
      socialLinks: storeProfile.socialLinks || {}
    };

    // Fetch vendor's products
    const rawProducts = await VendorProduct.find({
      vendor: id
    }).sort({ createdAt: -1 });

    const products = rawProducts.map((p, idx) => {
      const variant = p.variants?.[0] || {};
      const mainImageUrl = typeof p.images?.mainImage === 'object' ? p.images?.mainImage?.url : p.images?.mainImage;
      const gallery = Array.isArray(p.images?.gallery) ? p.images.gallery.map(img => typeof img === 'object' ? img.url : img) : [];

      return {
        id: p._id.toString(),
        name: p.basicDetails?.name || '',
        brandName: p.basicDetails?.brandName || '',
        size: `${variant.size || ''} ${variant.unit || ''}`.trim(),
        description: p.basicDetails?.shortDescription || p.basicDetails?.description || '',
        highlights: p.basicDetails?.highlights || [],
        nutrition: p.nutrition || {},
        compliance: p.compliance || {},
        mrp: variant.mrp || variant.price || 0,
        price: variant.price || 0,
        pressedType: p.compliance?.oilType || '',
        image: mainImageUrl || '',
        gallery: gallery,
        inStock: (variant.currentStock || 0) > 0,
        popular: idx === 0
      };
    });

    res.json({ success: true, shop, products });
  } catch (error) {
    console.error('Error fetching public shop details:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
