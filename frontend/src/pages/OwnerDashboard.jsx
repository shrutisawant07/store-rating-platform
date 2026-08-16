import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import ChangePassword from "../components/ChangePassword";

function OwnerDashboard() {
    const { user, logout } = useAuth();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showChangePassword, setShowChangePassword] = useState(false);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/owner/dashboard");

            setDashboard(response.data);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load dashboard"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const handleLogout = () => {
        logout();
        window.location.href = "/login";
    };

    if (loading) {
        return (
            <p className="loading">
                Loading dashboard...
            </p>
        );
    }

    return (
        <div>

            {/* Header */}

            <header className="dashboard-header">

                <div>
                    <h1>Store Owner Dashboard</h1>

                    <p>
                        Welcome, {user?.name}
                    </p>
                </div>

                <div className="header-actions">

                    <button
                        onClick={() =>
                            setShowChangePassword(
                                !showChangePassword
                            )
                        }
                    >
                        Change Password
                    </button>

                    <button onClick={handleLogout}>
                        Logout
                    </button>

                </div>

            </header>


            {/* Change Password */}

            {showChangePassword && (
                <ChangePassword />
            )}


            <main className="dashboard-container">

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {dashboard && (
                    <>

                        {/* Store Information */}

                        <section className="owner-store-card">

                            <h2>
                                {dashboard.store.name}
                            </h2>

                            <p>
                                <strong>Email:</strong>{" "}
                                {dashboard.store.email}
                            </p>

                            <p>
                                <strong>Address:</strong>{" "}
                                {dashboard.store.address}
                            </p>

                        </section>


                        {/* Statistics */}

                        <div className="stats-grid">

                            <div className="stat-card">

                                <h3>
                                    Average Rating
                                </h3>

                                <p>
                                    ⭐{" "}
                                    {Number(
                                        dashboard.store.averageRating
                                    ).toFixed(1)}
                                </p>

                            </div>


                            <div className="stat-card">

                                <h3>
                                    Total Ratings
                                </h3>

                                <p>
                                    {dashboard.store.totalRatings}
                                </p>

                            </div>

                        </div>


                        {/* Rating Users */}

                        <section className="admin-section">

                            <h2>
                                Users Who Rated Your Store
                            </h2>

                            {dashboard.ratings.length === 0 ? (

                                <p>
                                    No ratings submitted yet.
                                </p>

                            ) : (

                                <div className="table-container">

                                    <table>

                                        <thead>

                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Rating</th>
                                            </tr>

                                        </thead>

                                        <tbody>

                                            {dashboard.ratings.map(
                                                (rating) => (

                                                    <tr
                                                        key={
                                                            rating.ratingId
                                                        }
                                                    >

                                                        <td>
                                                            {rating.name}
                                                        </td>

                                                        <td>
                                                            {rating.email}
                                                        </td>

                                                        <td>
                                                            ⭐{" "}
                                                            {
                                                                rating.rating
                                                            }
                                                        </td>

                                                    </tr>

                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            )}

                        </section>

                    </>
                )}

            </main>

        </div>
    );
}

export default OwnerDashboard;