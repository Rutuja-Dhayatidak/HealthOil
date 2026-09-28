const mongoose = require('mongoose');

const rightSidebarNewsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    badgeText: {
      type: String,
      trim: true,
      default: ''
    },
    image: {
      type: String,
      required: [true, 'Image is required']
    },
    cloudinaryId: {
      type: String,
      default: ''
    },
    linkType: {
      type: String,
      enum: ['Product', 'Offer', 'Blog', 'Custom URL'],
      default: 'Product'
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'VendorProduct',
      default: null
    },
    blogId: {
      type: String,
      default: ''
    },
    customUrl: {
      type: String,
      trim: true,
      default: ''
    },
    benefits: {
      type: [String],
      default: []
    },
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    startDate: {
      type: Date,
      default: null
    },
    endDate: {
      type: Date,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexing for rapid queries
rightSidebarNewsSchema.index({ order: 1, isActive: 1 });

module.exports = mongoose.model('RightSidebarNews', rightSidebarNewsSchema);
