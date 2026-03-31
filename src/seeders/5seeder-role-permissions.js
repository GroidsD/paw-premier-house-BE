"use strict";

const managerAllowed = [
    "dashboard:manager",
    "user:read",
    "user:update",
    "revenue:read",
];

const staffAllowed = [
    "dashboard:staff",
    "booking:create",
    "booking:read",
    "booking:update",
    "order:create",
    "order:read",
    "pet:create",
    "pet:read",
    "pet:update",
    "category:read",
    "product:read",
    "voucher:read",
    "voucher:apply",
    "shift:read",
    "schedule:create",
    "schedule:read",
    "schedule:update",
    "service:read",
    "feature:read",
];

const customerAllowed = [
    "booking:create",
    "booking:update",
    "booking:read",
    "order:create",
    "order:update",
    "order:read",
    "pet:create",
    "pet:read",
    "pet:update",
    "pet:delete",
    "voucher:read",
    "voucher:apply",
    "user:read",
    "user:update",
];

function isManagerPermission(action) {
    return (
        action.startsWith("booking:") ||
        action.startsWith("order:") ||
        action.startsWith("product:") ||
        action.startsWith("category:") ||
        action.startsWith("voucher:") ||
        action.startsWith("service:") ||
        action.startsWith("feature:") ||
        action.startsWith("service-feature:") ||
        action.startsWith("notification:") ||
        action.startsWith("pet:") ||
        action.startsWith("shift:") ||
        action.startsWith("schedule:") ||
        managerAllowed.includes(action)
    );
}

function isAdminPermission(action) {
    return !action.startsWith("dashboard:") || action === "dashboard:admin";
}

module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();

        const [roles] = await queryInterface.sequelize.query(
            `SELECT id, name FROM roles WHERE name IN ('admin','manager','staff','customer');`,
        );

        const [permissions] = await queryInterface.sequelize.query(
            `SELECT id, action FROM permissions;`,
        );

        const roleMap = {};
        roles.forEach((role) => {
            roleMap[role.name] = role.id;
        });

        const adminPermissionIds = permissions
            .filter((p) => isAdminPermission(p.action))
            .map((p) => p.id);

        const managerPermissionIds = permissions
            .filter((p) => isManagerPermission(p.action))
            .map((p) => p.id);

        const staffPermissionIds = permissions
            .filter((p) => staffAllowed.includes(p.action))
            .map((p) => p.id);

        const customerPermissionIds = permissions
            .filter((p) => customerAllowed.includes(p.action))
            .map((p) => p.id);

        const rows = [
            ...adminPermissionIds.map((permissionId) => ({
                role_id: roleMap.admin,
                permission_id: permissionId,
                created_at: now,
                updated_at: now,
            })),
            ...managerPermissionIds.map((permissionId) => ({
                role_id: roleMap.manager,
                permission_id: permissionId,
                created_at: now,
                updated_at: now,
            })),
            ...staffPermissionIds.map((permissionId) => ({
                role_id: roleMap.staff,
                permission_id: permissionId,
                created_at: now,
                updated_at: now,
            })),
            ...customerPermissionIds.map((permissionId) => ({
                role_id: roleMap.customer,
                permission_id: permissionId,
                created_at: now,
                updated_at: now,
            })),
        ];

        if (rows.length) {
            await queryInterface.bulkInsert("role_permissions", rows, {});
        }
    },

    async down(queryInterface) {
        const [roles] = await queryInterface.sequelize.query(
            `SELECT id FROM roles WHERE name IN ('admin','manager','staff','customer');`,
        );

        const roleIds = roles.map((r) => r.id);

        if (!roleIds.length) return;

        await queryInterface.bulkDelete(
            "role_permissions",
            {
                role_id: roleIds,
            },
            {},
        );
    },
};
