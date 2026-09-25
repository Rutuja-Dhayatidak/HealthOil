const Vendor = require('../models/Vendor');

exports.getStoreProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.user.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const logo = vendor.storeProfile?.logo || vendor.business?.logo || '';
    const banner = vendor.storeProfile?.banner || '';

    res.json({
      success: true,
      data: {
        fullName: vendor.fullName,
        mobile: vendor.mobile,
        vendorStatus: vendor.vendorStatus,
        business: vendor.business,
        pickupAddress: vendor.pickupAddress,
        storeProfile: {
          ...(vendor.storeProfile ? (vendor.storeProfile.toObject ? vendor.storeProfile.toObject() : vendor.storeProfile) : {}),
          logo,
          banner
        },
        openTime: vendor.storeProfile?.openTime || '',
        closeTime: vendor.storeProfile?.closeTime || '',
        operatingDays: vendor.storeProfile?.operatingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      }
    });
  } catch (error) {
    console.error('Error fetching store profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateStoreProfile = async (req, res) => {
  try {
    const { 
      storeName, 
      description, 
      businessCategory, 
      address, 
      pickupAddress, 
      socialLinks, 
      vendorStatus, 
      openTime, 
      closeTime, 
      operatingDays,
      logo,
      banner
    } = req.body;
    
    const vendor = await Vendor.findById(req.user.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    // Update specific fields
    if (storeName) {
      vendor.set('business.storeName', storeName);
    }
    
    if (address) {
      const currentAddress = vendor.business ? vendor.business.address : {};
      vendor.set('business.address', { ...currentAddress, ...address });
    }

    if (pickupAddress) {
      const currentPickup = vendor.pickupAddress || {};
      vendor.set('pickupAddress', { ...currentPickup, ...pickupAddress });
    }

    if (description !== undefined) vendor.set('storeProfile.description', description);
    if (businessCategory !== undefined) vendor.set('storeProfile.businessCategory', businessCategory);
    if (socialLinks !== undefined) vendor.set('storeProfile.socialLinks', socialLinks);
    if (openTime !== undefined) vendor.set('storeProfile.openTime', openTime);
    if (closeTime !== undefined) vendor.set('storeProfile.closeTime', closeTime);
    if (operatingDays !== undefined) vendor.set('storeProfile.operatingDays', operatingDays);
    if (logo !== undefined && logo !== null) {
      vendor.set('storeProfile.logo', logo);
      vendor.set('business.logo', logo);
    }
    if (banner !== undefined && banner !== null) {
      vendor.set('storeProfile.banner', banner);
    }

    await vendor.save();

    res.json({ 
      success: true, 
      message: 'Store profile updated successfully',
      data: {
        storeProfile: vendor.storeProfile,
        business: vendor.business,
        pickupAddress: vendor.pickupAddress
      }
    });
  } catch (error) {
    console.error('Error updating store profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.uploadStoreImages = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.user.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const updates = {};
    if (Array.isArray(req.files)) {
      req.files.forEach(file => {
        const fileUrl = file.path || file.secure_url || file.url || file.filename;
        if (file.fieldname === 'logo' || file.fieldname === 'image') {
          updates.logo = fileUrl;
        } else if (file.fieldname === 'banner' || file.fieldname === 'cover') {
          updates.banner = fileUrl;
        }
      });
    } else if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        updates.logo = req.files.logo[0].path || req.files.logo[0].secure_url || req.files.logo[0].url || req.files.logo[0].filename;
      }
      if (req.files.banner && req.files.banner[0]) {
        updates.banner = req.files.banner[0].path || req.files.banner[0].secure_url || req.files.banner[0].url || req.files.banner[0].filename;
      }
    }

    if (req.file) {
      const fileUrl = req.file.path || req.file.secure_url || req.file.url || req.file.filename;
      if (req.body.type === 'logo' || req.file.fieldname === 'logo') {
        updates.logo = fileUrl;
      } else {
        updates.banner = fileUrl;
      }
    }

    if (Object.keys(updates).length > 0) {
      if (updates.logo) {
        vendor.set('storeProfile.logo', updates.logo);
        vendor.set('business.logo', updates.logo);
      }
      if (updates.banner) {
        vendor.set('storeProfile.banner', updates.banner);
      }

      await vendor.save();
    }

    res.json({ 
      success: true, 
      message: 'Store images uploaded and saved successfully', 
      data: updates 
    });
  } catch (error) {
    console.error('Error uploading store images:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error', stack: error.stack });
  }
};
