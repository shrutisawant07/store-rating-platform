const db = require("../config/db");

// ==========================================
// SUBMIT RATING
// ==========================================

const submitRating = async (req, res) => {
    try {
        const userId = req.user.id;
        const { store_id, rating } = req.body;

        // Required fields
        if (!store_id || rating === undefined) {
            return res.status(400).json({
                success: false,
                message: "Store ID and rating are required"
            });
        }

        // Rating validation
        if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be an integer between 1 and 5"
            });
        }

        // Check store exists
        const [stores] = await db.query(
            "SELECT id FROM stores WHERE id = ?",
            [store_id]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Store not found"
            });
        }

        // Check if user already rated this store
        const [existingRating] = await db.query(
            `SELECT id
             FROM ratings
             WHERE user_id = ?
             AND store_id = ?`,
            [userId, store_id]
        );

        if (existingRating.length > 0) {
            return res.status(409).json({
                success: false,
                message: "You have already rated this store. Use modify rating instead."
            });
        }

        // Insert rating
        const [result] = await db.query(
            `INSERT INTO ratings
             (user_id, store_id, rating)
             VALUES (?, ?, ?)`,
            [userId, store_id, Number(rating)]
        );

        res.status(201).json({
            success: true,
            message: "Rating submitted successfully",
            rating: {
                id: result.insertId,
                user_id: userId,
                store_id: Number(store_id),
                rating: Number(rating)
            }
        });

    } catch (error) {
        console.error("Submit rating error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to submit rating"
        });
    }
};


// ==========================================
// MODIFY RATING
// ==========================================

const updateRating = async (req, res) => {
    try {
        const userId = req.user.id;
        const { storeId } = req.params;
        const { rating } = req.body;

        // Required field
        if (rating === undefined) {
            return res.status(400).json({
                success: false,
                message: "Rating is required"
            });
        }

        // Rating validation
        if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be an integer between 1 and 5"
            });
        }

        // Find user's rating
        const [existingRating] = await db.query(
            `SELECT id
             FROM ratings
             WHERE user_id = ?
             AND store_id = ?`,
            [userId, storeId]
        );

        if (existingRating.length === 0) {
            return res.status(404).json({
                success: false,
                message: "You have not rated this store yet"
            });
        }

        // Update rating
        await db.query(
            `UPDATE ratings
             SET rating = ?
             WHERE user_id = ?
             AND store_id = ?`,
            [Number(rating), userId, storeId]
        );

        res.status(200).json({
            success: true,
            message: "Rating updated successfully",
            rating: {
                user_id: userId,
                store_id: Number(storeId),
                rating: Number(rating)
            }
        });

    } catch (error) {
        console.error("Update rating error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update rating"
        });
    }
};

module.exports = {
    submitRating,
    updateRating
};