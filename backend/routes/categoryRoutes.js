import express from 'express';
import Category from '../models/Category.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let categories = await Category.find();
    if (categories.length === 0) {
      const defaults = [
        { name: 'Vegetable', description: 'Fresh vegetables' },
        { name: 'Fruits', description: 'Fresh fruits' },
        { name: 'Grocery', description: 'General grocery items' },
        { name: 'Toys', description: 'Kids toys and games' }
      ];
      categories = await Category.insertMany(defaults);
    }
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = new Category({ name, description });
    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      category.name = req.body.name || category.name;
      category.description = req.body.description || category.description;
      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      await category.deleteOne();
      res.json({ message: 'Category removed' });
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
