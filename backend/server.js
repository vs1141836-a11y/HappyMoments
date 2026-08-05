import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import decorRoutes from './routes/decorRoutes.js';
import rentalRoutes from './routes/rentalRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

// Middleware imports
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

// Connect to Database
connectDB().then(async () => {
  if (global.isMockDB) return;
  try {
    const Category = (await import('./models/Category.js')).default;
    const count = await Category.countDocuments();
    if (count === 0) {
      console.log('Database connected but empty. Automatically seeding live database...');
      const { seedData } = await import('./seeder.js');
      await seedData();
    } else {
      console.log(`Database connected and healthy. Found ${count} categories.`);
    }
  } catch (err) {
    console.error('Database auto-seeding check failed:', err);
  }
});

const app = express();

// Enable CORS
app.use(cors());

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Get Directory Name in ES Module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mount Local Uploads Static Directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check / API Landing Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to HappyMoments Event Booking Platform API' });
});

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/decorations', decorRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
