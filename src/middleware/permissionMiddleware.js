const permissionMiddleware = ({ any = [], all = [] }) => {
    return (req, res, next) => {
        if (!req.user || !req.user.permissions) {
            console.log("❌ No user or permissions on request");
            return res.status(403).json({ message: "Access denied" });
        }

        const userPermissions = req.user.permissions;

        const hasAny =
            any.length === 0 || any.some((p) => userPermissions.includes(p));

        const hasAll =
            all.length === 0 || all.every((p) => userPermissions.includes(p));

        if (!hasAny || !hasAll) {
            return res.status(403).json({ message: "Permission denied" });
        }

        next();
    };
};

export default permissionMiddleware;
