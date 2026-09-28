const RightSidebarNews = require('../models/RightSidebarNews');
const VendorProduct = require('../models/VendorProduct');
const { cloudinary } = require('../middleware/newsUpload');

// Seed default news if empty (ensures mockup visuals match immediately out-of-the-box)
const seedDefaultNewsIfEmpty = async () => {
  try {
    const count = await RightSidebarNews.countDocuments();
    if (count === 0) {
      const defaultItems = [
        {
          title: 'New Launch',
          description: 'Cold Pressed Mustard Oil',
          badgeText: 'New Launch',
          image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80',
          linkType: 'Product',
          benefits: [
            '100% Pure, Wood-Pressed Kolhu extraction',
            'Rich in natural Omega-3 and antioxidants',
            'Zero chemicals or artificial preservatives'
          ],
          order: 1,
          isActive: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'Special Offer',
          description: 'Flat 50% OFF Healthy Combo',
          badgeText: '50% OFF',
          image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
          linkType: 'Offer',
          customUrl: '/offers/healthy-combo-50',
          benefits: [
            'Bundle of 3 pure cold-pressed oils',
            'Flat 50% discount on combo pack',
            'Free doorstep delivery across India'
          ],
          order: 2,
          isActive: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'Healthy Tips',
          description: 'Immunity Boost with Natural Oils',
          badgeText: 'Healthy Tips',
          image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
          linkType: 'Blog',
          blogId: 'immunity-boost-natural-oils',
          benefits: [
            'Ayurvedic healing and daily wellness',
            'Natural vitamin E for glowing skin and immunity',
            'Safe for raw salads and light tempering'
          ],
          order: 3,
          isActive: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'Our Process',
          description: 'Lakdi Ghana Traditional Method',
          badgeText: 'Our Process',
          image: 'https://images.unsplash.com/photo-1547496502-affa22d38842?w=600&auto=format&fit=crop&q=80',
          linkType: 'Custom URL',
          customUrl: '/process',
          benefits: [
            'Cold extracted at slow speed (<40°C)',
            'Natural sedimentation and cloth filtration',
            'Authentic rustic aroma and golden color'
          ],
          order: 4,
          isActive: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
        },
        {
          title: 'New Blog',
          description: 'Why Cold Pressed Oils are Better?',
          badgeText: 'New Blog',
          image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=600&auto=format&fit=crop&q=80',
          linkType: 'Blog',
          blogId: 'why-cold-pressed-is-better',
          benefits: [
            'Retains maximum bio-active antioxidants',
            'Zero chemical solvents or bleaching agents',
            'Supports heart wellness and clean lipid profile'
          ],
          order: 5,
          isActive: true,
          startDate: new Date(),
          endDate: null
        }
      ];

      await RightSidebarNews.insertMany(defaultItems);
      console.log('✅ Default Right Sidebar News seeded successfully');
    }
  } catch (err) {
    console.error('Error seeding default right sidebar news:', err.message);
  }
};

// Auto-run seed check on startup
seedDefaultNewsIfEmpty();

// @desc    Get all news items for Admin (with search, pagination, sort)
// @route   GET /api/admin/right-sidebar-news
// @access  Super Admin
const getAllNewsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = 'all' } = req.query;

    const query = {};

    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: regex }, { description: regex }, { badgeText: regex }];
    }

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await RightSidebarNews.countDocuments(query);
    const news = await RightSidebarNews.find(query)
      .populate('productId', 'basicDetails.name basicDetails.brandName images variants')
      .populate('createdBy', 'name email')
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: news,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    console.error('Error in getAllNewsAdmin:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve news', error: error.message });
  }
};

// @desc    Get single news item by ID
// @route   GET /api/admin/right-sidebar-news/:id
// @access  Super Admin
const getNewsById = async (req, res) => {
  try {
    const news = await RightSidebarNews.findById(req.params.id)
      .populate('productId', 'basicDetails.name basicDetails.brandName images variants');

    if (!news) {
      return res.status(404).json({ success: false, message: 'News item not found' });
    }

    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch news', error: error.message });
  }
};

// @desc    Create new sidebar news item
// @route   POST /api/admin/right-sidebar-news
// @access  Super Admin
const createNews = async (req, res) => {
  try {
    const {
      title,
      description,
      badgeText,
      linkType,
      productId,
      blogId,
      customUrl,
      benefits,
      startDate,
      endDate,
      isActive,
      order
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }

    // Determine image URL
    let imageUrl = '';
    let cloudinaryId = '';

    if (req.file) {
      imageUrl = req.file.path || req.file.secure_url;
      cloudinaryId = req.file.filename || req.file.public_id || '';
      
      // If local disk storage fallback was used
      if (!imageUrl.startsWith('http')) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        imageUrl = `${baseUrl}/uploads/news/${req.file.filename}`;
      }
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: 'News banner image is required' });
    }

    // Calculate order
    let finalOrder = parseInt(order, 10);
    if (isNaN(finalOrder) || finalOrder <= 0) {
      const lastNews = await RightSidebarNews.findOne().sort({ order: -1 });
      finalOrder = lastNews ? (lastNews.order || 0) + 1 : 1;
    }

    // Parse benefits
    let parsedBenefits = [];
    if (typeof benefits === 'string') {
      try {
        parsedBenefits = JSON.parse(benefits);
      } catch (e) {
        parsedBenefits = benefits.split('\n').map(b => b.trim()).filter(Boolean);
      }
    } else if (Array.isArray(benefits)) {
      parsedBenefits = benefits.map(b => String(b).trim()).filter(Boolean);
    }

    const newNews = new RightSidebarNews({
      title: title.trim(),
      description: description ? description.trim() : '',
      badgeText: badgeText ? badgeText.trim() : (title.length <= 15 ? title : ''),
      image: imageUrl,
      cloudinaryId,
      linkType: linkType || 'Product',
      productId: (linkType === 'Product' && productId) ? productId : null,
      blogId: (linkType === 'Blog' && blogId) ? blogId : '',
      customUrl: (linkType === 'Custom URL' || linkType === 'Offer') ? customUrl : '',
      benefits: parsedBenefits,
      order: finalOrder,
      isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      createdBy: req.admin ? req.admin._id : null
    });

    await newNews.save();

    const populated = await RightSidebarNews.findById(newNews._id)
      .populate('productId', 'basicDetails.name basicDetails.brandName images');

    res.status(201).json({
      success: true,
      message: 'News item created successfully',
      data: populated
    });
  } catch (error) {
    console.error('Error in createNews:', error);
    res.status(500).json({ success: false, message: 'Failed to create news', error: error.message });
  }
};

// @desc    Update existing sidebar news
// @route   PUT /api/admin/right-sidebar-news/:id
// @access  Super Admin
const updateNews = async (req, res) => {
  try {
    const news = await RightSidebarNews.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ success: false, message: 'News item not found' });
    }

    const {
      title,
      description,
      badgeText,
      linkType,
      productId,
      blogId,
      customUrl,
      benefits,
      startDate,
      endDate,
      isActive,
      order
    } = req.body;

    if (title) news.title = title.trim();
    if (description !== undefined) news.description = description.trim();
    if (badgeText !== undefined) news.badgeText = badgeText.trim();
    if (linkType) news.linkType = linkType;
    
    news.productId = (linkType === 'Product' && productId) ? productId : null;
    news.blogId = (linkType === 'Blog' && blogId) ? blogId : '';
    news.customUrl = (linkType === 'Custom URL' || linkType === 'Offer') ? customUrl : '';

    if (benefits !== undefined) {
      if (typeof benefits === 'string') {
        try {
          news.benefits = JSON.parse(benefits);
        } catch (e) {
          news.benefits = benefits.split('\n').map(b => b.trim()).filter(Boolean);
        }
      } else if (Array.isArray(benefits)) {
        news.benefits = benefits.map(b => String(b).trim()).filter(Boolean);
      }
    }

    if (order !== undefined && !isNaN(parseInt(order, 10))) {
      news.order = parseInt(order, 10);
    }

    if (isActive !== undefined) {
      news.isActive = isActive === 'true' || isActive === true;
    }

    if (startDate !== undefined) {
      news.startDate = startDate ? new Date(startDate) : null;
    }

    if (endDate !== undefined) {
      news.endDate = endDate ? new Date(endDate) : null;
    }

    // New image uploaded
    if (req.file) {
      let imageUrl = req.file.path || req.file.secure_url;
      const cloudinaryId = req.file.filename || req.file.public_id || '';

      if (!imageUrl.startsWith('http')) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        imageUrl = `${baseUrl}/uploads/news/${req.file.filename}`;
      }

      // If previous cloudinary image exists, optionally clean up
      if (news.cloudinaryId && cloudinary.uploader) {
        try {
          await cloudinary.uploader.destroy(news.cloudinaryId);
        } catch (delErr) {
          console.warn('Could not remove old Cloudinary image:', delErr.message);
        }
      }

      news.image = imageUrl;
      news.cloudinaryId = cloudinaryId;
    } else if (req.body.image) {
      news.image = req.body.image;
    }

    await news.save();

    const populated = await RightSidebarNews.findById(news._id)
      .populate('productId', 'basicDetails.name basicDetails.brandName images');

    res.json({
      success: true,
      message: 'News item updated successfully',
      data: populated
    });
  } catch (error) {
    console.error('Error in updateNews:', error);
    res.status(500).json({ success: false, message: 'Failed to update news', error: error.message });
  }
};

// @desc    Toggle Active status of news item
// @route   PATCH /api/admin/right-sidebar-news/:id/status
// @access  Super Admin
const toggleNewsStatus = async (req, res) => {
  try {
    const news = await RightSidebarNews.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ success: false, message: 'News item not found' });
    }

    if (req.body.isActive !== undefined) {
      news.isActive = Boolean(req.body.isActive);
    } else {
      news.isActive = !news.isActive;
    }

    await news.save();

    res.json({
      success: true,
      message: `News item is now ${news.isActive ? 'Active' : 'Inactive'}`,
      data: news
    });
  } catch (error) {
    console.error('Error in toggleNewsStatus:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle status', error: error.message });
  }
};

// @desc    Reorder news items via Drag & Drop
// @route   PUT /api/admin/right-sidebar-news/reorder
// @access  Super Admin
const reorderNews = async (req, res) => {
  try {
    const { orderedIds } = req.body;

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return res.status(400).json({ success: false, message: 'orderedIds array is required' });
    }

    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { order: index + 1 }
      }
    }));

    await RightSidebarNews.bulkWrite(bulkOps);

    const reorderedList = await RightSidebarNews.find()
      .populate('productId', 'basicDetails.name basicDetails.brandName images')
      .sort({ order: 1 });

    res.json({
      success: true,
      message: 'News items reordered successfully',
      data: reorderedList
    });
  } catch (error) {
    console.error('Error in reorderNews:', error);
    res.status(500).json({ success: false, message: 'Failed to reorder news', error: error.message });
  }
};

// @desc    Delete news item
// @route   DELETE /api/admin/right-sidebar-news/:id
// @access  Super Admin
const deleteNews = async (req, res) => {
  try {
    const news = await RightSidebarNews.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ success: false, message: 'News item not found' });
    }

    if (news.cloudinaryId && cloudinary.uploader) {
      try {
        await cloudinary.uploader.destroy(news.cloudinaryId);
      } catch (delErr) {
        console.warn('Could not delete Cloudinary asset:', delErr.message);
      }
    }

    await RightSidebarNews.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'News item deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteNews:', error);
    res.status(500).json({ success: false, message: 'Failed to delete news', error: error.message });
  }
};

// @desc    Get active news for Public Customer Website
// @route   GET /api/public/right-sidebar-news
// @access  Public
const getPublicActiveNews = async (req, res) => {
  try {
    const now = new Date();

    const query = {
      isActive: true,
      $and: [
        {
          $or: [
            { startDate: null },
            { startDate: { $lte: now } }
          ]
        },
        {
          $or: [
            { endDate: null },
            { endDate: { $gte: now } }
          ]
        }
      ]
    };

    const newsList = await RightSidebarNews.find(query)
      .populate({
        path: 'productId',
        select: 'basicDetails compliance nutrition variants images'
      })
      .sort({ order: 1, createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      count: newsList.length,
      data: newsList
    });
  } catch (error) {
    console.error('Error in getPublicActiveNews:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch public news', error: error.message });
  }
};

// @desc    Get resources for selector (products, offers, blogs)
// @route   GET /api/admin/right-sidebar-news/resources
// @access  Super Admin
const getNewsResources = async (req, res) => {
  try {
    const products = await VendorProduct.find({}, 'basicDetails.name basicDetails.brandName variants images')
      .sort({ createdAt: -1 })
      .limit(50);

    const defaultBlogs = [
      { id: 'immunity-boost-natural-oils', title: 'Immunity Boost with Natural Oils' },
      { id: 'why-cold-pressed-is-better', title: 'Why Cold Pressed Oils are Better?' },
      { id: 'wood-pressed-vs-refined', title: 'Wood Pressed vs Refined: The Truth' },
      { id: 'ayurvedic-oil-pulling-guide', title: 'Beginner Guide to Ayurvedic Oil Pulling' }
    ];

    const defaultOffers = [
      { id: 'healthy-combo-50', title: 'Flat 50% OFF Healthy Combo' },
      { id: 'first-order-20', title: 'New Customer 20% OFF' },
      { id: 'buy2-get1-free', title: 'Buy 2 Cold Pressed Bottles Get 1 Free' }
    ];

    res.json({
      success: true,
      products: products.map(p => ({
        id: p._id,
        name: p.basicDetails?.name || 'Unnamed Product',
        brand: p.basicDetails?.brandName || '',
        price: p.variants?.[0]?.price || 0
      })),
      blogs: defaultBlogs,
      offers: defaultOffers
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ success: false, message: 'Failed to load resources', error: error.message });
  }
};

module.exports = {
  getAllNewsAdmin,
  getNewsById,
  createNews,
  updateNews,
  toggleNewsStatus,
  reorderNews,
  deleteNews,
  getPublicActiveNews,
  getNewsResources
};
