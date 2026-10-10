const express = require("express");

const {
    register,
    login
} = require("../controllers/authController");

const {
    authenticateToken,
    authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get(
    "/profile",
    authenticateToken,
    (req, res) => {
        res.json({
            message: "Authenticated successfully",
            user: req.user
        });
    }
);

router.get(
    "/employee-area",
    authenticateToken,
    authorizeRoles("EMPLOYEE"),
    (req, res) => {
        res.json({
            message: "Welcome to Employee Area",
            user: req.user
        });
    }
);

module.exports = router;