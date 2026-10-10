const User = require("../models/User");
const ProcurementRequest = require("../models/ProcurementRequest");

const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: [
                "id",
                "name",
                "email",
                "role",
                "isActive",
                "createdAt"
            ],
            order: [["createdAt", "DESC"]]
        });

        return res.json({
            count: users.length,
            users
        });

    } catch (error) {
        console.error("Get all users error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.role === "ADMIN") {
            return res.status(400).json({
                message: "Admin status cannot be changed"
            });
        }

        await user.update({
            isActive: !user.isActive
        });

        return res.json({
            message: user.isActive
                ? "User activated successfully"
                : "User deactivated successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        });

    } catch (error) {
        console.error("Toggle user status error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

const changeUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const allowedRoles = [
            "EMPLOYEE",
            "SUPERVISOR",
            "PROCUREMENT"
        ];

        if (!allowedRoles.includes(role)) {
            return res.status(400).json({
                message: "Invalid role"
            });
        }

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.role === "ADMIN") {
            return res.status(400).json({
                message: "Admin role cannot be changed"
            });
        }

        await user.update({
            role
        });

        return res.json({
            message: "User role updated successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        });

    } catch (error) {
        console.error("Change user role error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

const getAllRequests = async (req, res) => {
    try {
        const requests = await ProcurementRequest.findAll({
            order: [["createdAt", "DESC"]]
        });

        const requestsWithRequester = await Promise.all(
            requests.map(async (request) => {
                const requester = await User.findByPk(
                    request.requestedBy,
                    {
                        attributes: ["id", "name", "email"]
                    }
                );

                return {
                    id: request.id,
                    requestNumber: request.requestNumber,
                    title: request.title,
                    description: request.description,
                    priority: request.priority,
                    status: request.status,
                    requestedBy: request.requestedBy,
                    requester: requester
                        ? {
                            id: requester.id,
                            name: requester.name,
                            email: requester.email
                        }
                        : null,
                    approvedBy: request.approvedBy,
                    approvalNote: request.approvalNote,
                    createdAt: request.createdAt,
                    updatedAt: request.updatedAt
                };
            })
        );

        return res.json({
            count: requestsWithRequester.length,
            requests: requestsWithRequester
        });

    } catch (error) {
        console.error("Get all procurement requests error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

module.exports = {
    getAllUsers,
    toggleUserStatus,
    changeUserRole,
    getAllRequests
};