const express = require("express");

const {
    createRequest,
    approveRequest,
    rejectRequest,
    getApprovedRequests,
    getProcurementRequests,
    processRequest,
    completeRequest,
    getMyRequests,
    getPendingRequests,
    getRequestDetail
} = require("../controllers/procurementController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

// EMPLOYEE
router.post(
    "/",
    authenticateToken,
    authorizeRoles("EMPLOYEE"),
    createRequest
);

router.get(
    "/my",
    authenticateToken,
    authorizeRoles("EMPLOYEE"),
    getMyRequests
);

router.get(
    "/pending",
    authenticateToken,
    authorizeRoles("SUPERVISOR"),
    getPendingRequests
);

// SUPERVISOR
router.patch(
    "/:id/approve",
    authenticateToken,
    authorizeRoles("SUPERVISOR"),
    approveRequest
);

router.patch(
    "/:id/reject",
    authenticateToken,
    authorizeRoles("SUPERVISOR"),
    rejectRequest
);

// PROCUREMENT
router.get(
    "/procurement",
    authenticateToken,
    authorizeRoles("PROCUREMENT"),
    getProcurementRequests
);

router.get(
    "/approved",
    authenticateToken,
    authorizeRoles("PROCUREMENT"),
    getApprovedRequests
);

router.patch(
    "/:id/process",
    authenticateToken,
    authorizeRoles("PROCUREMENT"),
    processRequest
);

router.patch(
    "/:id/complete",
    authenticateToken,
    authorizeRoles("PROCUREMENT"),
    completeRequest
);

router.get(
    "/:id",
    authenticateToken,
    getRequestDetail
);

module.exports = router;