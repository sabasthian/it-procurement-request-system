import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function RequestDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchRequestDetail();
    }, [id]);

    const fetchRequestDetail = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await api.get(
                `/requests/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setData(response.data);

        } catch (error) {
            console.error(
                "Failed to fetch request detail:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load request detail."
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

    if (loading) {
        return (
            <div className="loading-page">
                <p>Loading request details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="loading-page">
                <p>{error}</p>

                <button
                    className="primary-button"
                    onClick={() => navigate(-1)}
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    const {
        request,
        requester,
        approver
    } = data;

    return (
        <div className="dashboard">

            <header className="dashboard-header">

                <div>
                    <h1>IT Procurement</h1>

                    <p>
                        Internal Procurement Management System
                    </p>
                </div>

                <div className="user-section">

                    <div>
                        <strong>
                            {requester?.name || "User"}
                        </strong>

                        <span>
                            {requester?.role || ""}
                        </span>
                    </div>

                    <button onClick={handleLogout}>
                        Logout
                    </button>

                </div>

            </header>


            <main className="dashboard-content">

                <button
                    className="back-button"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>


                <div className="detail-card">

                    <div className="detail-header">

                        <div>
                            <span className="request-number">
                                {request.requestNumber}
                            </span>

                            <h2>
                                {request.title}
                            </h2>

                            <p>
                                Procurement Request Details
                            </p>
                        </div>

                        <div className="detail-badges">

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

                        </div>

                    </div>


                    <div className="detail-section">

                        <h3>
                            Request Description
                        </h3>

                        <p className="detail-description">
                            {request.description}
                        </p>

                    </div>


                    <div className="detail-grid">

                        <div className="detail-section">

                            <h3>
                                Requester
                            </h3>

                            <div className="person-card">

                                <strong>
                                    {requester?.name || "-"}
                                </strong>

                                <span>
                                    {requester?.email || "-"}
                                </span>

                                <small>
                                    {requester?.role || "-"}
                                </small>

                            </div>

                        </div>


                        <div className="detail-section">

                            <h3>
                                Approval
                            </h3>

                            {approver ? (

                                <div className="person-card">

                                    <strong>
                                        {approver.name}
                                    </strong>

                                    <span>
                                        {approver.email}
                                    </span>

                                    <small>
                                        {approver.role}
                                    </small>

                                </div>

                            ) : (

                                <div className="not-available">
                                    Awaiting supervisor review
                                </div>

                            )}

                        </div>

                    </div>


                    {request.approvalNote && (

                        <div className="detail-section">

                            <h3>
                                Approval Note
                            </h3>

                            <div className="approval-note">
                                {request.approvalNote}
                            </div>

                        </div>

                    )}


                    <div className="detail-grid">

                        <div className="detail-section">

                            <h3>
                                Created
                            </h3>

                            <p>
                                {new Date(
                                    request.createdAt
                                ).toLocaleString("en-US")}
                            </p>

                        </div>


                        <div className="detail-section">

                            <h3>
                                Last Updated
                            </h3>

                            <p>
                                {new Date(
                                    request.updatedAt
                                ).toLocaleString("en-US")}
                            </p>

                        </div>

                    </div>

                </div>

            </main>

        </div>
    );
}

export default RequestDetail;