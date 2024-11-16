import express from 'express';
import multer from 'multer';
import { auth } from '../middleware/auth.js';
import { createCar, updateCar, deleteCar, findCarsByUserId, findCarById, searchCars } from '../db/store.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Get all cars for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const cars = findCarsByUserId(req.userId);
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search cars
router.get('/search', auth, async (req, res) => {
  try {
    const { q, tags } = req.query;
    const parsedTags = tags ? tags.split(',') : [];
    const cars = searchCars(req.userId, q, parsedTags);
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new car
router.post('/', auth, upload.array('images', 10), async (req, res) => {
  try {
    const { title, description } = req.body;
    const tags = JSON.parse(req.body.tags || '[]');
    const images = req.files.map(file => `/uploads/${file.filename}`);

    const car = createCar({
      title,
      description,
      tags,
      images,
      userId: req.userId,
    });

    res.status(201).json(car);
  } catch (error) {
    console.error('Error creating car:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a car
router.put('/:id', auth, upload.array('images', 10), async (req, res) => {
  try {
    const { title, description } = req.body;
    const tags = JSON.parse(req.body.tags || '[]');
    const update = { title, description, tags };

    if (req.files?.length > 0) {
      update.images = req.files.map(file => `/uploads/${file.filename}`);
    }

    const car = updateCar(req.params.id, update);

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json(car);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a car
router.delete('/:id', auth, async (req, res) => {
  try {
    const car = findCarById(req.params.id);
    if (!car || car.userId !== req.userId) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Delete associated images
    car.images.forEach(imagePath => {
      const fullPath = join(__dirname, '../..', imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });

    deleteCar(req.params.id);
    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;