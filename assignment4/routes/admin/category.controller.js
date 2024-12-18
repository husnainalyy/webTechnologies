const express = require('express');
const Category = require('../../models/category.model');
const router = express.Router();




// Render the category creation form
router.get('/admin/categories/create', (req, res) => {
    res.render('./admin/categoryForm', {
        layout: 'adminLayout',
        pageTitle: 'Category Management',
    });
});

// Handle category creation
router.post('/admin/categories/create', async (req, res) => {
    try {
        const newCategory = new Category({
            name: req.body.name,
            description: req.body.description,
        });

        await newCategory.save();
        res.redirect('/admin/categories');
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).send({ error: error.message });
    }
});

// Route to fetch all categories for admin view with pagination (3 categories per page)
router.get('/admin/categories', async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Get the page number from query or default to 1
    const limit = 3; // Number of categories per page
    const skip = (page - 1) * limit;

    try {
        const categories = await Category.find()
            .skip(skip)
            .limit(limit);

        const count = await Category.countDocuments(); // Get total count of categories

        res.render('./admin/categories', {
            layout: 'adminLayout',
            pageTitle: 'Manage Categories',
            categories,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
        });
    } catch (error) {
        res.status(500).send(`Error fetching categories: ${error.message}`);
    }
});

// Route to edit a category (get the edit form)
router.get('/admin/categories/edit/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);  // Fetch the category from the DB
        if (!category) {
            return res.status(404).send('Category not found');
        }

        // Pass the category object to the view
        res.render('./admin/categoryForm', {
            layout: 'adminLayout',
            pageTitle: 'Edit Category',
            category,  // Make sure to pass the category object here
        });
    } catch (error) {
        res.status(500).send(`Error fetching category: ${error.message}`);
    }
});



// Handle category update
router.post('/admin/categories/edit/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).send('Category not found');
        }

        category.name = req.body.name;
        category.description = req.body.description;

        await category.save();
        res.redirect('/admin/categories');
    } catch (error) {
        res.status(500).send(`Error updating category: ${error.message}`);
    }
});

// Handle category deletion
router.get('/admin/categories/delete/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).send('Category not found');
        }

        res.redirect('/admin/categories');
    } catch (error) {
        res.status(500).send(`Error deleting category: ${error.message}`);
    }
});

module.exports = router;
