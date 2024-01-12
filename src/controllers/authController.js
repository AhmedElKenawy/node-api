const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const secretKey = 'shabacy-apiR'

// Register a new user
const register =  async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = new Admin({ name, email, password });
    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id },secretKey , { expiresIn: '265d' });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  } 
}


// Login user
const login =  async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Admin.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid Credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid Credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  register , 
  login
};
