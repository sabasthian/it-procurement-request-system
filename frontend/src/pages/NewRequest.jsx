
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function NewRequest() {
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("MEDIUM");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [feedback, setFeedback] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) {
            return;
        }

        setError("");
        setFeedback("");

        const cleanTitle = title.trim();
        const cleanDescription = description.trim();

        if (!cleanTitle || !cleanDescription) {
            setError(
                "Request title and description cannot be empty."
            );
            return;
        }

        if (cleanTitle.length < 3) {
            setError(
                "Request title must contain at least 3 characters."
            );
            return;
        }

        if (cleanDescription.length < 10) {
            setError(
                "Description must contain at least 10 characters."
            );
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            setError(
                "Your session has expired. Please log in again."
            );
            return;
        }

        setLoading(true);

        try {
            const response = await api.post(
                "/requests",
                {
                    title: cleanTitle,
                    description: cleanDescription,
                    priority,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const createdRequest =
                response.data?.request ||
                response.data?.data ||
                response.data;

            const requestNumber = createdRequest?.requestNumber;

            setFeedback(
                requestNumber
                    ? `Request ${requestNumber} was submitted successfully.`
                    : "Your procurement request was submitted successfully."
            );

            // Navigate only after the API confirms success.
            navigate("/dashboard", {
                state: {
                    successMessage: requestNumber
                        ? `Request ${requestNumber} was submitted successfully.`
                        : "Your procurement request was submitted successfully.",
                },
            });
        } catch (requestError) {
            console.error(
                "Create request error:",
                requestError
            );

            if (requestError.response) {
                setError(
                    requestError.response.data?.message ||
                    "Failed to create procurement request."
                );
            } else if (requestError.request) {
                setError(
                    "Unable to connect to the server. Check your connection and try again."
                );
            } else {
                setError(
                    requestError.message ||
                    "An unexpected error occurred."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div>
                    <h1>IT Procurement</h1>
                    <p>
                        Internal Procurement Management System
                    </p>
                </div>
            </header>

            <main className="dashboard-content">
                <div className="form-card">
                    <div className="form-header">
                        <h2>New Procurement Request</h2>
                        <p>
                            Submit a new request for IT equipment
                            or services.
                        </p>
                    </div>

                    {feedback && (
                        <div
                            className="success-message"
                            role="status"
                        >
                            {feedback}
                        </div>
                    )}

                    {error && (
                        <div
                            className="error-message"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="request-title">
                                Request Title
                            </label>

                            <input
                                id="request-title"
                                type="text"
                                placeholder="e.g. Laptop for IT Department"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    setError("");
                                }}
                                maxLength={150}
                                required
                                disabled={loading}
                            />

                            <small>
                                {title.trim().length}/150 characters
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="request-description">
                                Description
                            </label>

                            <textarea
                                id="request-description"
                                placeholder="Describe the procurement requirements..."
                                value={description}
                                onChange={(e) => {
                                    setDescription(e.target.value);
                                    setError("");
                                }}
                                rows={6}
                                maxLength={2000}
                                required
                                disabled={loading}
                            />

                            <small>
                                {description.trim().length}/2000 characters
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="request-priority">
                                Priority
                            </label>

                            <select
                                id="request-priority"
                                value={priority}
                                onChange={(e) =>
                                    setPriority(e.target.value)
                                }
                                disabled={loading}
                            >
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                                <option value="URGENT">Urgent</option>
                            </select>
                        </div>

                        <div className="form-actions">
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() => navigate("/dashboard")}
                                disabled={loading}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="primary-button"
                                disabled={loading}
                            >
                                {loading
                                    ? "Submitting..."
                                    : "Submit Request"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default NewRequest;
