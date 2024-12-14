const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" }); // Load environment variables

// Initialize the Express server
const server = express();

// Load models and routes
const Product = require("./models/products.model");
const adminProductsRouter = require("./routes/admin/products.controller");
const createRouter = require("./routes/admin/create.controller");
const portfolioController = require("./routes/portfolio/portfolio.controller");
const brandController = require("./routes/admin/brand.controller");

// Middleware setup
server.use(expressLayouts);
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(express.static("public")); // Serve static files

// Route handlers
server.use(adminProductsRouter);
server.use(createRouter);
server.use(portfolioController);
server.use(brandController);

// EJS view engine configuration
server.set("view engine", "ejs");

// Home route
server.get("/", (req, res) => {
    res.render("wood-n-steel");
});



// MongoDB connection
mongoose
    .connect(process.env.MONGODB_CONNECTION_STRING)
    .then(() => {
        console.log(`Connected to MongoDB at: ${process.env.MONGODB_CONNECTION_STRING}`);
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error.message);
    });

// Start the server
server.listen(5400, () => {
    console.log("Server is running at http://localhost:5400");
});
