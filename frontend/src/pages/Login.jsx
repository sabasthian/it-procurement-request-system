import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", {
                email,
                password
            });

            const { token, user } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );

            console.log("Login berhasil:", user);

            if (user.role === "ADMIN") {
                navigate("/admin");
            } else if (user.role === "SUPERVISOR") {
                navigate("/supervisor");
            } else if (user.role === "PROCUREMENT") {
                navigate("/procurement");
            } else {
                navigate("/dashboard");
            }

        } catch (error) {
            console.error("Login error:", error);

            if (error.response) {
                setError(
                    error.response.data.message ||
                    "Email atau password salah"
                );
            } else {
                setError(
                    "Tidak dapat terhubung ke server."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">

                <div className="login-brand">

                    <div className="brand-icon">
                        IT
                    </div>

                    <h1>IT Procurement</h1>

                    <p>
                        Internal Procurement Management System
                    </p>

                </div>

                <div className="login-card">

                    <h2>Welcome Back</h2>

                    <p className="login-subtitle">
                        Sign in to access your procurement workspace.
                    </p>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>

                        <div className="form-group">

                            <label>Email</label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                            />

                        </div>

                        <div className="form-group">

                            <label>Password</label>

                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                            />

                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading
                                ? "Signing in..."
                                : "Sign In"}
                        </button>

                    </form>

                </div>

                <p className="login-footer">
                    © 2026 IT Procurement System
                </p>

            </div>
        </div>
    );
}

export default Login;