const express = require("express");

const {
    getOwnerDashboard
} = require("../controllers/ownerController");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("STORE_OWNER"));

router.get("/dashboard", getOwnerDashboard);

module.exports = router;