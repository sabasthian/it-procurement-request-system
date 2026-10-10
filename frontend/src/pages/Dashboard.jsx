import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Dashboard() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Search & Filter
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [priorityFilter, setPriorityFilter] = useState("ALL");

    useEffect(() => {
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await api.get("/requests/my", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setRequests(response.data.requests);

        } catch (error) {
            console.error(
                "Failed to fetch requests:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load your procurement requests."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "/";
    };

    // Loading state
    if (!user) {
        return <p>Loading...</p>;
    }

    if (loading) {
        return (
            <div className="dashboard">
                <main className="dashboard-content">

                    <div className="empty-state">

                        <div className="empty-icon">
                            ⏳
                        </div>

                        <h3>
                            Loading Dashboard...
                        </h3>

                        <p>
                            Please wait while we load your
                            procurement requests.
                        </p>

                    </div>

                </main>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="dashboard">
                <main className="dashboard-content">

                    <div className="empty-state">

                        <div className="empty-icon">
                            ⚠️
                        </div>

                        <h3>
                            Failed to Load Requests
                        </h3>

                        <p>
                            {error}
                        </p>

                        <button
                            className="primary-button"
                            onClick={fetchRequests}
                        >
                            Try Again
                        </button>

                    </div>

                </main>
            </div>
        );
    }

    // Statistics
    const pendingCount = requests.filter(
        (request) => request.status === "PENDING"
    ).length;

    const approvedCount = requests.filter(
        (request) => request.status === "APPROVED"
    ).length;

    const completedCount = requests.filter(
        (request) => request.status === "COMPLETED"
    ).length;

    // Search & Filter
    const filteredRequests = requests.filter((request) => {

        const searchText = search.toLowerCase().trim();

        const matchesSearch =
            request.requestNumber
                ?.toLowerCase()
                .includes(searchText) ||
            request.title
                ?.toLowerCase()
                .includes(searchText) ||
            request.description
                ?.toLowerCase()
                .includes(searchText);

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

    const handleResetFilter = () => {
        setSearch("");
        setStatusFilter("ALL");
        setPriorityFilter("ALL");
    };

    return (
        <div className="dashboard">

            {/* HEADER */}
            <header className="dashboard-header">

                <div>
                    <h1>
                        IT Procurement
                    </h1>

                    <p>
                        Internal Procurement Management System
                    </p>
                </div>

                <div className="user-section">

                    <div>
                        <strong>
                            {user.name}
                        </strong>

                        <span>
                            {user.role}
                        </span>
                    </div>

                    <button onClick={handleLogout}>
                        Logout
                    </button>

                </div>

            </header>


            {/* CONTENT */}
            <main className="dashboard-content">

                {/* WELCOME */}
                <div className="welcome-card">

                    <p>
                        Welcome back,
                    </p>

                    <h2>
                        {user.name} 👋
                    </h2>

                    <span>
                        Manage your IT procurement requests
                        from this dashboard.
                    </span>

                </div>


                {/* STATISTICS */}
                <div className="stats-grid">

                    <div className="stat-card">

                        <span>
                            Total Requests
                        </span>

                        <strong>
                            {requests.length}
                        </strong>

                    </div>


                    <div className="stat-card">

                        <span>
                            Pending
                        </span>

                        <strong>
                            {pendingCount}
                        </strong>

                    </div>


                    <div className="stat-card">

                        <span>
                            Approved
                        </span>

                        <strong>
                            {approvedCount}
                        </strong>

                    </div>


                    <div className="stat-card">

                        <span>
                            Completed
                        </span>

                        <strong>
                            {completedCount}
                        </strong>

                    </div>

                </div>


                {/* REQUEST SECTION */}
                <div className="request-section">

                    <div className="section-header">

                        <div>

                            <h2>
                                My Procurement Requests
                            </h2>

                            <p>
                                Track your submitted requests
                            </p>

                        </div>


                        <button
                            className="primary-button"
                            onClick={() => navigate("/requests/new")}
                        >
                            + New Request
                        </button>

                    </div>


                    {/* SEARCH & FILTER */}
                    <div className="filter-section">

                        <input
                            type="text"
                            placeholder="Search request..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />


                        <select
                            value={statusFilter}
                            onChange={(e) =>
                                setStatusFilter(e.target.value)
                            }
                        >

                            <option value="ALL">
                                All Status
                            </option>

                            <option value="PENDING">
                                Pending
                            </option>

                            <option value="APPROVED">
                                Approved
                            </option>

                            <option value="REJECTED">
                                Rejected
                            </option>

                            <option value="PROCESSING">
                                Processing
                            </option>

                            <option value="COMPLETED">
                                Completed
                            </option>

                        </select>


                        <select
                            value={priorityFilter}
                            onChange={(e) =>
                                setPriorityFilter(e.target.value)
                            }
                        >

                            <option value="ALL">
                                All Priority
                            </option>

                            <option value="LOW">
                                Low
                            </option>

                            <option value="MEDIUM">
                                Medium
                            </option>

                            <option value="HIGH">
                                High
                            </option>

                            <option value="URGENT">
                                Urgent
                            </option>

                        </select>


                        <button
                            className="detail-button"
                            onClick={handleResetFilter}
                        >
                            Reset
                        </button>

                    </div>


                    {/* NO REQUEST AT ALL */}
                    {requests.length === 0 ? (

                        <div className="empty-state">

                            <div className="empty-icon">
                                📦
                            </div>

                            <h3>
                                No requests yet
                            </h3>

                            <p>
                                You haven't submitted any
                                procurement requests.
                            </p>

                            <button
                                className="primary-button"
                                onClick={() =>
                                    navigate("/requests/new")
                                }
                            >
                                Create Your First Request
                            </button>

                        </div>

                    ) : filteredRequests.length === 0 ? (

                        /* NO MATCHING RESULT */
                        <div className="empty-state">

                            <div className="empty-icon">
                                🔍
                            </div>

                            <h3>
                                No matching requests
                            </h3>

                            <p>
                                No procurement requests match
                                your current search or filters.
                            </p>

                            <button
                                className="detail-button"
                                onClick={handleResetFilter}
                            >
                                Clear Filters
                            </button>

                        </div>

                    ) : (

                        /* REQUEST LIST */
                        <div className="request-list">

                            {filteredRequests.map((request) => (

                                <div
                                    className="request-item"
                                    key={request.id}
                                >

                                    <div>

                                        <span className="request-number">
                                            {request.requestNumber}
                                        </span>

                                        <h3>
                                            {request.title}
                                        </h3>

                                        <p>
                                            {request.description}
                                        </p>

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

                                            <button
                                                className="detail-button"
                                                onClick={() =>
                                                    navigate(
                                                        `/requests/${request.id}`
                                                    )
                                                }
                                            >
                                                View Details
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            </main>

        </div>
    );
}

export default Dashboard;