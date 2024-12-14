const express = require("express");
let router = express.Router();
const Product = require("../../models/products.model");

// Route to display all products in the admin panel
router.get("/admin", async (req, res) => {
    try {
        const products = await Product.find(); // Fetch all products from the database
        res.render("./admin/products", {
            layout: "adminLayout",
            pageTitle: "Products Management",
            products, // Pass the products to the view
        });
    } catch (error) {
        res.status(500).send(`Error fetching products: ${error.message}`);
    }
});

module.exports = router;
