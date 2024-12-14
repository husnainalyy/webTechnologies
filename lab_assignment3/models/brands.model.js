const mongoose = require("mongoose");

// Define the Brand schema
const brandSchema = new mongoose.Schema({
    brandName: {
        type: String,
        required: [true, 'Brand name is required'],
    },
    brandImage: {
        type: String,
        required: [true, 'Brand image is required'],
    },
});

// Define the Brand model
const Brand = mongoose.model("Brand", brandSchema);

// Export Brand model
module.exports = Brand;
