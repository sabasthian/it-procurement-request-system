const { Op } = require("sequelize");
const ProcurementRequest = require("../models/ProcurementRequest");
const User = require("../models/User");

const createRequest = async (req, res) => {
    try {
        const {
            title,
            description,
            priority
        } = req.body;

        if (!title || !description) {
            return res.status(400).json({
                message: "Title and description are required"
            });
        }

        const validPriorities = [
            "LOW",
            "MEDIUM",
            "HIGH",
            "URGENT"
        ];

        if (priority && !validPriorities.includes(priority)) {
            return res.status(400).json({
                message: "Invalid priority. Use LOW, MEDIUM, HIGH, or URGENT."
            });
        }

        const requestNumber = `PR-${Date.now()}`;

        const request = await ProcurementRequest.create({
            requestNumber,
            title,
            description,
            priority: priority || "MEDIUM",
            requestedBy: req.user.id
        });

        return res.status(201).json({
            message: "Procurement request created successfully",
            request
        });

    } catch (error) {
        console.error("Create request error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


const approveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { approvalNote } = req.body;

        const request = await ProcurementRequest.findByPk(id);

        if (!request) {
            return res.status(404).json({
                message: "Procurement request not found"
            });
        }

        if (request.status !== "PENDING") {
            return res.status(400).json({
                message: "Only pending requests can be approved"
            });
        }

        await request.update({
            status: "APPROVED",
            approvedBy: req.user.id,
            approvalNote: approvalNote || null
        });

        return res.json({
            message: "Procurement request approved successfully",
            request
        });

    } catch (error) {
        console.error("Approve request error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


const rejectRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { approvalNote } = req.body;

        const request = await ProcurementRequest.findByPk(id);

        if (!request) {
            return res.status(404).json({
                message: "Procurement request not found"
            });
        }

        if (request.status !== "PENDING") {
            return res.status(400).json({
                message: "Only pending requests can be rejected"
            });
        }

        if (!approvalNote) {
            return res.status(400).json({
                message: "Rejection note is required"
            });
        }

        await request.update({
            status: "REJECTED",
            approvedBy: req.user.id,
            approvalNote
        });

        return res.json({
            message: "Procurement request rejected successfully",
            request
        });

    } catch (error) {
        console.error("Reject request error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


const getPendingRequests = async (req, res) => {
    try {
        const requests = await ProcurementRequest.findAll({
            where: {
                status: "PENDING"
            },
            order: [["createdAt", "DESC"]]
        });

        return res.json({
            count: requests.length,
            requests
        });

    } catch (error) {
        console.error("Get pending requests error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


const getApprovedRequests = async (req, res) => {
    try {
        const requests = await ProcurementRequest.findAll({
            where: {
                status: "APPROVED"
            },
            order: [["updatedAt", "DESC"]]
        });

        return res.json({
            count: requests.length,
            requests
        });

    } catch (error) {
        console.error("Get approved requests error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


const getProcurementRequests = async (req, res) => {
    try {
        const requests = await ProcurementRequest.findAll({
            where: {
                status: {
                    [Op.in]: [
                        "APPROVED",
                        "PROCESSING"
                    ]
                }
            },
            order: [["updatedAt", "DESC"]]
        });

        return res.json({
            count: requests.length,
            requests
        });

    } catch (error) {
        console.error(
            "Get procurement requests error:",
            error
        );

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


const processRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await ProcurementRequest.findByPk(id);

        if (!request) {
            return res.status(404).json({
                message: "Procurement request not found"
            });
        }

        if (request.status !== "APPROVED") {
            return res.status(400).json({
                message: "Only approved requests can be processed"
            });
        }

        await request.update({
            status: "PROCESSING"
        });

        return res.json({
            message: "Procurement request is now being processed",
            request
        });

    } catch (error) {
        console.error("Process request error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


const completeRequest = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await ProcurementRequest.findByPk(id);

        if (!request) {
            return res.status(404).json({
                message: "Procurement request not found"
            });
        }

        if (request.status !== "PROCESSING") {
            return res.status(400).json({
                message: "Only processing requests can be completed"
            });
        }

        await request.update({
            status: "COMPLETED"
        });

        return res.json({
            message: "Procurement request completed successfully",
            request
        });

    } catch (error) {
        console.error("Complete request error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


const getMyRequests = async (req, res) => {
    try {
        const requests = await ProcurementRequest.findAll({
            where: {
                requestedBy: req.user.id
            },
            order: [["createdAt", "DESC"]]
        });

        return res.json({
            count: requests.length,
            requests
        });

    } catch (error) {
        console.error("Get my requests error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

const getRequestDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const request = await ProcurementRequest.findByPk(id);

        if (!request) {
            return res.status(404).json({
                message: "Procurement request not found"
            });
        }

        const requester = await User.findByPk(
            request.requestedBy,
            {
                attributes: [
                    "id",
                    "name",
                    "email",
                    "role"
                ]
            }
        );

        let approver = null;

        if (request.approvedBy) {
            approver = await User.findByPk(
                request.approvedBy,
                {
                    attributes: [
                        "id",
                        "name",
                        "email",
                        "role"
                    ]
                }
            );
        }

        return res.json({
            request,
            requester,
            approver
        });

    } catch (error) {
        console.error(
            "Get request detail error:",
            error
        );

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = {
    createRequest,
    approveRequest,
    rejectRequest,
    getPendingRequests,
    getApprovedRequests,
    getProcurementRequests,
    processRequest,
    completeRequest,
    getMyRequests,
    getRequestDetail
};