const express = require("express");

const {
    submitRating,
    updateRating
} = require("../controllers/ratingController");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("USER"));

router.post("/", submitRating);

router.put("/:storeId", updateRating);

module.exports = router;