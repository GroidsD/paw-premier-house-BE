const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_EXPIRES = "7d";

exports.generateToken = (user) => {
    return jwt.sign(
        {
            user_id: user.user_id,
            email: user.email,
            role: user.role,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES },
    );
};

// token verify booking
exports.generateVerifyToken = (userId, type) => {
    return jwt.sign(
        {
            userId,
            type,
        },
        JWT_SECRET,
        { expiresIn: "24h" },
    );
};

exports.verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};
