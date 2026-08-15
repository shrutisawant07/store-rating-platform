const express = require("express");

const {
    getDashboardStats,
    addUser,
    addStore,
    getUsers,
    getUserDetails,
    getStores
} = require("../controllers/adminController");

const authenticate = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Every route below requires ADMIN
router.use(authenticate);
router.use(authorizeRoles("ADMIN"));

// Dashboard
router.get("/dashboard", getDashboardStats);

// Users
router.post("/users", addUser);
router.get("/users", getUsers);
router.get("/users/:id", getUserDetails);

// Stores
router.post("/stores", addStore);
router.get("/stores", getStores);

module.exports = router;