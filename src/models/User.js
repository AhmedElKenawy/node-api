// src/models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  }
},
{ timestamps: true}
);

const User = mongoose.model('User', userSchema);

module.exports = User;
