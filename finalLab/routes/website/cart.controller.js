const express = require('express');
const router = express.Router();
const Product = require('../../models/products.model');

// Middleware
const cookieParser = require('cookie-parser');
router.use(cookieParser());

const session = require('express-session');
const Order = require('../../models/order.model');
router.use(session({ secret: 'my session secret', resave: false, saveUninitialized: false }));

// Helper Function: Fetch Cart from Cookies
const getCartFromCookies = (req) => {
    return req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
};

// Helper Function: Save Cart to Cookies
const saveCartToCookies = (res, cart) => {
    res.cookie('cart', JSON.stringify(cart), { maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7-day expiry
};

// Helper Function: Calculate Total Price
const calculateTotalPrice = (products) => {
    return products.reduce((total, product) => total + product.price * product.quantity, 0);
};

// Route: View Cart
router.get('/cart', async (req, res) => {
    try {
        let cart = getCartFromCookies(req);

        // Fetch products based on cart IDs
        const productIds = cart.map(item => item.id);
        const products = await Product.find({ _id: { $in: productIds } }).populate('brand');

        // Map quantities from the cart
        const productsWithQuantities = products.map(product => {
            const cartItem = cart.find(item => item.id === product._id.toString());
            return {
                ...product._doc,
                quantity: cartItem ? cartItem.quantity : 1,
            };
        });

        const totalPrice = calculateTotalPrice(productsWithQuantities);

        // Render cart page
        res.render('cart', { products: productsWithQuantities, cart, totalPrice });
    } catch (err) {
        console.error('Error loading cart:', err);
        res.status(500).send('Server Error');
    }
});

// Route: Add to Cart
router.get('/cart/add-to-cart/:id', async (req, res) => {
    const productId = req.params.id;
    let cart = getCartFromCookies(req);

    // Check if product already exists in cart
    const productIndex = cart.findIndex(item => item.id === productId);
    if (productIndex > -1) {
        cart[productIndex].quantity += 1; // Increment quantity if exists
    } else {
        cart.push({ id: productId, quantity: 1 }); // Add new product
    }

    saveCartToCookies(res, cart);
    res.redirect('/cart'); // Redirect to cart page
});

// Route: Remove from Cart
router.get('/cart/remove/:id', (req, res) => {
    const productId = req.params.id;
    let cart = getCartFromCookies(req);

    // Filter out the product
    cart = cart.filter(item => item.id !== productId);

    saveCartToCookies(res, cart);
    res.redirect('/cart'); // Redirect to cart page
});

// Route: Checkout (GET)
router.get('/cart/checkout', async (req, res) => {
    try {
        let cart = getCartFromCookies(req);

        // Fetch products based on cart IDs
        const productIds = cart.map(item => item.id);
        const products = await Product.find({ _id: { $in: productIds } }).populate('brand');

        const productsWithQuantities = products.map(product => {
            const cartItem = cart.find(item => item.id === product._id.toString());
            return {
                ...product._doc,
                quantity: cartItem ? cartItem.quantity : 1,
            };
        });

        const totalPrice = calculateTotalPrice(productsWithQuantities);

        // Render checkout page
        res.render('checkout', {
            products: productsWithQuantities,
            totalPrice,
            user: req.session.user,
        });
    } catch (err) {
        console.error('Error during checkout:', err);
        res.status(500).send('Server Error');
    }
});


// Route: Update Quantity in Cart
router.post('/cart/update-quantity/:id', (req, res) => {
    const productId = req.params.id; // Get the product ID from the URL
    const { quantity } = req.body; // Get the quantity from the request body
    let cart = getCartFromCookies(req); // Retrieve the cart from cookies

    // Find the product in the cart
    const productIndex = cart.findIndex(item => item.id === productId);

    if (productIndex > -1) {
        // If the product exists in the cart
        if (quantity > 0) {
            // Update the quantity if it's greater than 0
            cart[productIndex].quantity = parseInt(quantity);
        } else {
            // If quantity is 0, remove the product from the cart
            cart = cart.filter(item => item.id !== productId);
        }
    }

    saveCartToCookies(res, cart); // Save the updated cart back to cookies
    res.redirect('/cart'); // Redirect back to the cart page
});

router.post('/cart/checkout', async (req, res) => {
    try {
        if (!req.session || !req.session.user || !req.session.user._id) {
            return res.status(401).json({ success: false, message: 'User not logged in or session expired' });
        }
        const cart = getCartFromCookies(req);

        if (!cart.length) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        const { address, city, postalCode, paymentMethod } = req.body;

        const productIds = cart.map(item => item.id);
        const productsFromDB = await Product.find({ _id: { $in: productIds } });

        let totalPrice = 0;
        const orderedProducts = cart.map(cartItem => {
            const product = productsFromDB.find(p => p._id.toString() === cartItem.id);
            if (!product || product.stock < cartItem.quantity) {
                throw new Error(`Insufficient stock for product: ${product?.name || 'Unknown'}`);
            }
            totalPrice += product.price * cartItem.quantity;

            return {
                product: product._id,
                quantity: cartItem.quantity,
                price: product.price,
            };
        });

        for (const cartItem of cart) {
            const product = productsFromDB.find(p => p._id.toString() === cartItem.id);
            product.stock -= cartItem.quantity;
            await product.save();
        }

        const newOrder = new Order({
            customer: req.session.user._id,
            shippingAddress: { address, city, postalCode },
            paymentMethod,
            products: orderedProducts,
            totalPrice,
        });

        await newOrder.save();

        res.clearCookie('cart', { path: '/', httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        res.render('order-status', {
            success: true,
            message: 'Order placed successfully!',
        });
    } catch (err) {
        console.error('Error processing checkout:', err.message);
        res.status(500).json({ success: false, message: err.message || 'Server Error' });
    }
});

module.exports = router;
