import cartModel from "../models/cart.models.js";


export const addToCart = async (req, res) => {
    try {
      const { userId, productId, quantity } = req.body;
  
      let cart = await cartModel.findOne({ user: userId });
  
      if (!cart) {
        cart = new cartModel({ user: userId, items: [] });
      }
  
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );
  
      if (existingItem) {
        existingItem.quantity += quantity || 1;
      } else {
        cart.items.push({ product: productId, quantity: quantity || 1 });
      }
  
      await cart.save();
      res.status(200).json({ success: true, cart });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
  export const getCart = async (req, res) => {
    try {
      const { userId } = req.params;
      const cart = await cartModel.findOne({ user: userId }).populate("items.product");
      res.status(200).json({ success: true, cart });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  export const updateCartQuantity = async (req, res) => {
    try {
      const { userId, productId, quantity } = req.body;
      const cart = await cartModel.findOne({ user: userId });
  
      if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });
  
      const item = cart.items.find((item) => item.product.toString() === productId);
      if (item) {
        item.quantity = quantity;
      }
  
      await cart.save();
      res.status(200).json({ success: true, cart });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  
  export const removeFromCart = async (req, res) => {
    try {
      const { userId, productId } = req.body;
      const cart = await cartModel.findOne({ user: userId });
  
      if (!cart) return res.status(404).json({ success: false, message: "cartModel not found" });
  
      cart.items = cart.items.filter((item) => item.product.toString() !== productId);
      await cart.save();
  
      res.status(200).json({ success: true, cart });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  