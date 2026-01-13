// import redis from "../config/redis.js";
// import db from "../models/index.js";

// const { User, Role, Permission, UserPermission } = db;

// const rbacMiddleware = async (req, res, next) => {
//     try {
//         const userId = req.user.user_id;
//         const cacheKey = `rbac:${userId}`;

//         // 1️⃣ Check cache
//         const cached = await redis.get(cacheKey);
//         if (cached) {
//             const data = JSON.parse(cached);
//             req.user.roles = data.roles;
//             req.user.permissions = data.permissions;
//             return next();
//         }

//         // 2️⃣ Load from DB
//         const user = await User.findByPk(userId, {
//             include: [
//                 {
//                     model: Role,
//                     as: "roles",
//                     include: { model: Permission, as: "permissions" },
//                 },
//             ],
//         });

//         if (!user || !user.isActive || user.isDeleted) {
//             return res.status(403).json({ message: "User disabled" });
//         }

//         // 3️⃣ Resolve permission
//         const permissionMap = new Map();

//         user.roles.forEach((role) => {
//             role.permissions.forEach((p) => {
//                 permissionMap.set(p.action, true);
//             });
//         });

//         const overrides = await UserPermission.findAll({
//             where: { user_id: userId },
//             include: Permission,
//         });

//         overrides.forEach((o) => {
//             permissionMap.set(o.Permission.action, o.allowed);
//         });

//         const permissions = [...permissionMap.entries()]
//             .filter(([_, v]) => v)
//             .map(([k]) => k);

//         const roles = user.roles.map((r) => r.name);

//         // 4️⃣ Save to cache (5 phút)
//         await redis.set(
//             cacheKey,
//             JSON.stringify({ roles, permissions }),
//             "EX",
//             300
//         );

//         req.user.roles = roles;
//         req.user.permissions = permissions;

//         next();
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "RBAC system error" });
//     }
// };

// export default rbacMiddleware;
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

        // ===== Resolve permission từ role =====
        const permissionMap = new Map();
        user.roles.forEach((role) => {
            role.permissions.forEach((p) => {
                permissionMap.set(p.action, true);
            });
        });

        // ===== Override permission =====
        const overrides = await UserPermission.findAll({
            where: { user_id: userId },
            include: Permission,
        });
        overrides.forEach((o) => {
            permissionMap.set(o.Permission.action, o.allowed);
        });

        // ===== Final permissions =====
        req.user.permissions = [...permissionMap.entries()]
            .filter(([_, v]) => v)
            .map(([k]) => k);

        // debug Permissions
        // const finalPermissions = [];
        // for (const [action, allowed] of permissionMap.entries()) {
        //     if (allowed) {
        //         finalPermissions.push(action);
        //     }
        // }
        // req.user.permissions = finalPermissions;

        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Permission system error" });
    }
};
export default rbacMiddleware;
