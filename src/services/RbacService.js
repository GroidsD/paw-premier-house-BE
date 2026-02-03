import db from "../models/index.js";

/*
MODELS:
User
Role
Permission
UserRole
RolePermission
UserPermission
*/
const PERMISSION_ORDER = [
    "dashboard",
    "booking",
    "order",
    "pet",
    "product",
    "category",
    "voucher",
    "shift",
    "schedule",
    "user",
    "rbac",
];
const sortPermissions = (permissions) => {
    return permissions.sort((a, b) => {
        const [resA, actA] = a.split(":");
        const [resB, actB] = b.split(":");

        const indexA = PERMISSION_ORDER.indexOf(resA);
        const indexB = PERMISSION_ORDER.indexOf(resB);

        // resource không nằm trong list → đẩy xuống cuối
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;

        // cùng resource → sort theo action
        if (indexA === indexB) {
            return actA.localeCompare(actB);
        }

        return indexA - indexB;
    });
};

/* ======================================================
   PERMISSIONS
====================================================== */
const getAllPermissions = async () => {
    const permissions = await db.Permission.findAll();
    return { errCode: 0, permissions };
};

const createPermission = async (data) => {
    const exists = await db.Permission.findOne({
        where: { action: data.action },
    });

    if (exists) return { errCode: 2, errMessage: "Permission exists" };

    const permission = await db.Permission.create(data);
    return { errCode: 0, permission };
};

const deletePermission = async (id) => {
    const t = await db.sequelize.transaction();
    try {
        await db.RolePermission.destroy({
            where: { permission_id: id },
            transaction: t,
        });
        await db.UserPermission.destroy({
            where: { permission_id: id },
            transaction: t,
        });
        await db.Permission.destroy({ where: { id }, transaction: t });

        await t.commit();
        return { errCode: 0 };
    } catch (e) {
        await t.rollback();
        return { errCode: 1, errMessage: e.message };
    }
};

/* ======================================================
   ROLES
====================================================== */
// const getAllRoles = async () => {
//     const roles = await db.Role.findAll({
//         attributes: ["id", "name"],
//         include: [
//             {
//                 model: db.Permission,
//                 as: "permissions",
//                 attributes: ["action"],
//                 through: { attributes: [] },
//             },
//         ],
//     });

//     const mappedRoles = roles.map((role) => ({
//         id: role.id,
//         name: role.name,
//         permissions: role.permissions.map((p) => p.action),
//     }));

//     return {
//         errCode: 0,
//         roles: mappedRoles,
//     };
// };
const getAllRoles = async () => {
    const roles = await db.Role.findAll({
        attributes: ["id", "name"],
        include: [
            {
                model: db.Permission,
                as: "permissions",
                attributes: ["action"],
                through: { attributes: [] },
            },
        ],
    });

    const mappedRoles = roles.map((role) => {
        const permissions = role.permissions.map((p) => p.action);

        return {
            id: role.id,
            name: role.name,
            permissions: sortPermissions(permissions),
        };
    });

    return {
        errCode: 0,
        roles: mappedRoles,
    };
};

const createRole = async (data) => {
    const exists = await db.Role.findOne({ where: { name: data.name } });
    if (exists) return { errCode: 2, errMessage: "Role exists" };

    const role = await db.Role.create({ name: data.name });
    return { errCode: 0, role };
};

const deleteRole = async (id) => {
    const t = await db.sequelize.transaction();
    try {
        await db.RolePermission.destroy({
            where: { role_id: id },
            transaction: t,
        });
        await db.UserRole.destroy({ where: { role_id: id }, transaction: t });
        await db.Role.destroy({ where: { id }, transaction: t });

        await t.commit();
        return { errCode: 0 };
    } catch (e) {
        await t.rollback();
        return { errCode: 1, errMessage: e.message };
    }
};

/* ======================================================
   ROLE PERMISSIONS
====================================================== */
const setPermissionsForRole = async (role_id, permission_ids) => {
    const t = await db.sequelize.transaction();
    try {
        await db.RolePermission.destroy({ where: { role_id }, transaction: t });

        const rows = permission_ids.map((pid) => ({
            role_id,
            permission_id: pid,
        }));

        await db.RolePermission.bulkCreate(rows, { transaction: t });
        await t.commit();
        return { errCode: 0 };
    } catch (e) {
        await t.rollback();
        return { errCode: 1, errMessage: e.message };
    }
};

/* ======================================================
   USER ROLES
====================================================== */
const setRolesForUser = async (user_id, role_ids) => {
    const t = await db.sequelize.transaction();
    try {
        await db.UserRole.destroy({ where: { user_id }, transaction: t });

        const rows = role_ids.map((rid) => ({
            user_id,
            role_id: rid,
        }));

        await db.UserRole.bulkCreate(rows, { transaction: t });
        await t.commit();
        return { errCode: 0 };
    } catch (e) {
        await t.rollback();
        return { errCode: 1, errMessage: e.message };
    }
};

/* ======================================================
   USER PERMISSION OVERRIDES
====================================================== */
const setUserPermission = async (user_id, permission_id, allowed) => {
    const existing = await db.UserPermission.findOne({
        where: { user_id, permission_id },
    });

    if (existing) {
        await existing.update({ allowed });
    } else {
        await db.UserPermission.create({
            user_id,
            permission_id,
            allowed,
        });
    }

    return { errCode: 0 };
};

export default {
    getAllPermissions,
    createPermission,
    deletePermission,

    getAllRoles,
    createRole,
    deleteRole,
    setPermissionsForRole,

    setRolesForUser,
    setUserPermission,
};
