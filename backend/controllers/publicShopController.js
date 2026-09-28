const mongoose = require('mongoose');
const Vendor = require('../models/Vendor');
const VendorProduct = require('../models/VendorProduct');
const Review = require('../models/Review');

// Curated authentic oil store banners fallback for shops without a custom banner
const FALLBACK_STORE_BANNERS = [
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
];

// Get all active/approved vendor shops for public display (with pagination: 15 per page)
exports.getPublicShops = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = parseInt(req.query.limit) === 0 || req.query.all === 'true'
      ? 0
      : (parseInt(req.query.limit) || 15);

    const filterQuery = {
      $or: [
        { onboardingStatus: 'APPROVED' },
        { vendorStatus: 'ACTIVE' }
      ]
    };

    const totalVendors = await Vendor.countDocuments(filterQuery);

    let vendorQuery = Vendor.find(filterQuery).sort({ createdAt: -1 });

    if (limit > 0) {
      const skip = (page - 1) * limit;
      vendorQuery = vendorQuery.skip(skip).limit(limit);
    }

    const vendors = await vendorQuery;

    // Fetch product images for vendors in this page
    const vendorIds = vendors.map(v => v._id);
    const vendorProducts = await VendorProduct.find({ vendor: { $in: vendorIds } }).lean();

    const vendorProductImgMap = {};
    for (const p of vendorProducts) {
      const vId = p.vendor?.toString();
      if (vId && !vendorProductImgMap[vId]) {
        const pImg = p.images?.mainImage?.url || (typeof p.images?.mainImage === 'string' ? p.images.mainImage : null) || p.images?.gallery?.[0]?.url || (typeof p.images?.gallery?.[0] === 'string' ? p.images.gallery[0] : null);
        if (pImg) {
          vendorProductImgMap[vId] = pImg;
        }
      }
    }

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

      const vId = vendor._id.toString();
      const storeBanner = storeProfile.banner || 
                          storeProfile.logo || 
                          vendorProductImgMap[vId] || 
                          FALLBACK_STORE_BANNERS[index % FALLBACK_STORE_BANNERS.length];

      return {
        id: vId,
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
        image: storeBanner,
        logo: storeProfile.logo || storeBanner,
        banner: storeBanner,
        socialLinks: storeProfile.socialLinks || {},
        storeProfile: {
          ...storeProfile,
          banner: storeBanner,
          logo: storeProfile.logo || storeBanner,
        },
        lat: 35,
        lng: 40,
        oilType: storeProfile.businessCategory || ''
      };
    });

    const totalPages = limit > 0 ? Math.ceil(totalVendors / limit) : 1;

    res.json({
      success: true,
      total: totalVendors,
      page: page,
      limit: limit,
      totalPages: totalPages,
      hasMore: page < totalPages,
      count: formattedShops.length,
      shops: formattedShops
    });
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

    // Fetch vendor's products
    const rawProducts = await VendorProduct.find({
      vendor: id
    }).sort({ createdAt: -1 });

    const firstProductImg = rawProducts[0]?.images?.mainImage?.url || 
                            (typeof rawProducts[0]?.images?.mainImage === 'string' ? rawProducts[0].images.mainImage : null) || 
                            rawProducts[0]?.images?.gallery?.[0]?.url;

    const storeBanner = storeProfile.banner || storeProfile.logo || firstProductImg || FALLBACK_STORE_BANNERS[0];

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
      image: storeBanner,
      logo: storeProfile.logo || storeBanner,
      banner: storeBanner,
      socialLinks: storeProfile.socialLinks || {},
      storeProfile: {
        ...storeProfile,
        banner: storeBanner,
        logo: storeProfile.logo || storeBanner,
      }
    };

    const products = rawProducts.map((p, idx) => {
      const variant = p.variants?.[0] || {};
      const mainImageUrl = typeof p.images?.mainImage === 'object' ? p.images?.mainImage?.url : p.images?.mainImage;
      const gallery = Array.isArray(p.images?.gallery) ? p.images.gallery.map(img => typeof img === 'object' ? img.url : img) : [];

      return {
        id: p._id.toString(),
        vendorId: p.vendor ? p.vendor.toString() : id,
        vendor: p.vendor ? p.vendor.toString() : id,
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
        currentStock: variant.currentStock || 0,
        popular: idx === 0,
        variants: p.variants.map(v => ({
          id: v._id ? v._id.toString() : Math.random().toString(),
          size: `${v.size || ''} ${v.unit || ''}`.trim(),
          price: v.price || 0,
          mrp: v.mrp || v.price || 0,
          inStock: (v.currentStock || 0) > 0,
          currentStock: v.currentStock || 0
        }))
      };
    });

    // Fetch reviews
    const reviews = await Review.find({ vendor: id, isFeatured: true })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, shop, products, reviews });
  } catch (error) {
    console.error('Error fetching public shop details:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all active/approved public products across all active vendors
exports.getPublicProducts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = parseInt(req.query.limit) === 0 || req.query.all === 'true'
      ? 0
      : (parseInt(req.query.limit) || 40);

    // Fetch all APPROVED / ACTIVE products
    const filterQuery = {
      status: { $in: ['ACTIVE', 'APPROVED'] }
    };

    const totalProducts = await VendorProduct.countDocuments(filterQuery);

    let query = VendorProduct.find(filterQuery)
      .populate('vendor', 'business.storeName fullName storeProfile vendorStatus')
      .sort({ createdAt: -1 });

    if (limit > 0) {
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
    }

    const rawProducts = await query;

    const products = rawProducts.map((p, idx) => {
      const variant = p.variants?.[0] || {};
      const mainImageUrl = typeof p.images?.mainImage === 'object' ? p.images?.mainImage?.url : p.images?.mainImage;
      const gallery = Array.isArray(p.images?.gallery) ? p.images.gallery.map(img => typeof img === 'object' ? img.url : img) : [];

      const vendorStoreName = p.vendor?.business?.storeName || p.vendor?.storeProfile?.storeName || p.vendor?.fullName || '';

      return {
        id: p._id.toString(),
        vendorId: p.vendor?._id ? p.vendor._id.toString() : (p.vendor ? p.vendor.toString() : undefined),
        vendor: p.vendor?._id ? p.vendor._id.toString() : (p.vendor ? p.vendor.toString() : undefined),
        storeName: vendorStoreName,
        name: p.basicDetails?.name || '',
        brandName: p.basicDetails?.brandName || vendorStoreName || 'HealthOil',
        size: `${variant.size || ''} ${variant.unit || ''}`.trim() || '1 Litre',
        description: p.basicDetails?.description || '',
        mrp: variant.mrp || (variant.price ? Math.round(variant.price * 1.3) : 0),
        price: variant.price || 0,
        image: mainImageUrl || '',
        gallery: gallery,
        oilType: p.compliance?.oilType || '',
        isOrganic: p.compliance?.isOrganic || false,
        inStock: (variant.currentStock || 0) > 0,
        rating: 4.8,
        reviews: '100+'
      };
    });

    const totalPages = limit > 0 ? Math.ceil(totalProducts / limit) : 1;

    res.json({
      success: true,
      total: totalProducts,
      page: page,
      limit: limit,
      totalPages: totalPages,
      hasMore: page < totalPages,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Error fetching public products:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
