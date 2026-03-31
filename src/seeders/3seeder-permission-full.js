"use strict";

const permissionMap = {
    "dashboard:admin": "Admin Dashboard",
    "dashboard:manager": "Manager Dashboard",
    "dashboard:staff": "Staff Dashboard",

    "revenue:read": "View revenue dashboard and reports",

    "booking:create": "Create booking",
    "booking:read": "View bookings",
    "booking:update": "Update booking",
    "booking:delete": "Delete booking",
    "booking:restore": "Restore deleted booking",

    "order:create": "Create order",
    "order:read": "View orders",
    "order:update": "Update order",
    "order:delete": "Delete order",
    "order:restore": "Restore deleted order",

    "pet:create": "Create pet profile",
    "pet:read": "View pets",
    "pet:update": "Update pet information",
    "pet:delete": "Delete pet",
    "pet:restore": "Restore deleted pet",

    "product:create": "Create product",
    "product:read": "View products",
    "product:update": "Update product",
    "product:delete": "Delete product",
    "product:restore": "Restore deleted product",

    "category:create": "Create category",
    "category:read": "View categories",
    "category:update": "Update category",
    "category:delete": "Delete category",
    "category:restore": "Restore deleted category",

    "voucher:create": "Create voucher",
    "voucher:read": "View vouchers",
    "voucher:update": "Update voucher",
    "voucher:delete": "Delete voucher",
    "voucher:restore": "Restore deleted voucher",
    "voucher:apply": "Apply voucher",

    "service:create": "Create service",
    "service:read": "View services",
    "service:update": "Update service",
    "service:delete": "Delete service",
    "service:restore": "Restore deleted service",

    "feature:create": "Create feature",
    "feature:read": "View features",
    "feature:update": "Update feature",
    "feature:delete": "Delete feature",

    "service-feature:add": "Add feature to service",
    "service-feature:remove": "Remove feature from service",
    "service-feature:read": "View service features",

    "notification:create": "Create notification",
    "notification:read": "View notifications",
    "notification:update": "Update notification",
    "notification:delete": "Delete notification",

    "shift:create": "Create shift",
    "shift:read": "View shifts",
    "shift:update": "Update shift",
    "shift:delete": "Delete shift",

    "schedule:create": "Create schedule",
    "schedule:read": "View schedules",
    "schedule:update": "Update schedule",
    "schedule:delete": "Delete schedule",
    "schedule:approve": "Approve schedule",
    "schedule:replace": "Replace staff",

    "user:create": "Create user",
    "user:read": "View users",
    "user:update": "Update user",
    "user:delete": "Delete user",
    "user:restore": "Restore user",

    "rbac:role:read": "View roles",
    "rbac:role:create": "Create role",
    "rbac:role:update": "Update role",
    "rbac:role:delete": "Delete role",

    "rbac:permission:read": "View permissions",
    "rbac:permission:assign": "Assign permissions",

    "rbac:user-role:assign": "Assign role to user",
    "rbac:user-permission:assign": "Override user permissions",
};

module.exports = {
    async up(queryInterface) {
        const now = new Date();

        const rows = Object.entries(permissionMap).map(
            ([action, description]) => ({
                action,
                description,
            }),
        );

        await queryInterface.bulkInsert("permissions", rows, {});
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete(
            "permissions",
            {
                action: Object.keys(permissionMap),
            },
            {},
        );
    },
};
