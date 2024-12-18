const mongoose  = require("mongoose");

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }, // e.g., 'Ikea', 'Ashley Furniture'
    logo: {
        type: String
    }, // Optional: URL to the brand's logo
    website: {
        type: String
    }, // Optional: Brand's official website
    createdAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Brand', brandSchema);
