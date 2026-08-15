import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function AdminDashboard() {
    const { user, logout } = useAuth();

    // ==========================================
    // DASHBOARD STATS
    // ==========================================

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStores: 0,
        totalRatings: 0
    });

    // ==========================================
    // USERS
    // ==========================================

    const [users, setUsers] = useState([]);

    const [userFilters, setUserFilters] = useState({
        name: "",
        email: "",
        address: "",
        role: ""
    });

    const [userSort, setUserSort] = useState("name");
    const [userOrder, setUserOrder] = useState("asc");

    // ==========================================
    // STORES
    // ==========================================

    const [stores, setStores] = useState([]);

    const [storeFilters, setStoreFilters] = useState({
        name: "",
        email: "",
        address: ""
    });

    const [storeSort, setStoreSort] = useState("name");
    const [storeOrder, setStoreOrder] = useState("asc");

    // ==========================================
    // GENERAL STATE
    // ==========================================

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showUserForm, setShowUserForm] = useState(false);
    const [showStoreForm, setShowStoreForm] = useState(false);

    // ==========================================
    // ADD USER FORM
    // ==========================================

    const [userForm, setUserForm] = useState({
        name: "",
        email: "",
        password: "",
        address: "",
        role: "USER"
    });

    // ==========================================
    // ADD STORE FORM
    // ==========================================

    const [storeForm, setStoreForm] = useState({
        name: "",
        email: "",
        address: "",
        owner_id: ""
    });

    // ==========================================
    // FETCH DASHBOARD STATS
    // ==========================================

    const fetchDashboard = async () => {
        try {
            const response = await api.get("/admin/dashboard");

            setStats(response.data.data);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load dashboard"
            );
        }
    };

    // ==========================================
    // FETCH USERS
    // ==========================================

    const fetchUsers = async () => {
        try {
            const params = {
                sortBy: userSort,
                order: userOrder
            };

            // Name filter
            if (userFilters.name.trim()) {
                params.name = userFilters.name.trim();
            }

            // Email filter
            if (userFilters.email.trim()) {
                params.email = userFilters.email.trim();
            }

            // Address filter
            if (userFilters.address.trim()) {
                params.address = userFilters.address.trim();
            }

            // Role filter
            if (userFilters.role) {
                params.role = userFilters.role;
            }

            const response = await api.get(
                "/admin/users",
                {
                    params
                }
            );

            setUsers(response.data.users);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load users"
            );
        }
    };

    // ==========================================
    // FETCH STORES
    // ==========================================

    const fetchStores = async () => {
        try {
            const params = {
                sortBy: storeSort,
                order: storeOrder
            };

            // Name filter
            if (storeFilters.name.trim()) {
                params.name = storeFilters.name.trim();
            }

            // Email filter
            if (storeFilters.email.trim()) {
                params.email = storeFilters.email.trim();
            }

            // Address filter
            if (storeFilters.address.trim()) {
                params.address = storeFilters.address.trim();
            }

            const response = await api.get(
                "/admin/stores",
                {
                    params
                }
            );

            setStores(response.data.stores);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load stores"
            );
        }
    };

    // ==========================================
    // LOAD ALL DATA
    // ==========================================

    const loadAllData = async () => {
        setLoading(true);
        setError("");

        await Promise.all([
            fetchDashboard(),
            fetchUsers(),
            fetchStores()
        ]);

        setLoading(false);
    };

    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {
        loadAllData();
    }, []);

    // ==========================================
    // RELOAD USERS WHEN SORT CHANGES
    // ==========================================

    useEffect(() => {
        fetchUsers();
    }, [userSort, userOrder]);

    // ==========================================
    // RELOAD STORES WHEN SORT CHANGES
    // ==========================================

    useEffect(() => {
        fetchStores();
    }, [storeSort, storeOrder]);

    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = () => {
        logout();
        window.location.href = "/login";
    };

    // ==========================================
    // USER FORM CHANGE
    // ==========================================

    const handleUserFormChange = (e) => {
        setUserForm({
            ...userForm,
            [e.target.name]: e.target.value
        });
    };

    // ==========================================
    // STORE FORM CHANGE
    // ==========================================

    const handleStoreFormChange = (e) => {
        setStoreForm({
            ...storeForm,
            [e.target.name]: e.target.value
        });
    };

    // ==========================================
    // ADD USER
    // ==========================================

    const handleAddUser = async (e) => {
        e.preventDefault();

        try {
            await api.post(
                "/admin/users",
                userForm
            );

            alert("User created successfully");

            setUserForm({
                name: "",
                email: "",
                password: "",
                address: "",
                role: "USER"
            });

            setShowUserForm(false);

            await fetchDashboard();
            await fetchUsers();

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to create user"
            );
        }
    };

    // ==========================================
    // ADD STORE
    // ==========================================

    const handleAddStore = async (e) => {
        e.preventDefault();

        try {
            await api.post(
                "/admin/stores",
                {
                    ...storeForm,
                    owner_id: storeForm.owner_id
                        ? Number(storeForm.owner_id)
                        : null
                }
            );

            alert("Store created successfully");

            setStoreForm({
                name: "",
                email: "",
                address: "",
                owner_id: ""
            });

            setShowStoreForm(false);

            await fetchDashboard();
            await fetchStores();

        } catch (error) {
            alert(
                error.response?.data?.message ||
                "Failed to create store"
            );
        }
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <p className="loading">
                Loading dashboard...
            </p>
        );
    }

    // ==========================================
    // UI
    // ==========================================

    return (
        <div>

            {/* ==================================
                HEADER
            ================================== */}

            <header className="dashboard-header">

                <div>

                    <h1>
                        Admin Dashboard
                    </h1>

                    <p>
                        Welcome, {user?.name}
                    </p>

                </div>

                <button onClick={handleLogout}>
                    Logout
                </button>

            </header>


            <main className="dashboard-container">

                {/* ERROR */}

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}


                {/* ==================================
                    STATISTICS
                ================================== */}

                <div className="stats-grid">

                    <div className="stat-card">

                        <h3>
                            Total Users
                        </h3>

                        <p>
                            {stats.totalUsers}
                        </p>

                    </div>


                    <div className="stat-card">

                        <h3>
                            Total Stores
                        </h3>

                        <p>
                            {stats.totalStores}
                        </p>

                    </div>


                    <div className="stat-card">

                        <h3>
                            Total Ratings
                        </h3>

                        <p>
                            {stats.totalRatings}
                        </p>

                    </div>

                </div>


                {/* ==================================
                    ADD BUTTONS
                ================================== */}

                <div className="action-buttons">

                    <button
                        onClick={() =>
                            setShowUserForm(
                                !showUserForm
                            )
                        }
                    >
                        Add User
                    </button>


                    <button
                        onClick={() =>
                            setShowStoreForm(
                                !showStoreForm
                            )
                        }
                    >
                        Add Store
                    </button>

                </div>


                {/* ==================================
                    ADD USER FORM
                ================================== */}

                {showUserForm && (

                    <form
                        className="admin-form"
                        onSubmit={handleAddUser}
                    >

                        <h2>
                            Add User
                        </h2>


                        <input
                            name="name"
                            placeholder="Name"
                            value={userForm.name}
                            onChange={
                                handleUserFormChange
                            }
                            required
                        />


                        <input
                            name="email"
                            type="email"
                            placeholder="Email"
                            value={userForm.email}
                            onChange={
                                handleUserFormChange
                            }
                            required
                        />


                        <input
                            name="password"
                            type="password"
                            placeholder="Password"
                            value={userForm.password}
                            onChange={
                                handleUserFormChange
                            }
                            required
                        />


                        <input
                            name="address"
                            placeholder="Address"
                            value={userForm.address}
                            onChange={
                                handleUserFormChange
                            }
                            required
                        />


                        <select
                            name="role"
                            value={userForm.role}
                            onChange={
                                handleUserFormChange
                            }
                        >

                            <option value="USER">
                                Normal User
                            </option>

                            <option value="ADMIN">
                                Admin
                            </option>

                            <option value="STORE_OWNER">
                                Store Owner
                            </option>

                        </select>


                        <button type="submit">
                            Create User
                        </button>

                    </form>

                )}


                {/* ==================================
                    ADD STORE FORM
                ================================== */}

                {showStoreForm && (

                    <form
                        className="admin-form"
                        onSubmit={handleAddStore}
                    >

                        <h2>
                            Add Store
                        </h2>


                        <input
                            name="name"
                            placeholder="Store Name"
                            value={storeForm.name}
                            onChange={
                                handleStoreFormChange
                            }
                            required
                        />


                        <input
                            name="email"
                            type="email"
                            placeholder="Store Email"
                            value={storeForm.email}
                            onChange={
                                handleStoreFormChange
                            }
                            required
                        />


                        <input
                            name="address"
                            placeholder="Store Address"
                            value={storeForm.address}
                            onChange={
                                handleStoreFormChange
                            }
                            required
                        />


                        <input
                            name="owner_id"
                            type="number"
                            placeholder="Store Owner ID (optional)"
                            value={storeForm.owner_id}
                            onChange={
                                handleStoreFormChange
                            }
                        />


                        <button type="submit">
                            Create Store
                        </button>

                    </form>

                )}


                {/* ==================================
                    USERS SECTION
                ================================== */}

                <section className="admin-section">

                    <div className="section-header">

                        <h2>
                            Users
                        </h2>


                        <div className="table-controls">

                            {/* NAME */}

                            <input
                                placeholder="Name"
                                value={
                                    userFilters.name
                                }
                                onChange={(e) =>
                                    setUserFilters({
                                        ...userFilters,
                                        name: e.target.value
                                    })
                                }
                            />


                            {/* EMAIL */}

                            <input
                                placeholder="Email"
                                value={
                                    userFilters.email
                                }
                                onChange={(e) =>
                                    setUserFilters({
                                        ...userFilters,
                                        email: e.target.value
                                    })
                                }
                            />


                            {/* ADDRESS */}

                            <input
                                placeholder="Address"
                                value={
                                    userFilters.address
                                }
                                onChange={(e) =>
                                    setUserFilters({
                                        ...userFilters,
                                        address: e.target.value
                                    })
                                }
                            />


                            {/* ROLE */}

                            <select
                                value={
                                    userFilters.role
                                }
                                onChange={(e) =>
                                    setUserFilters({
                                        ...userFilters,
                                        role: e.target.value
                                    })
                                }
                            >

                                <option value="">
                                    All Roles
                                </option>

                                <option value="USER">
                                    User
                                </option>

                                <option value="ADMIN">
                                    Admin
                                </option>

                                <option value="STORE_OWNER">
                                    Store Owner
                                </option>

                            </select>


                            {/* SEARCH */}

                            <button
                                onClick={fetchUsers}
                            >
                                Search
                            </button>


                            {/* SORT FIELD */}

                            <select
                                value={userSort}
                                onChange={(e) =>
                                    setUserSort(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="name">
                                    Name
                                </option>

                                <option value="email">
                                    Email
                                </option>

                                <option value="address">
                                    Address
                                </option>

                                <option value="role">
                                    Role
                                </option>

                            </select>


                            {/* SORT ORDER */}

                            <button
                                onClick={() =>
                                    setUserOrder(
                                        userOrder === "asc"
                                            ? "desc"
                                            : "asc"
                                    )
                                }
                            >
                                {userOrder === "asc"
                                    ? "↑"
                                    : "↓"}
                            </button>

                        </div>

                    </div>


                    {/* USERS TABLE */}

                    <div className="table-container">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Name
                                    </th>

                                    <th>
                                        Email
                                    </th>

                                    <th>
                                        Address
                                    </th>

                                    <th>
                                        Role
                                    </th>

                                    <th>
                                        Rating
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {users.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="5"
                                            style={{
                                                textAlign: "center"
                                            }}
                                        >
                                            No users found
                                        </td>

                                    </tr>

                                ) : (

                                    users.map((item) => (

                                        <tr
                                            key={item.id}
                                        >

                                            <td>
                                                {item.name}
                                            </td>

                                            <td>
                                                {item.email}
                                            </td>

                                            <td>
                                                {item.address}
                                            </td>

                                            <td>
                                                {item.role}
                                            </td>

                                            <td>

                                                {item.rating !== null
                                                    ? Number(
                                                        item.rating
                                                    ).toFixed(1)
                                                    : "-"}

                                            </td>

                                        </tr>

                                    ))

                                )}

                            </tbody>

                        </table>

                    </div>

                </section>


                {/* ==================================
                    STORES SECTION
                ================================== */}

                <section className="admin-section">

                    <div className="section-header">

                        <h2>
                            Stores
                        </h2>


                        <div className="table-controls">

                            {/* NAME */}

                            <input
                                placeholder="Name"
                                value={
                                    storeFilters.name
                                }
                                onChange={(e) =>
                                    setStoreFilters({
                                        ...storeFilters,
                                        name: e.target.value
                                    })
                                }
                            />


                            {/* EMAIL */}

                            <input
                                placeholder="Email"
                                value={
                                    storeFilters.email
                                }
                                onChange={(e) =>
                                    setStoreFilters({
                                        ...storeFilters,
                                        email: e.target.value
                                    })
                                }
                            />


                            {/* ADDRESS */}

                            <input
                                placeholder="Address"
                                value={
                                    storeFilters.address
                                }
                                onChange={(e) =>
                                    setStoreFilters({
                                        ...storeFilters,
                                        address: e.target.value
                                    })
                                }
                            />


                            {/* SEARCH */}

                            <button
                                onClick={fetchStores}
                            >
                                Search
                            </button>


                            {/* SORT FIELD */}

                            <select
                                value={storeSort}
                                onChange={(e) =>
                                    setStoreSort(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="name">
                                    Name
                                </option>

                                <option value="email">
                                    Email
                                </option>

                                <option value="address">
                                    Address
                                </option>

                                <option value="rating">
                                    Rating
                                </option>

                            </select>


                            {/* SORT ORDER */}

                            <button
                                onClick={() =>
                                    setStoreOrder(
                                        storeOrder === "asc"
                                            ? "desc"
                                            : "asc"
                                    )
                                }
                            >
                                {storeOrder === "asc"
                                    ? "↑"
                                    : "↓"}
                            </button>

                        </div>

                    </div>


                    {/* STORES TABLE */}

                    <div className="table-container">

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Name
                                    </th>

                                    <th>
                                        Email
                                    </th>

                                    <th>
                                        Address
                                    </th>

                                    <th>
                                        Rating
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {stores.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="4"
                                            style={{
                                                textAlign: "center"
                                            }}
                                        >
                                            No stores found
                                        </td>

                                    </tr>

                                ) : (

                                    stores.map((store) => (

                                        <tr
                                            key={store.id}
                                        >

                                            <td>
                                                {store.name}
                                            </td>

                                            <td>
                                                {store.email}
                                            </td>

                                            <td>
                                                {store.address}
                                            </td>

                                            <td>
                                                ⭐{" "}
                                                {Number(
                                                    store.rating
                                                ).toFixed(1)}
                                            </td>

                                        </tr>

                                    ))

                                )}

                            </tbody>

                        </table>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default AdminDashboard;