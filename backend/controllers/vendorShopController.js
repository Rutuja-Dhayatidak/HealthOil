const Vendor = require('../models/Vendor');

exports.getStoreProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.user.id);
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    res.json({
      success: true,
      data: {
        fullName: vendor.fullName,
        mobile: vendor.mobile,
        vendorStatus: vendor.vendorStatus,
        business: vendor.business,
        pickupAddress: vendor.pickupAddress,
        storeProfile: vendor.storeProfile || {},
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
    const { storeName, description, businessCategory, address, pickupAddress, socialLinks, vendorStatus, openTime, closeTime, operatingDays } = req.body;
    
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

    await vendor.save();

    res.json({ success: true, message: 'Store profile updated successfully' });
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
    if (req.files) {
      if (req.files.logo && req.files.logo[0]) {
        updates.logo = req.files.logo[0].path;
      }
      if (req.files.banner && req.files.banner[0]) {
        updates.banner = req.files.banner[0].path;
      }
    }

    if (Object.keys(updates).length > 0) {
      if (updates.logo) vendor.set('storeProfile.logo', updates.logo);
      if (updates.banner) vendor.set('storeProfile.banner', updates.banner);

      await vendor.save();
    }

    res.json({ success: true, message: 'Images uploaded successfully', data: updates });
  } catch (error) {
    console.error('Error uploading store images:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error', stack: error.stack });
  }
};
