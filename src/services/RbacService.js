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
const getAllRoles = async () => {
    const roles = await db.Role.findAll({
        include: [
            {
                model: db.Permission,
                as: "permissions",
                attributes: ["id", "action"],
                through: { attributes: [] },
            },
        ],
    });

    return { errCode: 0, roles };
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
