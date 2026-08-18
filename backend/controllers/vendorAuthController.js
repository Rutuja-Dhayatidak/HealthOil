const Vendor = require('../models/Vendor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/email');

const registerVendor = async (req, res) => {
  try {
    const { fullName, email, mobile, password } = req.body;
    
    let vendor = await Vendor.findOne({ $or: [{ email }, { mobile }] });
    if (vendor) {
      return res.status(400).json({ success: false, message: 'Vendor with email or mobile already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    vendor = new Vendor({
      fullName,
      email,
      mobile,
      password: hashedPassword,
      onboardingStatus: 'CONTACT_VERIFICATION_PENDING'
    });
    
    await vendor.save();
    
    res.status(201).json({ success: true, message: 'Vendor registered successfully', vendorId: vendor._id });
  } catch (error) {
    console.error('Vendor registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const sendOtp = async (req, res) => {
  // Mock sending OTP
  res.json({ success: true, message: 'OTP sent to mobile and email' });
};

const verifyOtp = async (req, res) => {
  try {
    const { vendorId, otp } = req.body;
    
    if (otp !== '123456') {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ success: false, message: 'Vendor not found' });
    
    if (vendor.onboardingStatus === 'CONTACT_VERIFICATION_PENDING') {
      vendor.onboardingStatus = 'OTP_VERIFIED';
      await vendor.save();
    }
    
    const token = jwt.sign(
      { id: vendor._id, role: 'VENDOR' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );
    
    res.json({ success: true, message: 'OTP verified', token });
  } catch (error) {
    console.error('Vendor OTP verify error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const vendor = await Vendor.findOne({ email });
    
    if (vendor && (await bcrypt.compare(password, vendor.password))) {
      const token = jwt.sign(
        { id: vendor._id, role: 'VENDOR' },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '30d' }
      );
      
      res.json({
        success: true,
        token,
        data: {
          id: vendor._id,
          fullName: vendor.fullName,
          email: vendor.email,
          onboardingStatus: vendor.onboardingStatus,
          vendorStatus: vendor.vendorStatus
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid vendor credentials' });
    }
  } catch (error) {
    console.error('Vendor login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const vendor = await Vendor.findOne({ email });
    
    if (!vendor) {
      return res.status(404).json({ success: false, message: 'No vendor found with this email' });
    }
    
    const resetToken = jwt.sign(
      { id: vendor._id, type: 'reset' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );
    
    const resetLink = `http://localhost:5175/#/vendor/reset-password?token=${resetToken}`;
    const emailText = `Hello ${vendor.fullName},\n\nYou requested a password reset for your HealthOil Vendor account.\nClick the link below to reset your password:\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`;
    
    await sendEmail(email, 'HealthOil Vendor - Password Reset', emailText);
    
    res.json({ success: true, message: 'Password reset link sent to your email' });
  } catch (error) {
    console.error('Vendor forgot password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { registerVendor, sendOtp, verifyOtp, loginVendor, forgotPassword };
