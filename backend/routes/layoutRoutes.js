import express from 'express';
import Layout from '../models/Layout.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let layout = await Layout.findOne();
    if (!layout) {
      layout = await Layout.create({}); // Create default if none exists
    }
    res.json(layout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const { rows, columns, shelves, walls } = req.body;
    let layout = await Layout.findOne();
    
    if (layout) {
      layout.set('rows', rows || layout.rows);
      layout.set('columns', columns || layout.columns);
      layout.set('shelves', shelves || layout.shelves);
      layout.set('walls', walls || layout.walls);
      const updatedLayout = await layout.save();
      res.json(updatedLayout);
    } else {
      layout = await Layout.create({ rows, columns, shelves, walls });
      res.status(201).json(layout);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// "Delete" for layout could just reset it to defaults
router.delete('/', async (req, res) => {
    try {
        await Layout.deleteMany({});
        const defaultLayout = await Layout.create({});
        res.json(defaultLayout);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
