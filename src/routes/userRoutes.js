// src/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// User routes
router.post('/', userController.createUser);
router.get('/', userController.getAllUsers);
router.get('/:userId', userController.getUserById);
router.patch('/:id', userController.editUser);
router.delete('/:id', userController.deleteUserById);

module.exports = router;
