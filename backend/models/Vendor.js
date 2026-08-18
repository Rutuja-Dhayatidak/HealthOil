const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  vendorStatus: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
    default: 'INACTIVE'
  },
  
  onboardingStatus: {
    type: String,
    enum: [
      'CONTACT_VERIFICATION_PENDING',
      'OTP_VERIFIED',
      'BUSINESS_DETAILS_PENDING',
      'DOCUMENTS_PENDING',
      'PICKUP_DETAILS_PENDING',
      'BANK_DETAILS_PENDING',
      'UNDER_REVIEW',
      'APPROVED',
      'REJECTED'
    ],
    default: 'CONTACT_VERIFICATION_PENDING'
  },

  business: {
    storeName: String,
    legalBusinessName: String,
    businessType: String,
    gstNumber: String,
    panNumber: String,
    businessEmail: String,
    businessPhone: String,
    address: {
      addressLine1: String,
      addressLine2: String,
      landmark: String,
      city: String,
      state: String,
      pincode: String
    }
  },

  documents: [{
    documentType: {
      type: String,
      enum: ['PAN_CARD', 'GST_CERTIFICATE', 'BUSINESS_PROOF', 'OWNER_ID']
    },
    fileLocation: String,
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'PENDING'
    },
    uploadedAt: { type: Date, default: Date.now }
  }],

  pickupAddress: {
    contactName: String,
    mobile: String,
    addressLine1: String,
    addressLine2: String,
    landmark: String,
    city: String,
    state: String,
    pincode: String
  },

  bank: {
    accountHolderName: String,
    bankName: String,
    accountNumber: String,
    accountNumberLast4: String,
    ifscCode: String,
    accountType: String
  },

  storeProfile: {
    logo: String,
    banner: String,
    description: String,
    businessCategory: String,
    socialLinks: {
      facebook: String,
      instagram: String,
      website: String
    }
  },

  submittedAt: Date,
  approvedAt: Date,
  lastLoginAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Vendor', vendorSchema);
