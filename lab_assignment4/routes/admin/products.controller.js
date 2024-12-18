const express = require("express");
let router = express.Router();
const Product = require("../../models/products.model");
const brandsModel = require("../../models/brands.model");
const categoryModel = require("../../models/category.model");

// Admin dashboard to display products and brands
router.get('/admin', async (req, res) => {
    try {
        // Get query parameters for sorting, filtering, and pagination
        const { category, brand, sortBy, sortOrder, search, page = 1, limit = 10 } = req.query;

        // Default values for sorting
        const sortOptions = {};
        if (sortBy) {
            sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        }

        // Build query object for filtering
        const filterQuery = {};
        if (category) filterQuery.category = category; // Filter by category
        if (brand) filterQuery.brand = brand; // Filter by brand
        if (search) filterQuery.name = { $regex: search, $options: 'i' }; // Search by product name (case-insensitive)

        // Fetch total products count (for pagination)
        const totalProducts = await Product.countDocuments(filterQuery);

        // Pagination - Determine total pages and products per page
        const totalPages = Math.ceil(totalProducts / limit);
        const skip = (page - 1) * limit;

        // Fetch products with filtering, sorting, and pagination
        const products = await Product.find(filterQuery)
            .populate('category')   // Populate the category field
            .populate('brand')      // Populate the brand field
            .sort(sortOptions)      // Apply sorting
            .skip(skip)             // Skip based on page number
            .limit(parseInt(limit)); // Limit results per page

        // Fetch brands and categories for the filter options
        const brands = await brandsModel.find();
        const categories = await categoryModel.find();

        // Render the admin page with the products, brands, categories, and query parameters
        res.render('./admin/products', {
            layout: 'adminLayout',
            pageTitle: 'Admin Dashboard',
            products,
            brands,
            categories,
            selectedCategory: category,
            selectedBrand: brand,
            sortBy,
            sortOrder,
            search,
            currentPage: page,
            totalPages,
            totalProducts,
            limit
        });
    } catch (error) {
        res.status(500).send(`Error fetching dashboard data: ${error.message}`);
    }
});

module.exports = router;
