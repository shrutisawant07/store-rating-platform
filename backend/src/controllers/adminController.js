const db = require("../config/db");
const bcrypt = require("bcryptjs");

// ==========================================
// ADMIN DASHBOARD
// ==========================================

const getDashboardStats = async (req, res) => {
    try {
        const [userResult] = await db.query(
            "SELECT COUNT(*) AS totalUsers FROM users"
        );

        const [storeResult] = await db.query(
            "SELECT COUNT(*) AS totalStores FROM stores"
        );

        const [ratingResult] = await db.query(
            "SELECT COUNT(*) AS totalRatings FROM ratings"
        );

        res.status(200).json({
            success: true,
            data: {
                totalUsers: userResult[0].totalUsers,
                totalStores: storeResult[0].totalStores,
                totalRatings: ratingResult[0].totalRatings
            }
        });

    } catch (error) {
        console.error("Dashboard error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics"
        });
    }
};


// ==========================================
// ADD USER / ADMIN / STORE OWNER
// ==========================================

const addUser = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            address,
            role
        } = req.body;

        // Required fields
        if (!name || !email || !password || !address || !role) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Name validation
        if (name.length < 20 || name.length > 60) {
            return res.status(400).json({
                success: false,
                message: "Name must be between 20 and 60 characters"
            });
        }

        // Address validation
        if (address.length > 400) {
            return res.status(400).json({
                success: false,
                message: "Address cannot exceed 400 characters"
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        // Password validation
        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be 8-16 characters and contain at least one uppercase letter and one special character"
            });
        }

        // Role validation
        const allowedRoles = [
            "ADMIN",
            "USER",
            "STORE_OWNER"
        ];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role"
            });
        }

        // Check duplicate email
        const [existingUser] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        // Insert user
        const [result] = await db.query(
            `INSERT INTO users
            (name, email, password, address, role)
            VALUES (?, ?, ?, ?, ?)`,
            [
                name,
                email,
                hashedPassword,
                address,
                role
            ]
        );

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                id: result.insertId,
                name,
                email,
                address,
                role
            }
        });

    } catch (error) {
        console.error("Add user error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create user"
        });
    }
};


// ==========================================
// ADD STORE
// ==========================================

const addStore = async (req, res) => {
    try {
        const {
            name,
            email,
            address,
            owner_id
        } = req.body;

        // Required fields
        if (!name || !email || !address) {
            return res.status(400).json({
                success: false,
                message: "Store name, email and address are required"
            });
        }

        // Address validation
        if (address.length > 400) {
            return res.status(400).json({
                success: false,
                message: "Address cannot exceed 400 characters"
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        // If owner is provided, verify owner
        if (owner_id) {
            const [owner] = await db.query(
                `SELECT id
                 FROM users
                 WHERE id = ?
                 AND role = 'STORE_OWNER'`,
                [owner_id]
            );

            if (owner.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Store Owner"
                });
            }
        }

        // Create store
        const [result] = await db.query(
            `INSERT INTO stores
            (name, email, address, owner_id)
            VALUES (?, ?, ?, ?)`,
            [
                name,
                email,
                address,
                owner_id || null
            ]
        );

        res.status(201).json({
            success: true,
            message: "Store created successfully",
            store: {
                id: result.insertId,
                name,
                email,
                address,
                owner_id: owner_id || null
            }
        });

    } catch (error) {
        console.error("Add store error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create store"
        });
    }
};


// ==========================================
// GET USERS
// ==========================================

const getUsers = async (req, res) => {
    try {
        const {
            name,
            email,
            address,
            role,
            sortBy = "name",
            order = "asc"
        } = req.query;

        const allowedSortFields = {
            name: "u.name",
            email: "u.email",
            address: "u.address",
            role: "u.role"
        };

        const sortColumn =
            allowedSortFields[sortBy] || "u.name";

        const sortOrder =
            order.toLowerCase() === "desc"
                ? "DESC"
                : "ASC";

        let query = `
            SELECT
                u.id,
                u.name,
                u.email,
                u.address,
                u.role,
                CASE
                    WHEN u.role = 'STORE_OWNER'
                    THEN COALESCE(AVG(r.rating), 0)
                    ELSE NULL
                END AS rating
            FROM users u
            LEFT JOIN stores s
                ON s.owner_id = u.id
            LEFT JOIN ratings r
                ON r.store_id = s.id
            WHERE 1 = 1
        `;

        const params = [];

        if (name) {
            query += " AND u.name LIKE ?";
            params.push(`%${name}%`);
        }

        if (email) {
            query += " AND u.email LIKE ?";
            params.push(`%${email}%`);
        }

        if (address) {
            query += " AND u.address LIKE ?";
            params.push(`%${address}%`);
        }

        if (role) {
            query += " AND u.role = ?";
            params.push(role);
        }

        query += `
            GROUP BY
                u.id,
                u.name,
                u.email,
                u.address,
                u.role
            ORDER BY ${sortColumn} ${sortOrder}
        `;

        const [users] = await db.query(
            query,
            params
        );

        res.status(200).json({
            success: true,
            count: users.length,
            users
        });

    } catch (error) {
        console.error("Get users error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch users"
        });
    }
};


// ==========================================
// GET USER DETAILS
// ==========================================

const getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const [users] = await db.query(
            `
            SELECT
                u.id,
                u.name,
                u.email,
                u.address,
                u.role,
                CASE
                    WHEN u.role = 'STORE_OWNER'
                    THEN COALESCE(AVG(r.rating), 0)
                    ELSE NULL
                END AS rating
            FROM users u
            LEFT JOIN stores s
                ON s.owner_id = u.id
            LEFT JOIN ratings r
                ON r.store_id = s.id
            WHERE u.id = ?
            GROUP BY
                u.id,
                u.name,
                u.email,
                u.address,
                u.role
            `,
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            user: users[0]
        });

    } catch (error) {
        console.error("Get user details error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch user details"
        });
    }
};


// ==========================================
// GET STORES
// ==========================================

const getStores = async (req, res) => {
    try {
        const {
            name,
            email,
            address,
            sortBy = "name",
            order = "asc"
        } = req.query;

        const allowedSortFields = {
            name: "s.name",
            email: "s.email",
            address: "s.address",
            rating: "rating"
        };

        const sortColumn =
            allowedSortFields[sortBy] || "s.name";

        const sortOrder =
            order.toLowerCase() === "desc"
                ? "DESC"
                : "ASC";

        let query = `
            SELECT
                s.id,
                s.name,
                s.email,
                s.address,
                COALESCE(AVG(r.rating), 0) AS rating
            FROM stores s
            LEFT JOIN ratings r
                ON s.id = r.store_id
            WHERE 1 = 1
        `;

        const params = [];

        if (name) {
            query += " AND s.name LIKE ?";
            params.push(`%${name}%`);
        }

        if (email) {
            query += " AND s.email LIKE ?";
            params.push(`%${email}%`);
        }

        if (address) {
            query += " AND s.address LIKE ?";
            params.push(`%${address}%`);
        }

        query += `
            GROUP BY
                s.id,
                s.name,
                s.email,
                s.address
            ORDER BY ${sortColumn} ${sortOrder}
        `;

        const [stores] = await db.query(
            query,
            params
        );

        res.status(200).json({
            success: true,
            count: stores.length,
            stores
        });

    } catch (error) {
        console.error("Get stores error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch stores"
        });
    }
};


module.exports = {
    getDashboardStats,
    addUser,
    addStore,
    getUsers,
    getUserDetails,
    getStores
};