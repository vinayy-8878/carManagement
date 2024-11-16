import express, { Router } from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { store, createUser, findUserByEmail, findUserById, createCar, updateCar, deleteCar, findCarsByUserId, findCarById, searchCars } from '../../server/db/store';

const api = express();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  },
});

// Middleware
api.use(cors());
api.use(express.json());

// Auth middleware
const auth = (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    const user = findUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Auth routes
const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingUser = findUserByEmail(trimmedEmail);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = createUser(trimmedEmail, hashedPassword);

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    const userResponse = {
      id: user.id,
      email: user.email
    };

    res.status(201).json({ token, user: userResponse });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const user = findUserByEmail(trimmedEmail);
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    const userResponse = {
      id: user.id,
      email: user.email
    };

    res.json({ token, user: userResponse });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// Cars routes
const carsRouter = Router();

carsRouter.get('/', auth, (req: any, res) => {
  try {
    const cars = findCarsByUserId(req.userId);
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch cars' });
  }
});

carsRouter.get('/search', auth, (req: any, res) => {
  try {
    const { q, tags } = req.query;
    const parsedTags = tags ? tags.split(',') : [];
    const cars = searchCars(req.userId, q, parsedTags);
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: 'Search failed' });
  }
});

carsRouter.post('/', auth, upload.array('images', 10), (req: any, res) => {
  try {
    const { title, description } = req.body;
    const tags = JSON.parse(req.body.tags || '[]');
    
    // Convert uploaded files to base64 strings
    const images = (req.files || []).map((file: any) => {
      const base64 = file.buffer.toString('base64');
      return `data:${file.mimetype};base64,${base64}`;
    });

    const car = createCar({
      title,
      description,
      tags,
      images,
      userId: req.userId,
    });

    res.status(201).json(car);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add car' });
  }
});

carsRouter.put('/:id', auth, upload.array('images', 10), (req: any, res) => {
  try {
    const car = findCarById(req.params.id);
    if (!car || car.userId !== req.userId) {
      return res.status(404).json({ message: 'Car not found' });
    }

    const update: any = {};
    if (req.body.title) update.title = req.body.title;
    if (req.body.description) update.description = req.body.description;
    if (req.body.tags) update.tags = JSON.parse(req.body.tags);

    if (req.files?.length > 0) {
      update.images = req.files.map((file: any) => {
        const base64 = file.buffer.toString('base64');
        return `data:${file.mimetype};base64,${base64}`;
      });
    }

    const updatedCar = updateCar(req.params.id, update);
    res.json(updatedCar);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update car' });
  }
});

carsRouter.delete('/:id', auth, (req: any, res) => {
  try {
    const car = findCarById(req.params.id);
    if (!car || car.userId !== req.userId) {
      return res.status(404).json({ message: 'Car not found' });
    }

    deleteCar(req.params.id);
    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete car' });
  }
});

// Mount routes
api.use('/auth', authRouter);
api.use('/cars', carsRouter);

// Export handler
export const handler = serverless(api);