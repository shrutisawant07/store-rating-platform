const express = require("express");
const cors = require("cors");
const adminRoutes = require("./routes/adminRoutes");
const storeRoutes = require("./routes/storeRoutes");
require("dotenv").config();

const db = require("./config/db");
const ratingRoutes = require("./routes/ratingRoutes");
const authRoutes = require("./routes/authRoutes");
const ownerRoutes = require("./routes/ownerRoutes");

const app = express();

// Middleware
const corsOptions = {
    origin: [
        "http://localhost:5173",
        "https://store-rating-platform-indol.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/owner", ownerRoutes);

// Home route
app.get("/", (req, res) => {
    res.json({
        message: "Store Rating API is running"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});