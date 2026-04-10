import jwt from "jsonwebtoken";
import User from "../models/user/User.js";

const extractToken = (req) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.split(" ")[1];
    }

    if (req.cookies?.token) {
        return req.cookies.token;
    }

    return null;
};

const optionalAuth = async (req, res, next) => {
    try {
        const token = extractToken(req);

        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Nếu muốn nhanh thì gán luôn decoded
        // req.user = decoded;

        // Nếu muốn chắc chắn user còn tồn tại trong DB:
        const user = await User.findByPk(decoded.user_id, {
            attributes: ["user_id", "fullname", "email"],
        });

        req.user = user || null;
        return next();
    } catch (error) {
        // optional auth nên fail-soft
        req.user = null;
        return next();
    }
};

export default optionalAuth;
