import jwt from "jsonwebtoken";

const extractToken = (req) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.split(" ")[1];
    }

    if (req.cookies?.access_token) {
        return req.cookies.access_token;
    }

    return null;
};

const optionalAuth = (req, res, next) => {
    try {
        const token = extractToken(req);

        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded || !decoded.user_id) {
            req.user = null;
            return next();
        }

        req.user = decoded;

        console.log("[optionalAuth] userId:", req.user.user_id);

        return next();
    } catch (error) {
        console.error("[optionalAuth] error:", error.message);
        req.user = null;
        return next();
    }
};

export default optionalAuth;
