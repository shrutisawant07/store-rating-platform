const db = require("../config/db");

const getStores = async (req, res) => {
    try {
        const {
            name,
            address,
            sortBy = "name",
            order = "asc"
        } = req.query;

        const allowedSortFields = {
            name: "s.name",
            address: "s.address",
            rating: "overallRating"
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
                s.address,

                COALESCE(AVG(r.rating), 0) AS overallRating
        `;

        const params = [];

        // Get the currently logged-in user's rating
        query += `,
            (
                SELECT r2.rating
                FROM ratings r2
                WHERE r2.store_id = s.id
                AND r2.user_id = ?
            ) AS myRating
        `;

        params.push(req.user.id);

        query += `
            FROM stores s
            LEFT JOIN ratings r
                ON s.id = r.store_id
            WHERE 1 = 1
        `;

        // Search by store name
        if (name) {
            query += " AND s.name LIKE ?";
            params.push(`%${name}%`);
        }

        // Search by address
        if (address) {
            query += " AND s.address LIKE ?";
            params.push(`%${address}%`);
        }

        query += `
            GROUP BY
                s.id,
                s.name,
                s.address
            ORDER BY ${sortColumn} ${sortOrder}
        `;

        const [stores] = await db.query(query, params);

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
    getStores
};