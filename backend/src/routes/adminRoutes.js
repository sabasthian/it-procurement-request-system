const express = require("express");

const {
    getAllUsers,
    toggleUserStatus,
    changeUserRole,
    getAllRequests
} = require("../controllers/adminController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/users",
    authenticateToken,
    authorizeRoles("ADMIN"),
    getAllUsers
);

router.get(
    "/requests",
    authenticateToken,
    authorizeRoles("ADMIN"),
    getAllRequests
);

router.patch(
    "/users/:id/toggle-status",
    authenticateToken,
    authorizeRoles("ADMIN"),
    toggleUserStatus
);

router.patch(
    "/users/:id/role",
    authenticateToken,
    authorizeRoles("ADMIN"),
    changeUserRole
);


module.exports = router;