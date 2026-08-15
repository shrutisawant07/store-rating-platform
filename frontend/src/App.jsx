import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";

function App() {
    return (
        <BrowserRouter>

            <AuthProvider>

                <Routes>

                    {/* Public Routes */}

                    <Route
                        path="/"
                        element={<Login />}
                    />

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/signup"
                        element={<Signup />}
                    />


                    {/* ADMIN */}

                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute
                                allowedRoles={["ADMIN"]}
                            >
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />


                    {/* NORMAL USER */}

                    <Route
                        path="/user"
                        element={
                            <ProtectedRoute
                                allowedRoles={["USER"]}
                            >
                                <UserDashboard />
                            </ProtectedRoute>
                        }
                    />


                    {/* STORE OWNER */}

                    <Route
                        path="/owner"
                        element={
                            <ProtectedRoute
                                allowedRoles={["STORE_OWNER"]}
                            >
                                <OwnerDashboard />
                            </ProtectedRoute>
                        }
                    />

                </Routes>

            </AuthProvider>

        </BrowserRouter>
    );
}

export default App;