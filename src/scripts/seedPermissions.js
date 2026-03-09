import db from "../models/index.js";

const ROLE_DEFINITIONS = [
    { id: 1, name: "admin" },
    { id: 2, name: "manager" },
    { id: 3, name: "staff" },
    { id: 4, name: "customer" },
];

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

const actions = Object.keys(permissionMap);

const seed = async () => {
    const transaction = await db.sequelize.transaction();

    try {
        for (const action of actions) {
            await db.Permission.findOrCreate({
                where: { action },
                defaults: { description: permissionMap[action] },
                transaction,
            });
        }

        for (const role of ROLE_DEFINITIONS) {
            const existing = await db.Role.findOne({
                where: { name: role.name },
                paranoid: false,
                transaction,
            });

            if (!existing) {
                await db.Role.create(
                    { id: role.id, name: role.name },
                    { transaction },
                );
            } else if (existing.id !== role.id) {
                await db.Role.update(
                    { id: role.id },
                    { where: { name: role.name }, transaction },
                );
            }
        }

        await db.sequelize.query("ALTER TABLE roles AUTO_INCREMENT = 5", {
            transaction,
        });

        const permissions = await db.Permission.findAll({ transaction });
        const roles = await db.Role.findAll({ transaction });

        const roleMap = {};
        roles.forEach((r) => (roleMap[r.name] = r));

        await roleMap.admin.setPermissions(permissions, { transaction });

        await roleMap.manager.setPermissions(
            permissions.filter(
                (p) =>
                    p.action.startsWith("booking:") ||
                    p.action.startsWith("order:") ||
                    p.action.startsWith("product:") ||
                    p.action.startsWith("category:") ||
                    p.action.startsWith("voucher:") ||
                    p.action.startsWith("service:") ||
                    p.action.startsWith("feature:") ||
                    p.action.startsWith("service-feature:") ||
                    p.action.startsWith("notification:") ||
                    p.action.startsWith("pet:") ||
                    p.action.startsWith("shift:") ||
                    p.action.startsWith("schedule:") ||
                    [
                        "dashboard:manager",
                        "user:read",
                        "user:update",
                        "revenue:read",
                    ].includes(p.action),
            ),
            { transaction },
        );

        await roleMap.staff.setPermissions(
            permissions.filter((p) =>
                [
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
                ].includes(p.action),
            ),
            { transaction },
        );

        await roleMap.customer.setPermissions(
            permissions.filter((p) =>
                [
                    "booking:create",
                    "booking:read",
                    "order:create",
                    "order:read",
                    "pet:create",
                    "pet:read",
                    "pet:update",
                    "pet:delete",
                    "voucher:read",
                    "voucher:apply",
                    "user:read",
                    "user:update",
                ].includes(p.action),
            ),
            { transaction },
        );

        await transaction.commit();

        console.log("✅ RBAC Seed completed successfully");
        process.exit(0);
    } catch (err) {
        await transaction.rollback();

        console.error("❌ Seed failed:", err);
        process.exit(1);
    }
};

seed();
