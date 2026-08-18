const Vendor = require('../models/Vendor');

const saveBusinessDetails = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.user.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    
    vendor.business = req.body;
    vendor.onboardingStatus = 'BUSINESS_DETAILS_PENDING';
    await vendor.save();
    
    res.json({ success: true, message: 'Business details saved' });
  } catch (error) {
    console.error('Save business error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const uploadDocument = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.user.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const { documentType } = req.body;
    vendor.documents.push({
      documentType,
      fileLocation: req.file.path
    });
    
    vendor.onboardingStatus = 'DOCUMENTS_PENDING';
    await vendor.save();
    
    res.json({ success: true, message: `${documentType} uploaded successfully` });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const savePickupAddress = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.user.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    
    vendor.pickupAddress = req.body;
    vendor.onboardingStatus = 'PICKUP_DETAILS_PENDING';
    await vendor.save();
    
    res.json({ success: true, message: 'Pickup address saved' });
  } catch (error) {
    console.error('Save pickup error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const saveBankDetails = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.user.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    
    vendor.bank = req.body;
    vendor.onboardingStatus = 'BANK_DETAILS_PENDING';
    await vendor.save();
    
    res.json({ success: true, message: 'Bank details saved' });
  } catch (error) {
    console.error('Save bank error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const submitApplication = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.user.id);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    
    vendor.onboardingStatus = 'UNDER_REVIEW';
    vendor.submittedAt = new Date();
    await vendor.save();
    
    res.json({ success: true, message: 'Application submitted for review' });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { saveBusinessDetails, uploadDocument, savePickupAddress, saveBankDetails, submitApplication };
