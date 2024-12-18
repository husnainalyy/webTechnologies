const express = require("express");
const Order = require("../../models/order.model"); // Assuming you have an Order model
const router = express.Router();



// Admin route to view all orders with pagination
router.get("/admin/orders", async (req, res) => {
    try {
        // Extract `page` and `limit` from query parameters, with defaults
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 10; // Default to 10 orders per page

        // Calculate the starting index for pagination
        const skip = (page - 1) * limit;

        // Fetch total number of orders
        const totalOrders = await Order.countDocuments();

        // Fetch orders with pagination
        const orders = await Order.find()
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'products.product',
                select: 'name price image',               
                populate: {
                    path: 'brand', // Populate brand details inside each product
                },
            })
            .populate('customer'); // Assuming there's a customer field to show customer info

        // Calculate total pages for pagination
        const totalPages = Math.ceil(totalOrders / limit);
        console.log(orders)
        // Render the orders management page with pagination details
        res.render("./admin/ordersPage", {
            layout: "adminLayout",
            orders,
            pageTitle: "Manage Orders",
            currentPage: page,
            totalPages,
            limit, // Pass limit to the frontend for pagination
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).send("An error occurred while fetching orders.");
    }
});

// Admin route to view a specific order by ID
router.get('/admin/orders/view/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch the order by ID, populate product details and customer info
        const order = await Order.findById(id)
            .populate({
                path: 'products.product',
                populate: {
                    path: 'brand', // Populate brand details inside each product
                },
            })
            .populate('customer'); // Populate customer details

        if (!order) {
            return res.status(404).send("Order not found");
        }

        // Render the order details page
        res.render("admin/view-order", {
            order,
            pageTitle: "Order Details",
        });
    } catch (error) {
        console.error("Error fetching order details:", error);
        res.status(500).send("An error occurred while fetching order details.");
    }
});

// Admin route to update the status of an order (e.g., mark it as completed, cancelled)
router.post('/admin/orders/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus } = req.body; // Get the updated order status from the form

        // Update the order with the new status
        const updatedOrder = await Order.findByIdAndUpdate(id, { orderStatus }, { new: true });

        // Redirect back to the orders list after updating
        res.redirect("/admin/orders");
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).send("An error occurred while updating the order.");
    }
});

// Admin route to delete an order
router.get('/admin/orders/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Delete the order by its ID
        await Order.findByIdAndDelete(id);

        // Redirect back to the orders list after deletion
        res.redirect("/admin/orders");
    } catch (error) {
        console.error("Error deleting order:", error);
        res.status(500).send("An error occurred while deleting the order.");
    }
});

module.exports = router;
