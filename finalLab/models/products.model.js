const  mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String, required: true
    }, 
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', required: true
    }, 
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand', required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String
    },
    images: [{ type: String }], 
    stock: {
        type: Number,
        default: 0
    }, 
    dimensions: {
        width: { type: Number },
        height: { type: Number },
        depth: { type: Number },
    },
    materials: [{ type: String }], 
    colors: [{ type: String }],
    rating: {
        type: Number,
        min: 0,
        max: 5
    }, 
    createdAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Product', productSchema);
