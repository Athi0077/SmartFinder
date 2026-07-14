import express from 'express';
import Order from '../models/Order.js';

const router = express.Router();

// Get all orders (Admin)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().populate('items.product').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get orders by array of IDs (User History)
router.post('/history', async (req, res) => {
  try {
    const { orderIds } = req.body;
    if (!orderIds || !Array.isArray(orderIds)) {
      return res.status(400).json({ message: 'Invalid order IDs provided' });
    }
    const orders = await Order.find({ _id: { $in: orderIds } }).populate('items.product').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new order (User)
router.post('/', async (req, res) => {
  try {
    const { customerName, mobileNo, address, items, totalAmount } = req.body;
    const newOrder = new Order({
      customerName,
      mobileNo,
      address,
      items,
      totalAmount
    });
    
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update order status (Admin)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
