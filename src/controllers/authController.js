const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
const secretKey = 'shabacy-apiR'

// Register a new user
const register =  async (req, res) => {
  try {
    const user = new Admin(req.body);
    await user.save();
    const token = jwt.sign({ userId: user.id },secretKey , { expiresIn: '265d' });
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
    const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn:  '265d' });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getUserByToken = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getAllUsers = async (req, res) => {
  
  try {
    const { page = 1, pageSize } = req.query;

    if(pageSize){
      const skip = (page - 1) * pageSize;
      const users = await Admin.find().skip(skip).limit(Number(pageSize));
      const totalCount = await Admin.countDocuments();
      res.json({ result: users, totalCount });
    }else{
      const users = await Admin.find()
      res.json(users);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await Admin.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new user
const createUser = async (req, res) => {
  try {
    const newUser = new Admin(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



const editUser = async (req, res) => {
  const { id } = req.params;
  try {
    if (id) {
      const savedUser = await Admin.updateOne({ _id: id }, req.body);
      res.status(201).json(savedUser);
    } else {
      res.status(201).json("Missing Id ");
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await Admin.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({ message: 'Admin deleted successfully', deletedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  register , 
  login ,
  getAllUsers,
  getUserById,
  createUser,
  editUser,
  deleteUserById,
  getUserByToken
};
