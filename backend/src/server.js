const express = require('express');
const cors = require('cors');
const path = require('path');
require('mysql2');
require('dotenv').config();

const { connectMySQL } = require('./config/mysql');
const { connectMongoDB } = require('./config/mongodb');
const { seedDefaultAdmin } = require('./seeders/defaultAdminSeed');
const { seedUsersFromJson } = require('./utils/userJsonStore');
const indexRoute = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    // Allow local development and any Vercel deployments
    if (origin === 'http://localhost:3000' || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let isConnected = false;
const initDb = async () => {
  if (!isConnected) {
    await connectMySQL();
    await seedDefaultAdmin();
    await seedUsersFromJson();
    await connectMongoDB();
    isConnected = true;
  }
};

// Middleware to ensure DB connections in serverless environments
app.use(async (req, res, next) => {
  try {
    await initDb();
    next();
  } catch (error) {
    console.error("Database connection error in middleware:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Static folder untuk file upload
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api', indexRoute);
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/air-quality', require('./routes/airQuality'));
app.use('/api/traffic', require('./routes/traffic'));
app.use('/api/transport', require('./routes/transport'));
app.use('/api/facilities', require('./routes/facilities'));
app.use('/api/city-services', require('./routes/cityServices'));
app.use('/api/public-services', require('./routes/publicServices'));
app.use('/api/trash', require('./routes/trash'));
app.use('/api/admin', require('./routes/admin'));

//SERVE REACT BUILD (untuk mode demo/production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist', 'index.html'));
  });
}

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  initDb().then(() => {
    app.listen(PORT, () => {
      console.log(`Server berjalan di http://localhost:${PORT}`);
      console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
    });
  }).catch(err => {
    console.error("Gagal memulai server:", err);
  });
}

module.exports = app;
