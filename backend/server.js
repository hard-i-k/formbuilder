const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios'); // ✅ Added this line
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/formmaker', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    console.log('Please check your MongoDB URI in the .env file');
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/forms', require('./routes/forms'));

app.get('/', (req, res) => {
  res.json({ message: 'Form Maker API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

