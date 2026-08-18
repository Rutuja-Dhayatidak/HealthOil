const WebsiteUser = require('../models/WebsiteUser');
const MobileUser = require('../models/MobileUser');

const getModel = (platform) => platform === 'mobile' ? MobileUser : WebsiteUser;
const Otp = require('../models/Otp');
const { sendEmail } = require('../utils/email');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtp = async (req, res) => {
  try {
    const { email, platform = 'website' } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const Model = getModel(platform);

    // Check if user already exists
    const existingUser = await Model.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'User already exists' });

    const otpCode = generateOtp();
    
    // Save or update OTP
    await Otp.findOneAndUpdate(
      { email },
      { otp: otpCode, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    // Send OTP email
    await sendEmail(email, 'Your HealthOil Verification Code', `Your OTP is ${otpCode}. It is valid for 5 minutes.`);

    res.json({ success: true, message: 'OTP sent successfully to email' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, otp, platform = 'website' } = req.body;

    if (!name || !email || !phone || !password || !otp) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const Model = getModel(platform);

    // Verify OTP
    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Check again if user exists
    const existingUser = await Model.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new Model({
      name,
      email,
      phone,
      password: hashedPassword
    });

    await newUser.save();

    // Delete used OTP
    await Otp.deleteOne({ email });

    // Generate JWT
    const token = jwt.sign(
      { id: newUser._id, platform }, 
      process.env.JWT_SECRET || 'secret', 
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const sendForgotPasswordOtp = async (req, res) => {
  try {
    const { email, platform = 'website' } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const Model = getModel(platform);

    // Check if user exists
    const existingUser = await Model.findOne({ email });
    if (!existingUser) return res.status(404).json({ success: false, message: 'User not found' });

    const otpCode = generateOtp();
    
    await Otp.findOneAndUpdate(
      { email },
      { otp: otpCode, createdAt: Date.now() },
      { upsert: true, new: true }
    );

    await sendEmail(email, 'Password Reset Code', `Your password reset OTP is ${otpCode}. It is valid for 5 minutes.`);

    res.json({ success: true, message: 'OTP sent successfully to email' });
  } catch (error) {
    console.error('Forgot password OTP error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, platform = 'website' } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const Model = getModel(platform);

    // Verify OTP
    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await Model.findOneAndUpdate({ email }, { password: hashedPassword });

    // Delete used OTP
    await Otp.deleteOne({ email });

    res.json({ success: true, message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const Model = getModel(req.user.platform);
    const user = await Model.findById(req.user._id).select('-password');
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password, platform = 'website' } = req.body;
    const Model = getModel(platform);
    const user = await Model.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        success: true,
        token: jwt.sign(
          { id: user._id, platform }, 
          process.env.JWT_SECRET || 'secret', 
          { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        ),
        user: { id: user._id, name: user.name, email: user.email, phone: user.phone }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { sendOtp, registerUser, sendForgotPasswordOtp, resetPassword, getUserProfile, loginUser };
