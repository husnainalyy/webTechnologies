const express = require('express');
const Brand = require('../../models/brands.model'); // Adjust path as needed
const cloudinary = require('../../cloudinary'); // Adjust path to your cloudinary config
const upload = require('../../multer'); // Adjust path to your multer configuration
const router = express.Router();

// Render the brand creation form
router.get('/admin/brands/create', (req, res) => {
    res.render('./admin/brandForm', {
        layout: 'adminLayout',
        pageTitle: 'Brands Management',
    });
});

// Handle brand creation with image upload and website URL
router.post('/admin/brands/create', upload.single('brandImage'), async (req, res) => {
    try {
        // Ensure brand name and image are received
        if (!req.body.name || !req.file) {
            return res.status(400).send({ error: 'Brand name and logo are required.' });
        }

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'brands',
        });

        // Create new brand with provided name, logo URL, and optional website URL
        const newBrand = new Brand({
            name: req.body.name,            // Brand name from the form
            logo: result.secure_url,        // Cloudinary image URL
            website: req.body.brandWebsite,      // Brand website URL (optional)
        });

        // Save brand to the database
        await newBrand.save();

        // Redirect to the admin dashboard after successful creation
        res.redirect('/admin');
    } catch (error) {
        console.error('Error creating brand:', error);
        res.status(500).send({ error: error.message });
    }
});

// Route to fetch all brands for admin view
router.get('/admin/brands', async (req, res) => {
    try {
        const brands = await Brand.find();
        res.render('./admin/brands', {
            layout: 'adminLayout',
            pageTitle: 'Manage Brands',
            brands,
        });
    } catch (error) {
        res.status(500).send(`Error fetching brands: ${error.message}`);
    }
});

// Route to fetch all brands with pagination for admin view
router.get('/admin/brands', async (req, res) => {
    try {
        // Get the current page from query params, default to 1 if not provided
        const currentPage = parseInt(req.query.page) || 1;
        const itemsPerPage = 10; // Number of brands per page

        // Fetch total number of brands to calculate total pages
        const totalBrands = await Brand.countDocuments();
        const totalPages = Math.ceil(totalBrands / itemsPerPage);

        // Fetch brands for the current page with pagination
        const brands = await Brand.find()
            .skip((currentPage - 1) * itemsPerPage) // Skip the previous pages
            .limit(itemsPerPage); // Limit the number of items per page

        res.render('./admin/brands', {
            layout: 'adminLayout',
            pageTitle: 'Manage Brands',
            brands,
            currentPage,
            totalPages,
        });
    } catch (error) {
        res.status(500).send(`Error fetching brands: ${error.message}`);
    }
});



module.exports = router;
