const express = require('express');
const productsModel = require('../../models/products.model');
const categoryModel = require('../../models/category.model');
let router = express.Router();

/**
 * Helper function to handle sorting
 */
const getSortOption = (sort) => {
    switch (sort) {
        case "price_asc":
            return { price: 1 }; // Sort by price ascending
        case "price_desc":
            return { price: -1 }; // Sort by price descending
        case "newest":
            return { createdAt: -1 }; // Sort by newest first
        default:
            return {}; // Default sort (no sorting applied)
    }
};

// Route to fetch products with filters, sort, and pagination
router.get("/products", async (req, res) => {
    try {
        const { search, category, sort, page = 1, limit = 10 } = req.query;

        // Fetch categories for the filter dropdown
        const categories = await categoryModel.find({}, { _id: 1, name: 1 }); // Adjust fields as needed

        // Create query object for filtering
        let query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }
        if (category) {
            query.category = category;
        }

        // Handle pagination
        const perPage = parseInt(limit, 10) || 10; // Items per page
        const currentPage = parseInt(page, 10) || 1;
        const skip = (currentPage - 1) * perPage;

        // Fetch products with applied filters, sorting, and pagination
        const sortOption = getSortOption(sort);
        const products = await productsModel
            .find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(perPage);

        // Count total products for pagination
        const total = await productsModel.countDocuments(query);

        // Render the products view with data
        res.render("Allproducts", {
            products,
            categories,
            total,
            currentPage,
            totalPages: Math.ceil(total / perPage),
            search,
            category,
            sort,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
