const express = require('express');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

// Create a new category
router.post('/', categoryController.createCategory);

// Get all categories
router.get('/', categoryController.getAllCategories);

// Get a category by ID
router.get('/:id', categoryController.getCategoryById);

// Update a category by ID
router.put('/:id', categoryController.updateCategoryById);

// Delete a category by ID
router.delete('/:id', categoryController.deleteCategoryById);

module.exports = router;
