
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ProcurementDashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Notification and action states
    const [actionMessage, setActionMessage] = useState("");
    const [actionType, setActionType] = useState("");
    const [processingId, setProcessingId] = useState(null);

    // Search and filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [priorityFilter, setPriorityFilter] = useState("ALL");

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            navigate("/");
            return;
        }

        try {
            const parsedUser = JSON.parse(storedUser);

            if (parsedUser.role !== "PROCUREMENT") {
                navigate("/dashboard");
                return;
            }

            setUser(parsedUser);
            fetchRequests();
        } catch {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            navigate("/");
        }
    }, [navigate]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                throw new Error(
                    "Your session has expired. Please log in again."
                );
            }

            const response = await api.get("/requests/procurement", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setRequests(response.data.requests || []);
        } catch (requestError) {
            console.error(
                "Failed to fetch procurement requests:",
                requestError
            );

            setError(
                requestError.response?.data?.message ||
                requestError.message ||
                "Failed to load procurement requests."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const dismissNotification = () => {
        setActionMessage("");
        setActionType("");
    };

    const handleProcess = async (id) => {
        if (processingId !== null) return;

        const confirmed = window.confirm(
            "Start processing this procurement request?"
        );

        if (!confirmed) return;

        const token = localStorage.getItem("token");

        if (!token) {
            setActionType("error");
            setActionMessage(
                "Your session has expired. Please log in again."
            );
            return;
        }

        setProcessingId(id);
        setActionMessage("");
        setActionType("");

        try {
            await api.patch(
                `/requests/${id}/process`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setActionType("success");
            setActionMessage(
                "Procurement request is now being processed."
            );

            await fetchRequests();
        } catch (requestError) {
            console.error("Process request error:", requestError);

            setActionType("error");
            setActionMessage(
                requestError.response?.data?.message ||
                requestError.message ||
                "Failed to start processing the request."
            );
        } finally {
            setProcessingId(null);
        }
    };

    const handleComplete = async (id) => {
        if (processingId !== null) return;

        const confirmed = window.confirm(
            "Are you sure you want to mark this request as completed?"
        );

        if (!confirmed) return;

        const token = localStorage.getItem("token");

        if (!token) {
            setActionType("error");
            setActionMessage(
                "Your session has expired. Please log in again."
            );
            return;
        }

        setProcessingId(id);
        setActionMessage("");
        setActionType("");

        try {
            await api.patch(
                `/requests/${id}/complete`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setActionType("success");
            setActionMessage(
                "Procurement request completed successfully."
            );

            await fetchRequests();
        } catch (requestError) {
            console.error("Complete request error:", requestError);

            setActionType("error");
            setActionMessage(
                requestError.response?.data?.message ||
                requestError.message ||
                "Failed to complete the request."
            );
        } finally {
            setProcessingId(null);
        }
    };

    // Search and filter
    const filteredRequests = requests.filter((request) => {
        const searchText = search.toLowerCase().trim();

        const matchesSearch =
            !searchText ||
            request.requestNumber?.toLowerCase().includes(searchText) ||
            request.title?.toLowerCase().includes(searchText) ||
            request.description?.toLowerCase().includes(searchText);

        const matchesStatus =
            statusFilter === "ALL" ||
            request.status === statusFilter;

        const matchesPriority =
            priorityFilter === "ALL" ||
            request.priority === priorityFilter;

        return (
            matchesSearch &&
            matchesStatus &&
            matchesPriority
        );
    });

    const handleResetFilters = () => {
        setSearch("");
        setStatusFilter("ALL");
        setPriorityFilter("ALL");
    };

    const approvedCount = requests.filter(
        (request) => request.status === "APPROVED"
    ).length;

    const processingCount = requests.filter(
        (request) => request.status === "PROCESSING"
    ).length;

    if (!user || loading) {
        return (
            <div className="loading-page">
                <p>Loading Procurement Dashboard...</p>
            </div>
        );
    }

    if (error && requests.length === 0) {
        return (
            <div className="dashboard">
                <header className="dashboard-header">
                    <div>
                        <h1>IT Procurement</h1>
                        <p>Internal Procurement Management System</p>
                    </div>

                    <button onClick={handleLogout}>
                        Logout
                    </button>
                </header>

                <main className="dashboard-content">
                    <div className="empty-state">
                        <div className="empty-icon">⚠️</div>
                        <h3>Failed to Load Requests</h3>
                        <p>{error}</p>

                        <button
                            className="primary-button"
                            onClick={fetchRequests}
                            disabled={loading}
                        >
                            {loading ? "Loading..." : "Try Again"}
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div>
                    <h1>IT Procurement</h1>
                    <p>Internal Procurement Management System</p>
                </div>

                <div className="user-section">
                    <div>
                        <strong>{user.name}</strong>
                        <span>{user.role}</span>
                    </div>

                    <button onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>

            <main className="dashboard-content">
                <div className="welcome-card">
                    <p>Procurement Workspace</p>
                    <h2>Welcome back, {user.name} 👋</h2>
                    <span>
                        Process approved IT procurement requests.
                    </span>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <span>Approved</span>
                        <strong>{approvedCount}</strong>
                    </div>

                    <div className="stat-card">
                        <span>Processing</span>
                        <strong>{processingCount}</strong>
                    </div>

                    <div className="stat-card">
                        <span>Total Requests</span>
                        <strong>{requests.length}</strong>
                    </div>
                </div>

                <div className="request-section">
                    <div className="section-header">
                        <div>
                            <h2>Procurement Queue</h2>
                            <p>
                                Manage approved procurement requests.
                            </p>
                        </div>
                    </div>

                    {actionMessage && (
                        <div
                            className={
                                actionType === "success"
                                    ? "success-message"
                                    : "error-message"
                            }
                            role={
                                actionType === "success"
                                    ? "status"
                                    : "alert"
                            }
                        >
                            <span>{actionMessage}</span>

                            <button
                                type="button"
                                onClick={dismissNotification}
                                aria-label="Dismiss notification"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="error-message" role="alert">
                            <p>{error}</p>

                            <button
                                className="primary-button"
                                onClick={fetchRequests}
                                disabled={loading}
                            >
                                {loading ? "Loading..." : "Try Again"}
                            </button>
                        </div>
                    )}

                    {/* Search and filters */}
                    <div className="filter-section">
                        <input
                            type="text"
                            placeholder="Search request number, title, or description..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(event.target.value)
                            }
                        >
                            <option value="ALL">All Status</option>
                            <option value="APPROVED">Approved</option>
                            <option value="PROCESSING">Processing</option>
                        </select>

                        <select
                            value={priorityFilter}
                            onChange={(event) =>
                                setPriorityFilter(event.target.value)
                            }
                        >
                            <option value="ALL">All Priority</option>
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="URGENT">Urgent</option>
                        </select>

                        <button
                            className="detail-button"
                            onClick={handleResetFilters}
                        >
                            Reset
                        </button>
                    </div>

                    {requests.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">✓</div>
                            <h3>No active requests</h3>
                            <p>
                                There are no approved or processing
                                procurement requests at the moment.
                            </p>
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🔍</div>
                            <h3>No matching requests</h3>
                            <p>
                                No requests match your current search
                                or filters.
                            </p>

                            <button
                                className="detail-button"
                                onClick={handleResetFilters}
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <div className="request-list">
                            {filteredRequests.map((request) => {
                                const isProcessing =
                                    processingId === request.id;

                                return (
                                    <div
                                        className="request-item"
                                        key={request.id}
                                    >
                                        <div>
                                            <span className="request-number">
                                                {request.requestNumber}
                                            </span>

                                            <h3>{request.title}</h3>
                                            <p>{request.description}</p>

                                            <small>
                                                Requested by User ID:{" "}
                                                {request.requestedBy}
                                            </small>
                                        </div>

                                        <div className="request-meta">
                                            <span
                                                className={`status ${request.status.toLowerCase()}`}
                                            >
                                                {request.status}
                                            </span>

                                            <span
                                                className={`priority ${request.priority.toLowerCase()}`}
                                            >
                                                {request.priority}
                                            </span>

                                            <div className="request-actions">
                                                {request.status === "APPROVED" && (
                                                    <button
                                                        type="button"
                                                        className="approve-button"
                                                        onClick={() =>
                                                            handleProcess(request.id)
                                                        }
                                                        disabled={processingId !== null}
                                                    >
                                                        {isProcessing
                                                            ? "Processing..."
                                                            : "Start Processing"}
                                                    </button>
                                                )}

                                                {request.status === "PROCESSING" && (
                                                    <button
                                                        type="button"
                                                        className="approve-button"
                                                        onClick={() =>
                                                            handleComplete(request.id)
                                                        }
                                                        disabled={processingId !== null}
                                                    >
                                                        {isProcessing
                                                            ? "Completing..."
                                                            : "Mark Completed"}
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    className="detail-button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/requests/${request.id}`
                                                        )
                                                    }
                                                    disabled={processingId !== null}
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default ProcurementDashboard;
