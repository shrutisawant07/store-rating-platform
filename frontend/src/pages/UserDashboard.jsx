import ChangePassword from "../components/ChangePassword";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function UserDashboard() {
    const { user, logout } = useAuth();

    const [stores, setStores] = useState([]);
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showChangePassword, setShowChangePassword] = useState(false);

    // Rating modal
    const [selectedStore, setSelectedStore] = useState(null);
    const [selectedRating, setSelectedRating] = useState(0);
    const [ratingLoading, setRatingLoading] = useState(false);
    const [ratingError, setRatingError] = useState("");

    const fetchStores = async () => {
        try {
            setLoading(true);
            setError("");

            const params = {};

            if (name.trim()) {
                params.name = name;
            }

            if (address.trim()) {
                params.address = address;
            }

            const response = await api.get("/stores", {
                params
            });

            setStores(response.data.stores);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load stores"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStores();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchStores();
    };

    // Open rating modal
    const openRatingModal = (store) => {
        setSelectedStore(store);
        setSelectedRating(store.myRating || 0);
        setRatingError("");
    };

    // Close modal
    const closeRatingModal = () => {
        setSelectedStore(null);
        setSelectedRating(0);
        setRatingError("");
    };

    // Submit or update rating
    const handleRatingSubmit = async () => {
        if (selectedRating < 1 || selectedRating > 5) {
            setRatingError(
                "Please select a rating between 1 and 5"
            );
            return;
        }

        try {
            setRatingLoading(true);
            setRatingError("");

            if (selectedStore.myRating) {

                // MODIFY EXISTING RATING
                await api.put(
                    `/ratings/${selectedStore.id}`,
                    {
                        rating: selectedRating
                    }
                );

            } else {

                // SUBMIT NEW RATING
                await api.post(
                    "/ratings",
                    {
                        store_id: selectedStore.id,
                        rating: selectedRating
                    }
                );
            }

            // Refresh store data
            await fetchStores();

            // Close modal
            closeRatingModal();

        } catch (error) {
            setRatingError(
                error.response?.data?.message ||
                "Failed to submit rating"
            );
        } finally {
            setRatingLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        window.location.href = "/login";
    };

    return (
        <div>

            {/* Header */}

            <header className="dashboard-header">

                <div>
                    <h1>Store Rating Platform</h1>

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


            {/* Main Content */}

            <main className="dashboard-container">

                <h2>Available Stores</h2>


                {/* Search */}

                <form
                    onSubmit={handleSearch}
                    className="search-section"
                >

                    <input
                        type="text"
                        placeholder="Search by store name"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                    />

                    <input
                        type="text"
                        placeholder="Search by address"
                        value={address}
                        onChange={(e) =>
                            setAddress(e.target.value)
                        }
                    />

                    <button type="submit">
                        Search
                    </button>

                </form>


                {/* Error */}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}


                {/* Loading */}

                {loading ? (
                    <p>Loading stores...</p>

                ) : stores.length === 0 ? (

                    <p>No stores found.</p>

                ) : (

                    <div className="table-container">

                        <table>

                            <thead>

                                <tr>
                                    <th>Store Name</th>
                                    <th>Address</th>
                                    <th>Overall Rating</th>
                                    <th>Your Rating</th>
                                    <th>Action</th>
                                </tr>

                            </thead>

                            <tbody>

                                {stores.map((store) => (

                                    <tr key={store.id}>

                                        <td>
                                            {store.name}
                                        </td>

                                        <td>
                                            {store.address}
                                        </td>

                                        <td>
                                            ⭐{" "}
                                            {Number(
                                                store.overallRating
                                            ).toFixed(1)}
                                        </td>

                                        <td>
                                            {store.myRating
                                                ? `⭐ ${store.myRating}`
                                                : "Not Rated"}
                                        </td>

                                        <td>

                                            <button
                                                onClick={() =>
                                                    openRatingModal(
                                                        store
                                                    )
                                                }
                                            >
                                                {store.myRating
                                                    ? "Modify Rating"
                                                    : "Rate Store"}
                                            </button>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}


            </main>


            {/* Rating Modal */}

            {selectedStore && (

                <div className="modal-overlay">

                    <div className="rating-modal">

                        <h2>
                            {selectedStore.myRating
                                ? "Modify Rating"
                                : "Rate Store"}
                        </h2>

                        <h3>
                            {selectedStore.name}
                        </h3>

                        <p>
                            Select your rating:
                        </p>


                        {/* Stars */}

                        <div className="rating-stars">

                            {[1, 2, 3, 4, 5].map(
                                (star) => (

                                    <button
                                        key={star}
                                        className={
                                            star <= selectedRating
                                                ? "star active"
                                                : "star"
                                        }
                                        onClick={() =>
                                            setSelectedRating(
                                                star
                                            )
                                        }
                                    >
                                        ★
                                    </button>

                                )
                            )}

                        </div>


                        <p>
                            Selected Rating:{" "}
                            {selectedRating || "None"}
                        </p>


                        {ratingError && (

                            <div className="error-message">
                                {ratingError}
                            </div>

                        )}


                        <div className="modal-actions">

                            <button
                                onClick={
                                    handleRatingSubmit
                                }
                                disabled={ratingLoading}
                            >
                                {ratingLoading
                                    ? "Saving..."
                                    : selectedStore.myRating
                                        ? "Update Rating"
                                        : "Submit Rating"}
                            </button>

                            <button
                                className="cancel-button"
                                onClick={closeRatingModal}
                            >
                                Cancel
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default UserDashboard;