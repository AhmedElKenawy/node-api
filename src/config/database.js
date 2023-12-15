// src/config/database.js

const mongoose = require('mongoose');

// Connection URI for local MongoDB instance
const MONGO_URI = 'mongodb://0.0.0.0:27017/shabacy';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

module.exports = {
  MONGO_URI,
};
