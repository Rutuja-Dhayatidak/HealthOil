const VendorProduct = require('../models/VendorProduct');

// Predefined configuration for the frontend Add Product wizard
const getOilConfig = (req, res) => {
  res.json({
    success: true,
    data: {
      oilTypes: ['Mustard', 'Groundnut', 'Coconut', 'Sesame', 'Olive', 'Flaxseed', 'Sunflower', 'Safflower'],
      refiningTypes: ['Unrefined / Cold Pressed', 'Refined', 'Filtered', 'Extra Virgin'],
      extractionMethods: ['Wood Pressed (Kachi Ghani)', 'Cold Pressed', 'Expeller Pressed', 'Solvent Extracted'],
      packagingTypes: ['PET Bottle', 'Glass Bottle', 'Tin Can', 'Pouch', 'Jerry Can']
    }
  });
};

const createProduct = async (req, res) => {
  try {
    const { 
      name, 
      brandName = '', 
      description = '', 
      highlights = [], 
      oilType = '', 
      refiningType = '', 
      extractionMethod = '', 
      packagingType = '', 
      isOrganic = false, 
      fssaiLicenseNo = '', 
      hsnCode = '', 
      shelfLifeDays = 180, 
      nutrition = {}, 
      variants = [], 
      mainImage = null, 
      gallery = [] 
    } = req.body || {};

    const vendorId = req.user.id;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }

    // Sanitize highlights
    const sanitizedHighlights = Array.isArray(highlights) 
      ? highlights.map(h => typeof h === 'string' ? { text: h } : { text: h?.text || '' }).filter(h => h.text.trim())
      : [];

    // Sanitize variants
    const sanitizedVariants = Array.isArray(variants) && variants.length > 0
      ? variants.map((v, i) => ({
          size: String(v.size || '1'),
          unit: String(v.unit || 'Litre'),
          sku: String(v.sku || `SKU-${Date.now()}-${i + 1}`),
          price: Number(v.price) || 0,
          mrp: Number(v.mrp) || 0,
          initialStock: Number(v.initialStock) || 0,
          currentStock: Number(v.initialStock) || 0,
          lowStockThreshold: Number(v.lowStockThreshold) || 10
        }))
      : [{
          size: '1',
          unit: 'Litre',
          sku: `SKU-${Date.now()}-1`,
          price: 0,
          mrp: 0,
          initialStock: 0,
          currentStock: 0,
          lowStockThreshold: 10
        }];

    // Build product document
    const newProduct = new VendorProduct({
      vendor: vendorId,
      basicDetails: {
        name,
        brandName,
        description,
        highlights: sanitizedHighlights
      },
      compliance: {
        oilType,
        refiningType,
        extractionMethod,
        packagingType,
        isOrganic: Boolean(isOrganic),
        fssaiLicenseNo,
        hsnCode,
        shelfLifeDays: Number(shelfLifeDays) || 180
      },
      nutrition: {
        energy: Number(nutrition?.energy) || 0,
        totalFat: Number(nutrition?.totalFat) || 0,
        saturatedFat: Number(nutrition?.saturatedFat) || 0,
        transFat: Number(nutrition?.transFat) || 0,
        mufa: Number(nutrition?.mufa) || 0,
        pufa: Number(nutrition?.pufa) || 0,
        cholesterol: Number(nutrition?.cholesterol) || 0
      },
      variants: sanitizedVariants,
      images: {
        mainImage,
        gallery
      },
      status: 'PENDING_APPROVAL'
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: 'Product created and pending approval',
      data: newProduct
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

const getProducts = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { q, status } = req.query;

    const query = { vendor: vendorId };
    if (q) {
      query['basicDetails.name'] = { $regex: q, $options: 'i' };
    }
    if (status && status !== 'ALL') {
      query.status = status;
    }

    const products = await VendorProduct.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;
    const product = await VendorProduct.findOne({ _id: id, vendor: vendorId });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;
    const { 
      name, brandName, description, highlights, 
      oilType, refiningType, extractionMethod, packagingType, isOrganic, fssaiLicenseNo, hsnCode, shelfLifeDays, 
      nutrition, variants 
    } = req.body;

    const product = await VendorProduct.findOne({ _id: id, vendor: vendorId });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Update Basic Details
    if (name !== undefined) product.set('basicDetails.name', name);
    if (brandName !== undefined) product.set('basicDetails.brandName', brandName);
    if (description !== undefined) product.set('basicDetails.description', description);
    if (highlights) {
      const sanitizedHighlights = Array.isArray(highlights) 
        ? highlights.map(h => typeof h === 'string' ? { text: h } : { text: h?.text || '' }).filter(h => h.text.trim())
        : [];
      product.set('basicDetails.highlights', sanitizedHighlights);
    }

    // Update Compliance
    if (oilType !== undefined) product.set('compliance.oilType', oilType);
    if (refiningType !== undefined) product.set('compliance.refiningType', refiningType);
    if (extractionMethod !== undefined) product.set('compliance.extractionMethod', extractionMethod);
    if (packagingType !== undefined) product.set('compliance.packagingType', packagingType);
    if (isOrganic !== undefined) product.set('compliance.isOrganic', Boolean(isOrganic));
    if (fssaiLicenseNo !== undefined) product.set('compliance.fssaiLicenseNo', fssaiLicenseNo);
    if (hsnCode !== undefined) product.set('compliance.hsnCode', hsnCode);
    if (shelfLifeDays !== undefined) product.set('compliance.shelfLifeDays', Number(shelfLifeDays));

    // Update Nutrition
    if (nutrition) {
      if (nutrition.energy !== undefined) product.set('nutrition.energy', Number(nutrition.energy));
      if (nutrition.totalFat !== undefined) product.set('nutrition.totalFat', Number(nutrition.totalFat));
      if (nutrition.saturatedFat !== undefined) product.set('nutrition.saturatedFat', Number(nutrition.saturatedFat));
      if (nutrition.transFat !== undefined) product.set('nutrition.transFat', Number(nutrition.transFat));
      if (nutrition.mufa !== undefined) product.set('nutrition.mufa', Number(nutrition.mufa));
      if (nutrition.pufa !== undefined) product.set('nutrition.pufa', Number(nutrition.pufa));
      if (nutrition.cholesterol !== undefined) product.set('nutrition.cholesterol', Number(nutrition.cholesterol));
    }

    // Update Variants
    if (variants && Array.isArray(variants)) {
      const sanitizedVariants = variants.map((v, i) => ({
        size: String(v.size || '1'),
        unit: String(v.unit || 'Litre'),
        sku: String(v.sku || `SKU-${Date.now()}-${i + 1}`),
        price: Number(v.price) || 0,
        mrp: Number(v.mrp) || 0,
        initialStock: Number(v.initialStock) || 0,
        currentStock: Number(v.currentStock ?? v.initialStock ?? 0),
        lowStockThreshold: Number(v.lowStockThreshold) || 10
      }));
      product.set('variants', sanitizedVariants);
    }

    await product.save();
    res.json({ success: true, message: 'Product updated successfully', data: product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

const getInventory = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { q, status, page = 1, limit = 20 } = req.query;

    const query = { vendor: vendorId };
    if (q) {
      query.$or = [
        { 'basicDetails.name': { $regex: q, $options: 'i' } },
        { 'variants.sku': { $regex: q, $options: 'i' } }
      ];
    }

    const products = await VendorProduct.find(query).sort({ createdAt: -1 });

    let allRows = [];
    let summary = {
      all: 0,
      inStock: 0,
      lowStock: 0,
      outOfStock: 0
    };

    products.forEach(p => {
      p.variants.forEach(v => {
        const physical = Number(v.currentStock) || 0;
        const threshold = Number(v.lowStockThreshold) || 10;
        let stockStatus = 'IN_STOCK';
        if (physical === 0) {
          stockStatus = 'OUT_OF_STOCK';
          summary.outOfStock++;
        } else if (physical <= threshold) {
          stockStatus = 'LOW_STOCK';
          summary.lowStock++;
        } else {
          summary.inStock++;
        }
        summary.all++;

        allRows.push({
          variantId: v._id,
          productId: p._id,
          productName: p.basicDetails.name,
          skuCode: v.sku || 'N/A',
          variantLabel: `${v.size} ${v.unit}`,
          physicalStock: physical,
          reserved: 0,
          available: physical,
          stockStatus: stockStatus,
          lowStockThreshold: threshold
        });
      });
    });

    // Apply status filter if present
    if (status && status !== 'ALL') {
      allRows = allRows.filter(r => r.stockStatus === status);
    }

    const total = allRows.length;
    const startIndex = (Number(page) - 1) * Number(limit);
    const paginatedRows = allRows.slice(startIndex, startIndex + Number(limit));

    res.json({
      success: true,
      data: {
        rows: paginatedRows,
        summary
      },
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)) || 1
      }
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

const InventoryLedger = require('../models/InventoryLedger');

const adjustVariantStock = async (req, res) => {
  try {
    const { variantId } = req.params;
    const { mode, quantity, reason } = req.body;
    const vendorId = req.user.id;

    const product = await VendorProduct.findOne({ 
      vendor: vendorId, 
      'variants._id': variantId 
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Variant not found' });
    }

    const variant = product.variants.id(variantId);
    const qty = Number(quantity) || 0;
    const beforeStock = variant.currentStock;

    if (mode === 'ADD') {
      variant.currentStock += qty;
    } else if (mode === 'SUBTRACT') {
      variant.currentStock = Math.max(0, variant.currentStock - qty);
    }

    await product.save();

    // Write to ledger
    await InventoryLedger.create({
      vendorId,
      productId: product._id,
      variantId,
      type: mode === 'ADD' ? 'RESTOCK' : 'MANUAL_ADJUSTMENT',
      delta: mode === 'ADD' ? qty : -Math.min(qty, beforeStock),
      before: beforeStock,
      after: variant.currentStock,
      reason: reason || 'Manual stock adjustment',
      actor: 'Vendor'
    });

    const threshold = Number(variant.lowStockThreshold) || 10;
    let stockStatus = 'IN_STOCK';
    if (variant.currentStock === 0) stockStatus = 'OUT_OF_STOCK';
    else if (variant.currentStock <= threshold) stockStatus = 'LOW_STOCK';

    res.json({
      success: true,
      data: {
        variantId: variant._id,
        physicalStock: variant.currentStock,
        available: variant.currentStock,
        stockStatus
      }
    });
  } catch (error) {
    console.error('Adjust stock error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

const updateThreshold = async (req, res) => {
  try {
    const { variantId } = req.params;
    const { lowStockThreshold } = req.body;
    const vendorId = req.user.id;

    const product = await VendorProduct.findOne({ 
      vendor: vendorId, 
      'variants._id': variantId 
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Variant not found' });
    }

    const variant = product.variants.id(variantId);
    variant.lowStockThreshold = Number(lowStockThreshold) || 10;
    await product.save();

    res.json({
      success: true,
      data: {
        variantId: variant._id,
        lowStockThreshold: variant.lowStockThreshold
      }
    });
  } catch (error) {
    console.error('Update threshold error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

const getLedger = async (req, res) => {
  try {
    const { variantId, page = 1, limit = 10, type = 'ALL' } = req.query;
    const vendorId = req.user.id;

    const query = {};
    if (variantId && variantId !== 'ALL') {
      query.variantId = variantId;
    }

    if (type && type !== 'ALL') {
      query.type = type;
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const ledgers = await InventoryLedger.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await InventoryLedger.countDocuments(query);

    const rows = ledgers.map(l => {
      // Basic relative time formatter
      const diffMs = Date.now() - new Date(l.createdAt).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      let relativeTime = 'Just now';
      if (diffDays > 0) relativeTime = `${diffDays}d ago`;
      else if (diffHours > 0) relativeTime = `${diffHours}h ago`;
      else if (diffMins > 0) relativeTime = `${diffMins}m ago`;

      const createdAtDate = new Date(l.createdAt);

      return {
        id: l._id,
        exactTime: createdAtDate.toLocaleString(),
        date: createdAtDate.toLocaleDateString(),
        time: createdAtDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        relativeTime,
        type: l.type,
        delta: l.delta,
        before: l.before,
        after: l.after,
        reason: l.reason,
        actor: l.actor
      };
    });

    res.json({
      success: true,
      data: {
        rows,
        meta: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get ledger error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

const exportInventory = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const products = await VendorProduct.find({ vendor: vendorId });
    
    let csv = 'Product Name,Category,SKU,Size/Variant,Physical Stock,Reserved,Available,Status\n';
    
    products.forEach(p => {
      p.variants.forEach(v => {
        const physical = v.currentStock || 0;
        const reserved = v.reservedStock || 0;
        const available = physical - reserved;
        const threshold = v.lowStockThreshold || 10;
        
        let status = 'IN_STOCK';
        if (available <= 0) status = 'OUT_OF_STOCK';
        else if (available <= threshold) status = 'LOW_STOCK';
        
        csv += `"${p.name}","${p.category}","${v.skuCode}","${v.size}","${physical}","${reserved}","${available}","${status}"\n`;
      });
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('inventory.csv');
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Export failed' });
  }
};

const uploadProductImages = async (req, res) => {
  try {
    const { id } = req.params;
    const vendorId = req.user.id;

    const product = await VendorProduct.findOne({ _id: id, vendor: vendorId });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updates = {};
    if (req.files && req.files.mainImage && req.files.mainImage[0]) {
      updates['images.mainImage'] = {
        url: req.files.mainImage[0].path,
        publicId: req.files.mainImage[0].filename
      };
    }

    if (req.files && req.files.gallery) {
      const galleryImages = req.files.gallery.map(file => ({
        url: file.path,
        publicId: file.filename
      }));
      if (product.images && product.images.gallery) {
        updates['images.gallery'] = [...product.images.gallery, ...galleryImages];
      } else {
        updates['images.gallery'] = galleryImages;
      }
    }

    if (Object.keys(updates).length > 0) {
      Object.keys(updates).forEach(key => {
        product.set(key, updates[key]);
      });
      await product.save();
    }

    res.json({ success: true, message: 'Images uploaded successfully', data: product });
  } catch (error) {
    console.error('Upload product images error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

module.exports = {
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
};
