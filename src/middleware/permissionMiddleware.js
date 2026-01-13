const permissionMiddleware = (requiredPermissions = []) => {
    return (req, res, next) => {
        if (!req.user || !req.user.permissions) {
            return res.status(403).json({ message: "Access denied" });
        }

        const hasPermission = requiredPermissions.every((p) =>
            req.user.permissions.includes(p)
        );

        if (!hasPermission) {
            return res.status(403).json({ message: "Permission denied" });
        }

        next();
    };
};

export default permissionMiddleware;
