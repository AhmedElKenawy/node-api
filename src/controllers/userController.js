// src/controllers/userController.js

const User = require('../models/User');

// Controller for handling user-related operations

// Get all users
const getAllUsers = async (req, res) => {
  const { page = 1, pageSize = 10 } = req.query;
  const skip = (page - 1) * pageSize;

  try {
    const users = await User.find()
      .skip(skip)
      .limit(Number(pageSize));
      const totalCount = await User.countDocuments()
    res.json({result : users , totalCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new user
const createUser = async (req, res) => {
  const { name, mobile  } = req.body;
  try {
    const newUser = new User({ name, mobile  });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
};
