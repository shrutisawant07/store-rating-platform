import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Signup() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        address: "",
        password: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        // Frontend validation

        if (
            formData.name.length < 20 ||
            formData.name.length > 60
        ) {
            setError(
                "Name must be between 20 and 60 characters"
            );
            return;
        }

        if (formData.address.length > 400) {
            setError(
                "Address cannot exceed 400 characters"
            );
            return;
        }

        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

        if (!passwordRegex.test(formData.password)) {
            setError(
                "Password must be 8-16 characters and contain at least one uppercase letter and one special character"
            );
            return;
        }

        try {
            setLoading(true);

            await api.post(
                "/auth/signup",
                formData
            );

            setSuccess(
                "Registration successful! Redirecting to login..."
            );

            setFormData({
                name: "",
                email: "",
                address: "",
                password: ""
            });

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Registration failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">

            <div className="auth-card">

                <h1>Store Rating Platform</h1>

                <h2>Create Account</h2>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="success-message">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="form-group">

                        <label>Name</label>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            minLength={20}
                            maxLength={60}
                            required
                        />

                        <small>
                            20–60 characters
                        </small>

                    </div>


                    <div className="form-group">

                        <label>Email</label>

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label>Address</label>

                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Enter your address"
                            maxLength={400}
                            rows={3}
                            required
                        />

                        <small>
                            Maximum 400 characters
                        </small>

                    </div>


                    <div className="form-group">

                        <label>Password</label>

                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            minLength={8}
                            maxLength={16}
                            required
                        />

                        <small>
                            8–16 characters, 1 uppercase,
                            1 special character
                        </small>

                    </div>


                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Creating Account..."
                            : "Sign Up"}
                    </button>

                </form>


                <p>
                    Already have an account?{" "}
                    <Link to="/login">
                        Login
                    </Link>
                </p>

            </div>

        </div>
    );
}

export default Signup;