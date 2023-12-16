
const User = require("../models/User");

const getAllUsers = async (req, res) => {
  
  try {
    const { page = 1, pageSize } = req.query;

    if(pageSize){
      const skip = (page - 1) * pageSize;
      const users = await User.find().skip(skip).limit(Number(pageSize));
      const totalCount = await User.countDocuments();
      res.json({ result: users, totalCount });
    }else{
      const users = await User.find()
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
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new user
const createUser = async (req, res) => {
  const { name, mobile } = req.body;
  try {
    const newUser = new User({ name, mobile });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const editUser = async (req, res) => {
  const { name, mobile } = req.body;
  const { id } = req.params;
  try {
    if (id) {
      const savedUser = await User.updateOne({ _id: id }, { name, mobile });
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
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully', deletedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  editUser,
  deleteUserById
};
