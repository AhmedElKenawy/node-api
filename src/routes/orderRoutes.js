// src/routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Get all orders with pagination
router.get('/', orderController.getAllOrders);

// Get order by ID
router.get('/weekly-report', orderController.getWeeklyReport);
router.get('/:id', orderController.getOrderById);

// Create a new order
router.post('/', orderController.createOrder);

// Update order by ID
router.patch('/:id', orderController.updateOrderById);
router.delete('/:id', orderController.deleteOrderById);

module.exports = router;
