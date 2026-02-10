import db from "../models/index.js";


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

        
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;

        
        if (indexA === indexB) {
            return actA.localeCompare(actB);
        }

        return indexA - indexB;
    });
};


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

const getUserPermissionDetail = async (user_id) => {
    
    const user = await db.User.findByPk(user_id, {
        attributes: ["user_id", "fullname", "email"],
        include: [
            {
                model: db.Role,
                as: "roles", 
                attributes: ["id", "name"],
                through: { attributes: [] },
                include: [
                    {
                        model: db.Permission,
                        as: "permissions",
                        attributes: ["action"],
                        through: { attributes: [] },
                    },
                ],
            },
        ],
    });

    if (!user) return { errCode: 1, errMessage: "User not found" };

    const roles = user.roles || [];
    const rolePermissionsSet = new Set();
    roles.forEach((r) =>
        (r.permissions || []).forEach((p) => rolePermissionsSet.add(p.action)),
    );

    const rolePermissions = sortPermissions(Array.from(rolePermissionsSet));

    
    const overridesRows = await db.UserPermission.findAll({
        where: { user_id },
        attributes: ["allowed"],
        include: [{ model: db.Permission, attributes: ["action"] }],
    });

    const userOverrides = {};
    overridesRows.forEach((row) => {
        const action = row.Permission?.action;
        if (action) userOverrides[action] = !!row.allowed;
    });

    return {
        errCode: 0,
        data: {
            user_id: user.user_id,
            fullname: user.fullname,
            email: user.email,
            roles: roles.map((r) => r.name),
            rolePermissions,
            userOverrides,
        },
    };
};


const setUserOverridesBulk = async (user_id, overrides = {}) => {
    const t = await db.sequelize.transaction();
    try {
        const user = await db.User.findByPk(user_id, { transaction: t });
        if (!user) {
            await t.rollback();
            return { errCode: 1, errMessage: "User not found" };
        }

        const actions = Object.keys(overrides);

        
        const permissions = await db.Permission.findAll({
            where: { action: actions },
            attributes: ["id", "action"],
            transaction: t,
        });

        const map = {};
        permissions.forEach((p) => (map[p.action] = p.id));

        const missing = actions.filter((a) => !map[a]);
        if (missing.length) {
            await t.rollback();
            return {
                errCode: 2,
                errMessage: `Unknown permission actions: ${missing.join(", ")}`,
            };
        }

        
        await db.UserPermission.destroy({
            where: { user_id },
            transaction: t,
            
        });

        const rows = actions.map((action) => ({
            user_id,
            permission_id: map[action],
            allowed: !!overrides[action],
        }));

        if (rows.length) {
            await db.UserPermission.bulkCreate(rows, { transaction: t });
        }

        await t.commit();
        return { errCode: 0, errMessage: "Overrides saved" };
    } catch (e) {
        await t.rollback();
        return { errCode: 500, errMessage: e.message };
    }
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
    setUserOverridesBulk,
    getUserPermissionDetail,
};
