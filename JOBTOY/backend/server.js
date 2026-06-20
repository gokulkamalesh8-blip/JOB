const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. IMPORT THE DATABASE CONNECTION FUNCTION
const connectDB = require('./config/database');

const app = express();

// 2. CALL THE FUNCTION TO CONNECT TO MONGODB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ... rest of your routes and server.js code stays the same ...