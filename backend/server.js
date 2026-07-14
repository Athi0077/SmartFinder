import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import layoutRoutes from './routes/layoutRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);
 
dotenv.config(); 
  
connectDB(); 
 
const app = express();  

app.use(cors());
app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/layout', layoutRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
  res.send('Supermarket API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
