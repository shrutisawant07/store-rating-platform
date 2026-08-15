import { useState } from "react";
import api from "../services/api";

function ChangePassword() {
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (
            formData.newPassword !==
            formData.confirmPassword
        ) {
            setError("New passwords do not match");
            return;
        }

        const passwordRegex =
            /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

        if (!passwordRegex.test(formData.newPassword)) {
            setError(
                "Password must be 8-16 characters and contain at least one uppercase letter and one special character"
            );
            return;
        }

        try {
            setLoading(true);

            const response = await api.put(
                "/auth/change-password",
                {
                    currentPassword:
                        formData.currentPassword,
                    newPassword:
                        formData.newPassword
                }
            );

            setMessage(response.data.message);

            setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to change password"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="change-password-card">

            <h2>Change Password</h2>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {message && (
                <div className="success-message">
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit}>

                <div className="form-group">
                    <label>Current Password</label>

                    <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>New Password</label>

                    <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        minLength={8}
                        maxLength={16}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Confirm New Password</label>

                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        minLength={8}
                        maxLength={16}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "Updating..."
                        : "Update Password"}
                </button>

            </form>

        </div>
    );
}

export default ChangePassword;