import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminDashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [requests, setRequests] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [feedback, setFeedback] = useState("");

    const [requestSearch, setRequestSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [priorityFilter, setPriorityFilter] = useState("ALL");
    const [requesterFilter, setRequesterFilter] = useState("ALL");
    const [dateFilter, setDateFilter] = useState("");

    const [updatingUserId, setUpdatingUserId] = useState(null);

    const getAuthConfig = () => {
        const token = localStorage.getItem("token");

        if (!token) {
            throw new Error("Your session has expired. Please log in again.");
        }

        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    };

    const fetchUsers = useCallback(async () => {
        const response = await api.get("/admin/users", getAuthConfig());

        setUsers(response.data.users || []);
    }, []);

    const fetchRequests = useCallback(async () => {
        const response = await api.get("/admin/requests", getAuthConfig());

        setRequests(response.data.requests || []);
    }, []);

    const loadDashboard = useCallback(async () => {
        setError("");

        const results = await Promise.allSettled([
            fetchUsers(),
            fetchRequests(),
        ]);

        const failedResults = results.filter(
            (result) => result.status === "rejected"
        );

        if (failedResults.length > 0) {
            const firstError = failedResults[0].reason;

            setError(
                firstError.response?.data?.message ||
                firstError.message ||
                "Failed to load dashboard data."
            );
        } else {
            setError("");
        }

        return failedResults.length === 0;
    }, [fetchUsers, fetchRequests]);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            navigate("/");
            return;
        }

        try {
            const parsedUser = JSON.parse(storedUser);

            if (parsedUser.role !== "ADMIN") {
                navigate("/dashboard");
                return;
            }

            setUser(parsedUser);

            loadDashboard().finally(() => {
                setLoading(false);
            });
        } catch {
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            navigate("/");
        }
    }, [navigate, loadDashboard]);

    const handleRetry = async () => {
        setRefreshing(true);

        try {
            await loadDashboard();
        } finally {
            setRefreshing(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/");
    };

    const handleToggleStatus = async (targetUser) => {
        const action = targetUser.isActive ? "deactivate" : "activate";

        const confirmed = window.confirm(
            `Are you sure you want to ${action} ${targetUser.name}'s account?`
        );

        if (!confirmed) {
            return;
        }

        setUpdatingUserId(targetUser.id);
        setError("");
        setFeedback("");

        try {
            await api.patch(
                `/admin/users/${targetUser.id}/toggle-status`,
                {},
                getAuthConfig()
            );

            await fetchUsers();

            setFeedback(
                `${targetUser.name}'s account has been ${
                    targetUser.isActive ? "deactivated" : "activated"
                } successfully.`
            );
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                requestError.message ||
                "Failed to update user status."
            );
        } finally {
            setUpdatingUserId(null);
        }
    };

    const handleChangeRole = async (targetUser, newRole) => {
        if (targetUser.role === "ADMIN") {
            setError("The Admin role is protected.");
            return;
        }

        if (targetUser.role === newRole) {
            return;
        }

        const confirmed = window.confirm(
            `Change ${targetUser.name}'s role from ${targetUser.role} to ${newRole}?`
        );

        if (!confirmed) {
            return;
        }

        setUpdatingUserId(targetUser.id);
        setError("");
        setFeedback("");

        try {
            await api.patch(
                `/admin/users/${targetUser.id}/role`,
                { role: newRole },
                getAuthConfig()
            );

            await fetchUsers();

            setFeedback(
                `${targetUser.name}'s role has been changed to ${newRole}.`
            );
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                requestError.message ||
                "Failed to update user role."
            );

            // Refresh the table to restore the role returned by the server.
            try {
                await fetchUsers();
            } catch {
                // Keep the original error visible.
            }
        } finally {
            setUpdatingUserId(null);
        }
    };

    const resetFilters = () => {
        setRequestSearch("");
        setStatusFilter("ALL");
        setPriorityFilter("ALL");
        setRequesterFilter("ALL");
        setDateFilter("");
    };

    const getDateKey = (dateValue) => {
        if (!dateValue) {
            return "";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;
    };

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "-";
        }

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "-";
        }

        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const filteredRequests = useMemo(() => {
        const searchText = requestSearch.toLowerCase().trim();

        return requests.filter((request) => {
            const searchableValues = [
                request.requestNumber,
                request.title,
                request.description,
                request.requester?.name,
                request.requester?.email,
            ];

            const searchMatch =
                !searchText ||
                searchableValues.some((value) =>
                    String(value || "")
                        .toLowerCase()
                        .includes(searchText)
                );

            const statusMatch =
                statusFilter === "ALL" ||
                request.status === statusFilter;

            const priorityMatch =
                priorityFilter === "ALL" ||
                request.priority === priorityFilter;

            const requesterMatch =
                requesterFilter === "ALL" ||
                String(request.requestedBy) === requesterFilter;

            const dateMatch =
                !dateFilter || getDateKey(request.createdAt) === dateFilter;

            return (
                searchMatch &&
                statusMatch &&
                priorityMatch &&
                requesterMatch &&
                dateMatch
            );
        });
    }, [
        requests,
        requestSearch,
        statusFilter,
        priorityFilter,
        requesterFilter,
        dateFilter,
    ]);

    if (loading) {
        return (
            <div className="loading-page">
                <p>Loading Admin Dashboard...</p>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const employeeCount = users.filter(
        (item) => item.role === "EMPLOYEE"
    ).length;

    const supervisorCount = users.filter(
        (item) => item.role === "SUPERVISOR"
    ).length;

    const procurementCount = users.filter(
        (item) => item.role === "PROCUREMENT"
    ).length;

    const activeUsers = users.filter(
        (item) => item.isActive
    ).length;

    const inactiveUsers = users.filter(
        (item) => !item.isActive
    ).length;

    const totalRequests = requests.length;

    const pendingRequests = requests.filter(
        (item) => item.status === "PENDING"
    ).length;

    const approvedRequests = requests.filter(
        (item) => item.status === "APPROVED"
    ).length;

    const processingRequests = requests.filter(
        (item) => item.status === "PROCESSING"
    ).length;

    const completedRequests = requests.filter(
        (item) => item.status === "COMPLETED"
    ).length;

    const rejectedRequests = requests.filter(
        (item) => item.status === "REJECTED"
    ).length;

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
                {/* Welcome */}
                <div className="welcome-card">
                    <p>Administration Workspace</p>

                    <h2>
                        Welcome back, {user.name} 👋
                    </h2>

                    <span>
                        Manage users, permissions, and procurement
                        activities across the system.
                    </span>
                </div>

                {/* Notifications */}
                {feedback && (
                    <div
                        className="success-message"
                        role="status"
                    >
                        <span>{feedback}</span>

                        <button
                            type="button"
                            onClick={() => setFeedback("")}
                            aria-label="Dismiss success message"
                        >
                            ×
                        </button>
                    </div>
                )}

                {error && (
                    <div
                        className="error-message"
                        role="alert"
                    >
                        <span>{error}</span>

                        <button
                            type="button"
                            onClick={() => setError("")}
                            aria-label="Dismiss error message"
                        >
                            ×
                        </button>
                    </div>
                )}

                {/* User statistics */}
                <section aria-label="User statistics">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <span>Total Users</span>
                            <strong>{users.length}</strong>
                        </div>

                        <div className="stat-card">
                            <span>Employees</span>
                            <strong>{employeeCount}</strong>
                        </div>

                        <div className="stat-card">
                            <span>Supervisors</span>
                            <strong>{supervisorCount}</strong>
                        </div>

                        <div className="stat-card">
                            <span>Procurement</span>
                            <strong>{procurementCount}</strong>
                        </div>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card">
                            <span>Active Users</span>
                            <strong>{activeUsers}</strong>
                        </div>

                        <div className="stat-card">
                            <span>Inactive Users</span>
                            <strong>{inactiveUsers}</strong>
                        </div>
                    </div>
                </section>

                {/* Procurement statistics */}
                <section aria-label="Procurement statistics">
                    <div className="stats-grid procurement-stats">
                        <div className="stat-card">
                            <span>Total Requests</span>
                            <strong>{totalRequests}</strong>
                        </div>

                        <div className="stat-card">
                            <span>Pending</span>
                            <strong>{pendingRequests}</strong>
                        </div>

                        <div className="stat-card">
                            <span>Approved</span>
                            <strong>{approvedRequests}</strong>
                        </div>

                        <div className="stat-card">
                            <span>Processing</span>
                            <strong>{processingRequests}</strong>
                        </div>

                        <div className="stat-card">
                            <span>Completed</span>
                            <strong>{completedRequests}</strong>
                        </div>

                        <div className="stat-card">
                            <span>Rejected</span>
                            <strong>{rejectedRequests}</strong>
                        </div>
                    </div>
                </section>

                {/* User management */}
                <section className="request-section">
                    <div className="section-header">
                        <div>
                            <h2>User Management</h2>
                            <p>
                                Manage system users, roles, and account
                                access.
                            </p>
                        </div>

                        <div className="request-result-count">
                            {users.length} user
                            {users.length !== 1 ? "s" : ""}
                        </div>
                    </div>

                    <div className="user-table-wrapper">
                        <div className="user-table-container">
                            <table className="user-table">
                                <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                                </thead>

                                <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="empty-request"
                                        >
                                            No users found.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <strong>
                                                    {item.name}
                                                </strong>
                                            </td>

                                            <td>{item.email}</td>

                                            <td>
                                                {item.role === "ADMIN" ? (
                                                    <span className="role-badge admin">
                                                            ADMIN
                                                        </span>
                                                ) : (
                                                    <select
                                                        aria-label={`Change role for ${item.name}`}
                                                        value={item.role}
                                                        disabled={
                                                            updatingUserId ===
                                                            item.id
                                                        }
                                                        onChange={(event) =>
                                                            handleChangeRole(
                                                                item,
                                                                event.target
                                                                    .value
                                                            )
                                                        }
                                                    >
                                                        <option value="EMPLOYEE">
                                                            EMPLOYEE
                                                        </option>

                                                        <option value="SUPERVISOR">
                                                            SUPERVISOR
                                                        </option>

                                                        <option value="PROCUREMENT">
                                                            PROCUREMENT
                                                        </option>
                                                    </select>
                                                )}
                                            </td>

                                            <td>
                                                    <span
                                                        className={
                                                            item.isActive
                                                                ? "active-badge"
                                                                : "inactive-badge"
                                                        }
                                                    >
                                                        {item.isActive
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>
                                            </td>

                                            <td>
                                                {item.role === "ADMIN" ? (
                                                    <span className="protected-text">
                                                            Protected
                                                        </span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        className={
                                                            item.isActive
                                                                ? "deactivate-button"
                                                                : "activate-button"
                                                        }
                                                        disabled={
                                                            updatingUserId ===
                                                            item.id
                                                        }
                                                        onClick={() =>
                                                            handleToggleStatus(
                                                                item
                                                            )
                                                        }
                                                    >
                                                        {updatingUserId ===
                                                        item.id
                                                            ? "Updating..."
                                                            : item.isActive
                                                                ? "Deactivate"
                                                                : "Activate"}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Procurement monitoring */}
                <section className="request-section">
                    <div className="section-header">
                        <div>
                            <h2>Procurement Monitoring</h2>
                            <p>
                                Search, filter, and monitor procurement
                                requests across the system.
                            </p>
                        </div>

                        <div className="request-result-count">
                            {filteredRequests.length} of {requests.length}{" "}
                            request{requests.length !== 1 ? "s" : ""}
                        </div>
                    </div>

                    {/* Search and filters */}
                    <div className="admin-filter-panel">
                        <div className="filter-group">
                            <label htmlFor="request-search">
                                Search Request
                            </label>

                            <input
                                id="request-search"
                                type="text"
                                placeholder="Number, title, description, requester..."
                                value={requestSearch}
                                onChange={(event) =>
                                    setRequestSearch(event.target.value)
                                }
                            />
                        </div>

                        <div className="filter-group">
                            <label htmlFor="request-status-filter">
                                Status
                            </label>

                            <select
                                id="request-status-filter"
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(event.target.value)
                                }
                            >
                                <option value="ALL">All Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="PROCESSING">Processing</option>
                                <option value="COMPLETED">Completed</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label htmlFor="request-priority-filter">
                                Priority
                            </label>

                            <select
                                id="request-priority-filter"
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
                        </div>

                        <div className="filter-group">
                            <label htmlFor="requester-filter">
                                Requester
                            </label>

                            <select
                                id="requester-filter"
                                value={requesterFilter}
                                onChange={(event) =>
                                    setRequesterFilter(event.target.value)
                                }
                            >
                                <option value="ALL">All Requesters</option>

                                {users
                                    .filter(
                                        (item) => item.role === "EMPLOYEE"
                                    )
                                    .map((item) => (
                                        <option
                                            key={item.id}
                                            value={String(item.id)}
                                        >
                                            {item.name}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label htmlFor="request-date-filter">
                                Date
                            </label>

                            <input
                                id="request-date-filter"
                                type="date"
                                value={dateFilter}
                                onChange={(event) =>
                                    setDateFilter(event.target.value)
                                }
                            />
                        </div>

                        <button
                            type="button"
                            className="reset-filter-button"
                            onClick={resetFilters}
                        >
                            Reset Filters
                        </button>
                    </div>

                    {/* Retry loading data */}
                    {error && (
                        <div className="retry-actions">
                            <button
                                type="button"
                                onClick={handleRetry}
                                disabled={refreshing}
                            >
                                {refreshing
                                    ? "Refreshing..."
                                    : "Retry Loading Data"}
                            </button>
                        </div>
                    )}

                    {/* Request table */}
                    <div className="admin-request-table-container">
                        <table className="admin-request-table">
                            <thead>
                            <tr>
                                <th>Request</th>
                                <th>Requester</th>
                                <th>Title</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                            </thead>

                            <tbody>
                            {filteredRequests.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="empty-request"
                                    >
                                        {requests.length === 0
                                            ? "No procurement requests available."
                                            : "No requests match your search or filters."}
                                    </td>
                                </tr>
                            ) : (
                                filteredRequests.map((request) => (
                                    <tr key={request.id}>
                                        <td>
                                            <strong>
                                                {request.requestNumber ||
                                                    `Request #${request.id}`}
                                            </strong>
                                        </td>

                                        <td>
                                            <div className="requester-info">
                                                <strong>
                                                    {request.requester
                                                        ?.name || "Unknown"}
                                                </strong>

                                                <span>
                                                        {request.requester
                                                            ?.email || "-"}
                                                    </span>
                                            </div>
                                        </td>

                                        <td>
                                            <div>
                                                <strong>
                                                    {request.title || "-"}
                                                </strong>

                                                {request.description && (
                                                    <p className="request-description">
                                                        {request.description}
                                                    </p>
                                                )}
                                            </div>
                                        </td>

                                        <td>
                                                <span
                                                    className={`priority-badge ${(request.priority || "").toLowerCase()}`}
                                                >
                                                    {request.priority || "-"}
                                                </span>
                                        </td>

                                        <td>
                                                <span
                                                    className={`status-badge ${(request.status || "").toLowerCase()}`}
                                                >
                                                    {request.status || "-"}
                                                </span>
                                        </td>

                                        <td>
                                            {formatDate(request.createdAt)}
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