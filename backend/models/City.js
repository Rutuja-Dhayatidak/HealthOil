const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Area/Sub-city name is required'], 
    trim: true 
  },
  pincode: { 
    type: String, 
    trim: true, 
    default: '' 
  },
  displayOrder: { 
    type: Number, 
    default: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

const citySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'City name is required'], 
    trim: true 
  },
  state: { 
    type: String, 
    trim: true, 
    default: '' 
  },
  image: { 
    type: String, 
    default: '' 
  },
  displayOrder: { 
    type: Number, 
    default: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  areas: [areaSchema]
}, { timestamps: true });

citySchema.index({ name: 1 });
citySchema.index({ displayOrder: 1, createdAt: -1 });

module.exports = mongoose.model('City', citySchema);
