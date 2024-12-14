const express = require("express");
const Brand = require("../../models/brands.model");
const Product = require("../../models/products.model");
const cloudinary = require("../../cloudinary");
const upload = require("../../multer");
const router = express.Router();

// Display the product creation form with available brands
router.get("/admin/products/create", async (req, res) => {
    try {
        const brands = await Brand.find().populate("brandName"); // Populate brand names
        res.render("./admin/createForm", {
            layout: "adminLayout",
            pageTitle: "Products Management",
            brands,
        });
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
});

// Handle product creation with image upload to Cloudinary
router.post("/admin/products/create", upload.single("productImage"), async (req, res) => {
    try {
        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "products", // Cloudinary folder for storing images
        });

        // Create and save a new product
        const newProduct = new Product({
            title: req.body.title,
            description: req.body.description,
            price: req.body.price,
            productImage: result.secure_url, // Cloudinary URL for the uploaded image
            brand: req.body.brand,
        });

        await newProduct.save();
        res.redirect("/admin"); // Redirect to products list after success
    } catch (error) {
        res.status(500).send(`Error uploading file: ${error.message}`);
    }
});

// Handle product deletion by ID
router.get("/admin/products/delete/:_id", async (req, res) => {
    try {
        const { _id } = req.params;
        await Product.findByIdAndDelete(_id); // Delete the product by its ID
        res.redirect("/admin");
    } catch (error) {
        res.status(500).send(`Error deleting product: ${error.message}`);
    }
});

// Display the product edit form with existing product data and available brands
router.get("/admin/products/edit/:_id", async (req, res) => {
    try {
        const { _id } = req.params;

        // Fetch the product by ID
        const product = await Product.findById(_id);

        // Fetch all available brands
        const brands = await Brand.find();

        // Render the edit form, passing both product and brands
        res.render("admin/product-edit-form", {
            layout: "adminLayout",
            pageTitle: "Edit Product",
            product,
            brands, // Pass brands to the EJS template
        });
    } catch (error) {
        res.status(500).send(`Error fetching product or brands: ${error.message}`);
    }
});
// Handle product update
router.post("/admin/products/edit/:_id", async (req, res) => {
    try {
        const { _id } = req.params;
        const { title, description, type, price } = req.body;

        await Product.findByIdAndUpdate(
            _id,
            { title, description, type, price }, // Updated fields
            { new: true } // Return updated document
        );
        res.redirect("/admin"); // Redirect to the products list after updating
    } catch (error) {
        res.status(500).send(`Error updating product: ${error.message}`);
    }
});

module.exports = router;
