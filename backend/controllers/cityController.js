const City = require('../models/City');
const Vendor = require('../models/Vendor');

// Admin: Get all cities with search, filter, and sorting (with vendor counts)
const getAllCities = async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { state: searchRegex },
        { 'areas.name': searchRegex },
        { 'areas.pincode': searchRegex }
      ];
    }

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const [cities, vendors] = await Promise.all([
      City.find(query).sort({ displayOrder: 1, createdAt: -1 }).lean(),
      Vendor.find({}, 'fullName business.storeName business.address vendorStatus').lean()
    ]);

    // Attach vendor counts to cities and areas
    const citiesWithVendorCounts = cities.map(city => {
      const cityRegex = new RegExp('^' + city.name.trim() + '$', 'i');
      const cityVendors = vendors.filter(v => {
        const vCity = (v.business?.address?.city || '').trim();
        return cityRegex.test(vCity) || vCity.toLowerCase().includes(city.name.toLowerCase());
      });

      const areasWithCounts = (city.areas || []).map(area => {
        const areaRegex = new RegExp('^' + area.name.trim() + '$', 'i');
        const areaVendors = cityVendors.filter(v => {
          const vSub = (v.business?.address?.subCity || '').trim();
          const vPin = (v.business?.address?.pincode || '').trim();
          const vAddr = ((v.business?.address?.addressLine1 || '') + ' ' + (v.business?.address?.addressLine2 || '')).toLowerCase();
          return areaRegex.test(vSub) || (area.pincode && vPin === area.pincode) || (area.name && vAddr.includes(area.name.toLowerCase()));
        });
        return {
          ...area,
          vendorCount: areaVendors.length
        };
      });

      return {
        ...city,
        vendorCount: cityVendors.length,
        areas: areasWithCounts
      };
    });

    const totalCities = await City.countDocuments();
    const activeCitiesCount = await City.countDocuments({ isActive: true });

    res.json({
      success: true,
      cities: citiesWithVendorCounts,
      totalCount: totalCities,
      activeCount: activeCitiesCount,
      filteredCount: cities.length
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cities', error: error.message });
  }
};

// Public: Get active cities for mobile/web apps
const getActiveCities = async (req, res) => {
  try {
    const cities = await City.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    // Filter active sub-areas as well
    const formatted = cities.map(c => ({
      ...c,
      areas: (c.areas || []).filter(a => a.isActive).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    }));

    res.json({
      success: true,
      cities: formatted
    });
  } catch (error) {
    console.error('Error fetching active cities:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch active cities', error: error.message });
  }
};

// Admin: Create a new city
const createCity = async (req, res) => {
  try {
    const { name, state, displayOrder, isActive, image: bodyImage } = req.body;

    if (!state || !state.trim()) {
      return res.status(400).json({ success: false, message: 'State selection is required' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'City selection is required' });
    }

    // Check if city already exists (case-insensitive)
    const existingCity = await City.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });

    if (existingCity) {
      return res.status(400).json({ success: false, message: 'City with this name already exists' });
    }

    // Determine image URL
    let imageUrl = '';
    if (req.file) {
      imageUrl = req.file.path || req.file.secure_url || req.file.url;
    } else if (bodyImage && typeof bodyImage === 'string') {
      imageUrl = bodyImage.trim();
    }

    const orderNum = displayOrder !== undefined && displayOrder !== '' ? Number(displayOrder) : 0;
    const activeBool = isActive !== undefined ? (isActive === true || isActive === 'true') : true;

    const newCity = new City({
      name: name.trim(),
      state: state.trim(),
      image: imageUrl,
      displayOrder: isNaN(orderNum) ? 0 : orderNum,
      isActive: activeBool,
      areas: []
    });

    await newCity.save();

    res.status(201).json({
      success: true,
      message: 'City created successfully',
      city: newCity
    });
  } catch (error) {
    console.error('Error creating city:', error);
    res.status(500).json({ success: false, message: 'Failed to create city', error: error.message });
  }
};

// Admin: Update city details
const updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, state, displayOrder, isActive, image: bodyImage } = req.body;

    const city = await City.findById(id);
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }

    if (state !== undefined) {
      if (!state.trim()) {
        return res.status(400).json({ success: false, message: 'State selection is required' });
      }
      city.state = state.trim();
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({ success: false, message: 'City selection is required' });
      }
      const duplicate = await City.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
      });
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'Another city with this name already exists' });
      }
      city.name = name.trim();
    }

    if (displayOrder !== undefined && displayOrder !== '') {
      const orderNum = Number(displayOrder);
      city.displayOrder = isNaN(orderNum) ? 0 : orderNum;
    }

    if (isActive !== undefined) {
      city.isActive = isActive === true || isActive === 'true';
    }

    if (req.file) {
      city.image = req.file.path || req.file.secure_url || req.file.url;
    } else if (bodyImage !== undefined) {
      city.image = bodyImage;
    }

    await city.save();

    res.json({
      success: true,
      message: 'City updated successfully',
      city
    });
  } catch (error) {
    console.error('Error updating city:', error);
    res.status(500).json({ success: false, message: 'Failed to update city', error: error.message });
  }
};

// Admin: Delete a city
const deleteCity = async (req, res) => {
  try {
    const { id } = req.params;
    const city = await City.findByIdAndDelete(id);

    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }

    res.json({
      success: true,
      message: 'City deleted successfully',
      cityId: id
    });
  } catch (error) {
    console.error('Error deleting city:', error);
    res.status(500).json({ success: false, message: 'Failed to delete city', error: error.message });
  }
};

// Admin: Toggle active/inactive status
const toggleCityStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const city = await City.findById(id);

    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }

    city.isActive = !city.isActive;
    await city.save();

    res.json({
      success: true,
      message: `City marked as ${city.isActive ? 'Active' : 'Inactive'}`,
      city
    });
  } catch (error) {
    console.error('Error toggling city status:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle status', error: error.message });
  }
};

// ==========================================
// Subcity / Area Controllers
// ==========================================

// Add Area to a City
const addArea = async (req, res) => {
  try {
    const { cityId } = req.params;
    const { name, pincode, displayOrder, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Area name is required' });
    }

    const cleanPincode = (pincode || '').trim();
    if (!cleanPincode || !/^\d{6}$/.test(cleanPincode)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 6-digit pincode.' });
    }

    const city = await City.findById(cityId);
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }

    // Check duplicate area under this city
    const normalizedName = name.trim().toLowerCase();
    const duplicate = (city.areas || []).some(a => a.name.trim().toLowerCase() === normalizedName);
    if (duplicate) {
      return res.status(400).json({ success: false, message: `Area "${name.trim()}" already exists in ${city.name}` });
    }

    const orderNum = displayOrder !== undefined && displayOrder !== '' ? Number(displayOrder) : (city.areas.length + 1);
    const activeBool = isActive !== undefined ? (isActive === true || isActive === 'true') : true;

    const newArea = {
      name: name.trim(),
      pincode: cleanPincode,
      displayOrder: isNaN(orderNum) ? 0 : orderNum,
      isActive: activeBool
    };

    city.areas.push(newArea);
    await city.save();

    res.status(201).json({
      success: true,
      message: `Area "${name.trim()}" added to ${city.name}`,
      city
    });
  } catch (error) {
    console.error('Error adding area:', error);
    res.status(500).json({ success: false, message: 'Failed to add area', error: error.message });
  }
};

// Update Area in a City
const updateArea = async (req, res) => {
  try {
    const { cityId, areaId } = req.params;
    const { name, pincode, displayOrder, isActive } = req.body;

    const city = await City.findById(cityId);
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }

    const area = city.areas.id(areaId);
    if (!area) {
      return res.status(404).json({ success: false, message: 'Area not found' });
    }

    if (name && name.trim()) {
      const normalizedName = name.trim().toLowerCase();
      const duplicate = city.areas.some(a => a._id.toString() !== areaId && a.name.trim().toLowerCase() === normalizedName);
      if (duplicate) {
        return res.status(400).json({ success: false, message: `Another area named "${name.trim()}" already exists in this city` });
      }
      area.name = name.trim();
    }

    if (pincode !== undefined) {
      const cleanPincode = pincode.trim();
      if (!cleanPincode || !/^\d{6}$/.test(cleanPincode)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid 6-digit pincode.' });
      }
      area.pincode = cleanPincode;
    }

    if (displayOrder !== undefined && displayOrder !== '') {
      const orderNum = Number(displayOrder);
      area.displayOrder = isNaN(orderNum) ? 0 : orderNum;
    }

    if (isActive !== undefined) {
      area.isActive = isActive === true || isActive === 'true';
    }

    await city.save();

    res.json({
      success: true,
      message: 'Area updated successfully',
      city
    });
  } catch (error) {
    console.error('Error updating area:', error);
    res.status(500).json({ success: false, message: 'Failed to update area', error: error.message });
  }
};

// Delete Area from a City
const deleteArea = async (req, res) => {
  try {
    const { cityId, areaId } = req.params;

    const city = await City.findById(cityId);
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }

    const area = city.areas.id(areaId);
    if (!area) {
      return res.status(404).json({ success: false, message: 'Area not found' });
    }

    city.areas.pull({ _id: areaId });
    await city.save();

    res.json({
      success: true,
      message: 'Area deleted successfully',
      city
    });
  } catch (error) {
    console.error('Error deleting area:', error);
    res.status(500).json({ success: false, message: 'Failed to delete area', error: error.message });
  }
};

// Toggle Area Status
const toggleAreaStatus = async (req, res) => {
  try {
    const { cityId, areaId } = req.params;

    const city = await City.findById(cityId);
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found' });
    }

    const area = city.areas.id(areaId);
    if (!area) {
      return res.status(404).json({ success: false, message: 'Area not found' });
    }

    area.isActive = !area.isActive;
    await city.save();

    res.json({
      success: true,
      message: `Area "${area.name}" marked as ${area.isActive ? 'Active' : 'Inactive'}`,
      city
    });
  } catch (error) {
    console.error('Error toggling area status:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle area status', error: error.message });
  }
};

// Admin: City-wise and Area-wise vendor distribution analytics
const getCityVendorDistribution = async (req, res) => {
  try {
    const cities = await City.find({}).sort({ displayOrder: 1, createdAt: -1 }).lean();
    const vendors = await Vendor.find({}, 'fullName business.storeName business.address vendorStatus createdAt').lean();

    const totalVendorsCount = vendors.length;

    const distribution = cities.map(city => {
      const cityRegex = new RegExp('^' + city.name.trim() + '$', 'i');
      const cityVendors = vendors.filter(v => {
        const vCity = (v.business?.address?.city || '').trim();
        return cityRegex.test(vCity) || vCity.toLowerCase().includes(city.name.toLowerCase());
      });

      const areaBreakdown = (city.areas || []).map(area => {
        const areaRegex = new RegExp('^' + area.name.trim() + '$', 'i');
        const areaVendors = cityVendors.filter(v => {
          const vSub = (v.business?.address?.subCity || '').trim();
          const vPin = (v.business?.address?.pincode || '').trim();
          const vAddr = ((v.business?.address?.addressLine1 || '') + ' ' + (v.business?.address?.addressLine2 || '')).toLowerCase();
          return areaRegex.test(vSub) || (area.pincode && vPin === area.pincode) || (area.name && vAddr.includes(area.name.toLowerCase()));
        });

        return {
          _id: area._id,
          name: area.name,
          pincode: area.pincode,
          isActive: area.isActive,
          vendorCount: areaVendors.length
        };
      });

      const mappedCount = areaBreakdown.reduce((sum, a) => sum + a.vendorCount, 0);

      return {
        _id: city._id,
        cityName: city.name,
        state: city.state,
        image: city.image,
        isActive: city.isActive,
        totalVendors: cityVendors.length,
        percentage: totalVendorsCount > 0 ? Math.round((cityVendors.length / totalVendorsCount) * 100) : 0,
        areas: areaBreakdown,
        unspecifiedAreaVendors: Math.max(0, cityVendors.length - mappedCount)
      };
    });

    res.json({
      success: true,
      totalVendors: totalVendorsCount,
      distribution
    });
  } catch (error) {
    console.error('Error fetching city vendor distribution:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch vendor distribution', error: error.message });
  }
};

module.exports = {
  getAllCities,
  getActiveCities,
  createCity,
  updateCity,
  deleteCity,
  toggleCityStatus,
  addArea,
  updateArea,
  deleteArea,
  toggleAreaStatus,
  getCityVendorDistribution
};

