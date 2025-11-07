import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies?.access_token; //cookie

        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.user_id) {
            // Nếu decode được nhưng thiếu user_id (payload sai), coi là token lỗi
            return res.status(403).json({ error: "Invalid token payload" });
        }

        req.user = decoded; // add user in req
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expired" });
        }
        return res.status(403).json({ error: "Invalid token" });
    }
};

export default authMiddleware;
