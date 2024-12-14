const express = require('express');
const Brand = require('../../models/brands.model');
const cloudinary = require('../../cloudinary');  // If needed, import Cloudinary
const upload = require('../../multer');  // Multer configuration
const router = express.Router();

// Render the brand creation form
router.get('/admin/brands/create', (req, res) => {
    res.render('./admin/brandForm', {
        layout: 'adminLayout',
        pageTitle: 'Brands Management',
    });
});

// Handle brand creation with image upload
router.post('/admin/brands/create', upload.single('brandImage'), async (req, res) => {
    try {
        // Debugging: Check if file is uploaded and body data is sent correctly
        console.log('Uploaded file:', req.file);
        console.log('Request body:', req.body);

        // Check if file upload was successful
        if (!req.file) {
            throw new Error('File upload failed. Please check Cloudinary and Multer configuration.');
        }
        // Create a new brand object with the uploaded image and brand name
        const newBrand = new Brand({
            brandImage: req.file.path,  // URL of the uploaded image
            brandName: req.body.brandName,
        });

        // Save the new brand to the database
        await newBrand.save();

        // Redirect to the products page after successful creation
        res.redirect('/admin');
    } catch (error) {
        // Log the error and send a response with a detailed error message
        console.error('Error creating brand:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
