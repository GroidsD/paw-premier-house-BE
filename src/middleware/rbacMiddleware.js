import db from "../models/index.js";
const { User, Role, Permission, UserPermission } = db;
const rbacMiddleware = async (req, res, next) => {
    try {
        const userId = req.user.user_id;
        const user = await User.findByPk(userId, {
            include: [
                {
                    model: Role,
                    as: "roles",
                    include: { model: Permission, as: "permissions" },
                },
            ],
        });
        if (!user || !user.isActive || user.isDeleted) {
            return res.status(403).json({ message: "User disabled" });
        }

        const permissionMap = new Map();
        user.roles.forEach((role) => {
            role.permissions.forEach((p) => {
                permissionMap.set(p.action, true);
            });
        });

        const overrides = await UserPermission.findAll({
            where: { user_id: userId },
            include: Permission,
        });
        overrides.forEach((o) => {
            permissionMap.set(o.Permission.action, o.allowed);
        });

        req.user.permissions = [...permissionMap.entries()]
            .filter(([_, v]) => v)
            .map(([k]) => k);

        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Permission system error" });
    }
};
export default rbacMiddleware;
