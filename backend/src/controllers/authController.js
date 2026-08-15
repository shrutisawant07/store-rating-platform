const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ==========================================
// SIGNUP
// ==========================================

const signup = async (req, res) => {
    try {
        const {
            name,
            email,
            address,
            password
        } = req.body;

        // 1. Required fields
        if (!name || !email || !address || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // 2. Validate name
        if (name.length < 20 || name.length > 60) {
            return res.status(400).json({
                success: false,
                message: "Name must be between 20 and 60 characters"
            });
        }

        // 3. Validate address
        if (address.length > 400) {
            return res.status(400).json({
                success: false,
                message: "Address cannot exceed 400 characters"
            });
        }

        // 4. Validate password
        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be 8-16 characters and contain at least one uppercase letter and one special character"
            });
        }

        // 5. Validate email
        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address"
            });
        }

        // 6. Check duplicate email
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

        // 7. Hash password
        const hashedPassword = await bcrypt.hash(
            password,
            10
        );

        // 8. Create normal user
        const [result] = await db.query(
            `INSERT INTO users
            (name, email, password, address, role)
            VALUES (?, ?, ?, ?, 'USER')`,
            [
                name,
                email,
                hashedPassword,
                address
            ]
        );

        // 9. Response
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: result.insertId,
                name,
                email,
                address,
                role: "USER"
            }
        });

    } catch (error) {
        console.error("Signup error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ==========================================
// LOGIN
// ==========================================

const login = async (req, res) => {
    try {
        const {
            email,
            password
        } = req.body;

        // 1. Required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // 2. Find user
        const [users] = await db.query(
            `SELECT
                id,
                name,
                email,
                password,
                address,
                role
             FROM users
             WHERE email = ?`,
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        // 3. Verify password
        const isPasswordValid =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // 4. Generate JWT
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn:
                    process.env.JWT_EXPIRES_IN || "1d"
            }
        );

        // 5. Response
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                address: user.address,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ==========================================
// CHANGE PASSWORD
// ==========================================

const changePassword = async (req, res) => {
    try {
        // User ID comes from JWT
        const userId = req.user.id;

        const {
            currentPassword,
            newPassword
        } = req.body;

        // 1. Required fields
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message:
                    "Current password and new password are required"
            });
        }

        // 2. Validate new password
        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be 8-16 characters and contain at least one uppercase letter and one special character"
            });
        }

        // 3. Get user's current password
        const [users] = await db.query(
            "SELECT password FROM users WHERE id = ?",
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // 4. Verify current password
        const isPasswordValid =
            await bcrypt.compare(
                currentPassword,
                users[0].password
            );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            });
        }

        // 5. Check whether new password is same
        const isSamePassword =
            await bcrypt.compare(
                newPassword,
                users[0].password
            );

        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message:
                    "New password must be different from current password"
            });
        }

        // 6. Hash new password
        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                10
            );

        // 7. Update database
        await db.query(
            "UPDATE users SET password = ? WHERE id = ?",
            [
                hashedPassword,
                userId
            ]
        );

        // 8. Success response
        res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (error) {
        console.error(
            "Change password error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to update password"
        });
    }
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
    signup,
    login,
    changePassword
};