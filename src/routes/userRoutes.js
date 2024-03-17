// src/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require("../middleware/authMiddleware");

// User routes
router.post('/', userController.createUser);
router.get('/',authMiddleware , userController.getAllUsers);
router.patch('/add-balance/:id', userController.addBalance);
router.get('/:userId', userController.getUserById);
router.patch('/:id', userController.editUser);
router.delete('/:id', userController.deleteUserById);

module.exports = router;
