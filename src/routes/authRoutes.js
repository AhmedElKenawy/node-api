const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require("../middleware/authMiddleware");


router.post('/register', authController.register);
router.post('/login', authController.login);
router.get("/me", authMiddleware, authController.getUserByToken);
router.post('/', authController.createUser);
router.get('/', authMiddleware , authController.getAllUsers);
router.get('/:userId', authController.getUserById);
router.patch('/:id', authController.editUser);
router.delete('/:id', authController.deleteUserById);

module.exports = router;
