const Wishlist = require('../models/Wishlist');

// Get current user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, items: [] });
    }

    res.json({ success: true, items: wishlist.items });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Add item to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const newItem = req.body; // { id, name, brand, variant, price, image }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, items: [] });
    }

    const existingIndex = wishlist.items.findIndex(item => item.id === newItem.id);
    if (existingIndex === -1) {
      wishlist.items.push(newItem);
      await wishlist.save();
    }

    res.json({ success: true, items: wishlist.items });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Remove item from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const id = req.body.id || req.params.id;

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    wishlist.items = wishlist.items.filter(item => item.id !== id);
    await wishlist.save();

    res.json({ success: true, items: wishlist.items });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
