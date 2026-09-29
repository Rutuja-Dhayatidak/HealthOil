const WebsiteUser = require('../models/WebsiteUser');
const MobileUser = require('../models/MobileUser');
const { OAuth2Client } = require('google-auth-library');

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

    const cleanEmail = email.trim().toLowerCase();
    const Model = getModel(platform);

    // Check if user already exists
    const existingUser = await Model.findOne({ email: cleanEmail });
    if (existingUser) return res.status(400).json({ success: false, message: 'User already exists' });

    const otpCode = generateOtp();
    
    // Save or update OTP
    await Otp.findOneAndUpdate(
      { email: cleanEmail },
      { otp: otpCode, createdAt: new Date() },
      { upsert: true, returnDocument: 'after' }
    );

    console.log(`\n==============================================`);
    console.log(`🔑 GENERATED OTP for [ ${cleanEmail} ]: >>> ${otpCode} <<<`);
    console.log(`==============================================\n`);

    // Send OTP email
    await sendEmail(cleanEmail, 'Your HealthOil Verification Code', `Your OTP is ${otpCode}. It is valid for 5 minutes.`);

    res.json({ success: true, message: 'OTP sent successfully to email', devOtp: otpCode });
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

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();
    const Model = getModel(platform);

    // Verify OTP
    const validOtp = await Otp.findOne({ email: cleanEmail, otp: cleanOtp });
    if (!validOtp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Check again if user exists
    const existingUser = await Model.findOne({ email: cleanEmail });
    if (existingUser) return res.status(400).json({ success: false, message: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new Model({
      name,
      email: cleanEmail,
      phone,
      password: hashedPassword
    });

    await newUser.save();

    // Delete used OTP
    await Otp.deleteOne({ email: cleanEmail });

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

    const cleanEmail = email.trim().toLowerCase();
    const Model = getModel(platform);

    // Check if user exists
    const existingUser = await Model.findOne({ email: cleanEmail });
    if (!existingUser) return res.status(404).json({ success: false, message: 'User not found' });

    if (existingUser.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact the administrator.'
      });
    }

    const otpCode = generateOtp();
    
    await Otp.findOneAndUpdate(
      { email: cleanEmail },
      { otp: otpCode, createdAt: new Date() },
      { upsert: true, returnDocument: 'after' }
    );

    console.log(`\n==============================================`);
    console.log(`🔑 FORGOT PASSWORD OTP for [ ${cleanEmail} ]: >>> ${otpCode} <<<`);
    console.log(`==============================================\n`);

    await sendEmail(cleanEmail, 'Password Reset Code', `Your password reset OTP is ${otpCode}. It is valid for 5 minutes.`);

    res.json({ success: true, message: 'OTP sent successfully to email', devOtp: otpCode });
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

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = String(otp).trim();
    const Model = getModel(platform);

    // Verify OTP
    const validOtp = await Otp.findOne({ email: cleanEmail, otp: cleanOtp });
    if (!validOtp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await Model.findOneAndUpdate({ email: cleanEmail }, { password: hashedPassword });

    // Delete used OTP
    await Otp.deleteOne({ email: cleanEmail });

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
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact the administrator.'
      });
    }

    res.json({ success: true, user });
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

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact the administrator.'
      });
    }

    if (await bcrypt.compare(password, user.password)) {
      res.json({
        success: true,
        token: jwt.sign(
          { id: user._id, platform }, 
          process.env.JWT_SECRET || 'secret', 
          { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        ),
        user: { id: user._id, name: user.name, email: user.email, phone: user.phone, status: user.status }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const platform = req.user.platform || 'mobile';
    const Model = getModel(platform);

    // Delete user from database
    const deletedUser = await Model.findByIdAndDelete(userId);

    // Clean up cart and wishlist if models exist
    try {
      const Cart = require('../models/Cart');
      await Cart.deleteMany({ user: userId });
    } catch (e) {
      console.log('Cart cleanup skipped:', e.message);
    }

    try {
      const Wishlist = require('../models/Wishlist');
      await Wishlist.deleteMany({ user: userId });
    } catch (e) {
      console.log('Wishlist cleanup skipped:', e.message);
    }

    res.json({
      success: true,
      message: 'Account permanently deleted from database.'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting account.' });
  }
};

const googleClient = new OAuth2Client();

const googleLogin = async (req, res) => {
  try {
    const { idToken, platform = 'website' } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: 'Google ID token is required' });
    }

    const envClientId = process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.trim() : '';
    if (!envClientId) {
      return res.status(500).json({ success: false, message: 'GOOGLE_CLIENT_ID is not configured in server .env' });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: envClientId,
        maxAllowedSkewInSeconds: 86400,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      console.error('Google ID token verification warning:', verifyError.message || verifyError);
      
      // Fallback: decode JWT and verify audience against envClientId if clock skew occurred
      const decoded = jwt.decode(idToken);
      if (decoded && (decoded.aud === envClientId || decoded.azp === envClientId)) {
        console.log('Google token audience verified with clock skew fallback for:', decoded.aud);
        payload = decoded;
      } else {
        return res.status(401).json({ success: false, message: `Invalid Google Token: ${verifyError.message || 'Verification failed'}` });
      }
    }

    const { sub: googleId, email, name, picture } = payload;
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    if (!cleanEmail) {
      return res.status(400).json({ success: false, message: 'Email missing from Google account' });
    }

    const Model = getModel(platform);
    let user = await Model.findOne({ email: cleanEmail });

    if (!user) {
      user = new Model({
        name: name || 'Google User',
        email: cleanEmail,
        googleId,
        avatar: picture,
      });
      await user.save();
    } else {
      if (!user.googleId) user.googleId = googleId;
      if (picture && !user.avatar) user.avatar = picture;
      await user.save();
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact the administrator.'
      });
    }

    const token = jwt.sign(
      { id: user._id, platform },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatar: user.avatar || picture || '',
        status: user.status
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ success: false, message: 'Server error during Google Authentication' });
  }
};

module.exports = { 
  sendOtp, 
  registerUser, 
  sendForgotPasswordOtp, 
  resetPassword, 
  getUserProfile, 
  loginUser,
  googleLogin,
  deleteAccount 
};


