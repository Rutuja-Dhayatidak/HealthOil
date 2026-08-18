const Cart = require('../models/Cart');

// Get current user's cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    let cart = await Cart.findOne({ user: userId });
    
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }
    
    res.json({ success: true, items: cart.items });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const newItem = req.body; // { id, name, brand, variant, price, qty, image }
    
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }
    
    const existingItemIndex = cart.items.findIndex(
      item => item.id === newItem.id && item.variant === newItem.variant
    );
    
    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].qty += (newItem.qty || 1);
    } else {
      cart.items.push(newItem);
    }
    
    await cart.save();
    res.json({ success: true, items: cart.items });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Update item quantity
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id, variant, amount } = req.body;
    
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    
    const itemIndex = cart.items.findIndex(
      item => item.id === id && item.variant === variant
    );
    
    if (itemIndex > -1) {
      const newQty = cart.items[itemIndex].qty + amount;
      if (newQty > 0) {
        cart.items[itemIndex].qty = newQty;
      } else {
        // If qty goes to 0 or below, we can either keep it at 1 or remove it. We'll keep it at 1 to match frontend Math.max(1, ...)
        cart.items[itemIndex].qty = 1;
      }
      await cart.save();
    }
    
    res.json({ success: true, items: cart.items });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id, variant } = req.body;
    
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    
    cart.items = cart.items.filter(
      item => !(item.id === id && item.variant === variant)
    );
    
    await cart.save();
    res.json({ success: true, items: cart.items });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Merge guest cart with user cart on login
exports.mergeCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { guestItems } = req.body; // array of items from frontend local storage
    
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }
    
    if (guestItems && Array.isArray(guestItems) && guestItems.length > 0) {
      for (const guestItem of guestItems) {
        const existingItemIndex = cart.items.findIndex(
          item => item.id === guestItem.id && item.variant === guestItem.variant
        );
        
        if (existingItemIndex > -1) {
          cart.items[existingItemIndex].qty += (guestItem.qty || 1);
        } else {
          cart.items.push(guestItem);
        }
      }
      await cart.save();
    }
    
    res.json({ success: true, items: cart.items });
  } catch (error) {
    console.error('Error merging cart:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
