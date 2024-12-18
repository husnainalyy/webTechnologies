const express = require('express');
let router = express.Router();
const adminProductsRouter = require("./products.controller");
router.use("/products", adminProductsRouter);


const ordersRouter = require("../website/ordersview.controller");
router.use("/admin/orders", ordersRouter);



const brandController = require("./brand.controller");
router.use("/brands", brandController);

const categoryController = require("./category.controller");
router.use("/categories",categoryController);

module.exports = router;