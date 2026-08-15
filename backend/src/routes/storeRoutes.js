const express = require("express");

const {
    getStores
} = require("../controllers/storeController");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("USER"));

router.get("/", getStores);

module.exports = router;