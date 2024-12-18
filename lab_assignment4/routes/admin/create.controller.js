const express = require("express");
const Brand = require("../../models/brands.model");
const Product = require("../../models/products.model");
const cloudinary = require("../../cloudinary");
const upload = require("../../multer");
const categoryModel = require("../../models/category.model");
const router = express.Router();

// Display the product creation form with available brands
router.get("/admin/products/create", async (req, res) => {
    try {
        const brands = await Brand.find().populate("name"); // Populate brand names
        const categories = await categoryModel.find();
        res.render("./admin/createForm", {
            layout: "adminLayout",
            pageTitle: "Products Management",
            brands,
            categories, 
        });
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
});

// Handle product creation with image upload to Cloudinary
router.post("/admin/products/create", upload.array("productImage", 5), async (req, res) => {
    try {
        const imageUrls = [];
        for (const file of req.files) {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: "products",
            });
            imageUrls.push(result.secure_url); // Push Cloudinary URL for each image
        }

        const newProduct = new Product({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            stock: req.body.stock,
            category: req.body.category, // Ensure category is passed from the form
            brand: req.body.brand, // Ensure brand is passed from the form
            dimensions: {
                width: req.body.dimensions.width,
                height: req.body.dimensions.height,
                depth: req.body.dimensions.depth,
            },
            materials: req.body.materials.split(","),
            colors: req.body.colors.split(","),
            images: imageUrls, // Store multiple images
        });

        await newProduct.save();
        res.redirect("/admin"); // Redirect to products list after success
    } catch (error) {
        res.status(500).send(`Error creating product: ${error.message}`);
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
