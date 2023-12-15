// src/routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Order routes

router.get('/', orderController.getAllOrders);
router.get('/:orderId', orderController.getOrderById);
router.post('/', orderController.createOrder);

module.exports = router;
