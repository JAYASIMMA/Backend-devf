import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';
import sequelize from './config/database';
import authRoutes from './routes/authRoutes';
import schoolRoutes from './routes/schoolRoutes';
import bookingRoutes from './routes/bookingRoutes';
import parentRoutes from './routes/parentRoutes';
import adminRoutes from './routes/adminRoutes';
import adminManagementRoutes from './routes/adminManagementRoutes';
import reviewRoutes from './routes/reviewRoutes';
import defineAssociations from './models/associations';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Uploads directory handling removed for S3 migration
// app.use('/uploads', express.static(uploadsDir));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Special Nest API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin-management', adminManagementRoutes);
app.use('/api/reviews', reviewRoutes);

import { initRecurringSlotCron } from './services/recurringSlotService';
// Define Associations
defineAssociations();

// Sync Database
sequelize.sync({ alter: true })
    .then(() => {
        console.log('Database connected & synced successfully.');
        initRecurringSlotCron();
    })
    .catch((err: any) => {
        console.error('Unable to connect to the database:', err);
    });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}. `);
});