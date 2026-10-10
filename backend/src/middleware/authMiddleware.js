
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Access token is required",
        });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
        return res.status(401).json({
            message: "Access token is required",
        });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        console.error("JWT_SECRET is not configured.");

        return res.status(500).json({
            message: "Authentication service is not configured",
        });
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);

        if (
            !decoded ||
            typeof decoded !== "object" ||
            !decoded.id ||
            !decoded.role
        ) {
            return res.status(401).json({
                message: "Invalid token payload",
            });
        }

        req.user = decoded;

        return next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Token has expired. Please log in again.",
            });
        }

        if (
            error.name === "JsonWebTokenError" ||
            error.name === "NotBeforeError"
        ) {
            return res.status(401).json({
                message: "Invalid access token",
            });
        }

        console.error("JWT verification error:", error);

        return res.status(401).json({
            message: "Authentication failed",
        });
    }
};

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "You do not have permission to access this resource",
            });
        }

        return next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRoles,
};
