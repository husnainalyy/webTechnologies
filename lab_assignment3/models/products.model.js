const mongoose = require("mongoose");
// Define the Product schema
const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",  // Reference to Brand model (note corrected capitalization)
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    productImage: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
});

// Define the Product model
const Product = mongoose.model("Product", productSchema);

// Export Product model
module.exports = Product;