// ================================
// server.js — Main Express Server
// Mobile Ads Van — Backend API
// ================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ================================
// SECURITY MIDDLEWARE
// ================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' } // allow images to load
}));

// Rate limiting — 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});
app.use('/api/', limiter);

// ================================
// GENERAL MIDDLEWARE
// ================================
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev')); // request logging

// ================================
// STATIC FILES
// Serve uploaded media files
// ================================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend (if hosting together)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Serve admin panel
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));

// ================================
// API ROUTES
// ================================
const authRoutes = require('./routes/auth');
const enquiriesRoutes = require('./routes/enquiries');
const mediaRoutes = require('./routes/media');
const settingsRoutes = require('./routes/settings');

app.use('/api/auth', authRoutes);           // Auth: login, verify, change-password
app.use('/api/enquiries', enquiriesRoutes); // Leads/enquiries
app.use('/api/media', mediaRoutes);         // Media upload/manage
app.use('/api', settingsRoutes);            // Settings, packages, dashboard stats

// ================================
// HEALTH CHECK
// ================================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Mobile Ads Van API is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ================================
// CATCH-ALL: serve frontend
// ================================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ================================
// ERROR HANDLER
// ================================
app.use((err, req, res, next) => {
  console.error('Global error:', err.message);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: `File too large. Max ${process.env.MAX_FILE_SIZE_MB || 20}MB allowed.` });
  }

  return res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
});

// ================================
// START SERVER
// ================================
app.listen(PORT, () => {
  console.log('\n🚐 ================================');
  console.log(`   Mobile Ads Van API`);
  console.log(`   Running on http://localhost:${PORT}`);
  console.log(`   Admin panel: http://localhost:${PORT}/admin`);
  console.log(`   Environment: ${process.env.NODE_ENV}`);
  console.log('================================\n');
});

module.exports = app;
