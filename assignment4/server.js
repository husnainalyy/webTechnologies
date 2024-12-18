const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
mongoose.set("strictPopulate", false);

dotenv.config({ path: ".env.local" }); // Load environment variables

// Initialize the Express server
const server = express();


// Load models and routes
const Product = require("./models/products.model");
const adminProductsRouter = require("./routes/admin/products.controller");
const createRouter = require("./routes/admin/create.controller");
const brandController = require("./routes/admin/brand.controller");
const categoryController = require("./routes/admin/category.controller")
const allProductController = require("./routes/website/allproducts.controller")
const cartController = require("./routes/website/cart.controller")
const adminOrdersRouter = require("./routes/admin/orders.controllers")
// Middleware setup
server.use(expressLayouts);
server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(express.static("public")); // Serve static files

// Route handlers
server.use(adminProductsRouter);
server.use(createRouter);
server.use(brandController);
server.use(categoryController)
server.use(allProductController)
server.use(cartController)
server.use(adminOrdersRouter)




// EJS view engine configuration
server.set("view engine", "ejs");


// Session and Cookie Parsers (IMPORTANT: Load these BEFORE auth middleware)
const cookieParser = require("cookie-parser");
server.use(cookieParser());

const session = require("express-session");
server.use(
    session({
        secret: process.env.SECRET || "my_secret", // Use a strong, unique secret
        resave: false, // Avoid resaving unchanged sessions
        saveUninitialized: false, // Only save sessions with data
        cookie: { secure: false }, // Use secure: true in production (with HTTPS)
    })
);

// Custom Middleware
const siteMiddleware = require("./middlewares/site-middleware");
server.use(siteMiddleware);

const authMiddleware = require("./middlewares/auth-middleware");
const adminMiddleware = require("./middlewares/admin-middleware");

// Authentication Routes (POST for login/register)
const authRouter = require("./routes/auth.controller");
server.use(authRouter);



const portfolioController = require("./routes/portfolio/portfolio.controller");
server.use("/about-me", portfolioController);

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
