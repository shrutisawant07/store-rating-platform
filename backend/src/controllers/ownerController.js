const db = require("../config/db");

const getOwnerDashboard = async (req, res) => {
    try {
        const ownerId = req.user.id;

        // Find store owned by this user
        const [stores] = await db.query(
            `
            SELECT
                s.id,
                s.name,
                s.email,
                s.address,
                COALESCE(AVG(r.rating), 0) AS averageRating,
                COUNT(r.id) AS totalRatings
            FROM stores s
            LEFT JOIN ratings r
                ON s.id = r.store_id
            WHERE s.owner_id = ?
            GROUP BY
                s.id,
                s.name,
                s.email,
                s.address
            `,
            [ownerId]
        );

        if (stores.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No store found for this owner"
            });
        }

        const store = stores[0];

        // Get users who submitted ratings
        const [ratings] = await db.query(
            `
            SELECT
                u.id AS userId,
                u.name,
                u.email,
                r.rating,
                r.id AS ratingId
            FROM ratings r
            INNER JOIN users u
                ON r.user_id = u.id
            WHERE r.store_id = ?
            ORDER BY r.id DESC
            `,
            [store.id]
        );

        res.status(200).json({
            success: true,
            store: {
                id: store.id,
                name: store.name,
                email: store.email,
                address: store.address,
                averageRating: store.averageRating,
                totalRatings: store.totalRatings
            },
            ratings
        });

    } catch (error) {
        console.error("Owner dashboard error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch owner dashboard"
        });
    }
};

module.exports = {
    getOwnerDashboard
};