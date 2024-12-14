const express = require("express");
const router = express.Router();

// Route to render the 'portfolio' page with a specific layout
router.get("/about-me", (req, res) => {
    res.render("myPortfolio", {
        layout: "portfolioLayout", // Layout name for the page
    });
});

module.exports = router;
