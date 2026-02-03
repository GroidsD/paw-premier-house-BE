// scripts/seedPermissions.js
import db from "../models/index.js";

/* ======================================================
   1️⃣ ROLE DEFINITIONS (FIXED IDs)
====================================================== */

const ROLE_DEFINITIONS = [
    { id: 1, name: "admin" },
    { id: 2, name: "manager" },
    { id: 3, name: "staff" },
    { id: 4, name: "customer" },
];

/* ======================================================
   2️⃣ PERMISSION MAP (resource:action → description)
====================================================== */

const permissionMap = {
    // ================== DASHBOARD ==================
    "dashboard:view": "View Dashboard",
    "dashboard:admin": "Admin Dashboard",
    "dashboard:manager": "Manager Dashboard",
    "dashboard:staff": "Staff Dashboard",

    // ================== BOOKING ==================
    "booking:create": "Create booking",
    "booking:read": "View bookings",
    "booking:update": "Update booking",
    "booking:delete": "Delete booking (soft delete)",
    "booking:restore": "Restore deleted booking",

    // ================== ORDER ==================
    "order:create": "Create order",
    "order:read": "View orders",
    "order:update": "Update order",
    "order:delete": "Delete order (soft delete)",
    "order:restore": "Restore deleted order",

    // ================== PET ==================
    "pet:create": "Create pet profile",
    "pet:read": "View pets",
    "pet:update": "Update pet information",
    "pet:delete": "Delete pet (soft delete)",
    "pet:restore": "Restore deleted pet",

    // ================== PRODUCT ==================
    "product:create": "Create product",
    "product:read": "View products",
    "product:update": "Update product",
    "product:delete": "Delete product (soft delete)",
    "product:restore": "Restore deleted product",

    // ================== CATEGORY ==================
    "category:create": "Create category",
    "category:read": "View categories",
    "category:update": "Update category",
    "category:delete": "Delete category (soft delete)",
    "category:restore": "Restore deleted category",

    // ================== VOUCHER ==================
    "voucher:create": "Create voucher",
    "voucher:read": "View vouchers",
    "voucher:update": "Update voucher",
    "voucher:delete": "Delete voucher (soft delete)",
    "voucher:restore": "Restore deleted voucher",
    "voucher:apply": "Apply voucher", // ✅ NEW

    // ================== SHIFT / SCHEDULE ==================
    "shift:read": "View work shifts",
    "shift:create": "Create shift",
    "shift:update": "Update shift",
    "shift:delete": "Delete shift",

    "schedule:create": "Register work schedule",
    "schedule:read": "View work schedules",
    "schedule:update": "Update own work schedule",
    "schedule:delete": "Delete schedule",
    "schedule:approve": "Approve or reject staff schedule",
    "schedule:replace": "Replace staff in schedule",

    // ================== RBAC ==================
    "rbac:role:read": "View roles",
    "rbac:role:create": "Create role",
    "rbac:role:update": "Update role",
    "rbac:role:delete": "Delete role",

    "rbac:permission:read": "View permissions",
    "rbac:permission:assign": "Assign permissions to role",

    "rbac:user-role:assign": "Assign roles to user",
    "rbac:user-permission:assign": "Override user permissions",

    // ================== USER ==================
    "user:create": "Create user",
    "user:read": "View users",
    "user:update": "Update user",
    "user:delete": "Delete user",
    "user:restore": "Restore deleted user",
};

const actions = Object.keys(permissionMap);

/* ======================================================
   3️⃣ SEED FUNCTION
====================================================== */

const seed = async () => {
    const transaction = await db.sequelize.transaction();
    try {
        /* ================== PERMISSIONS ================== */
        for (const action of actions) {
            await db.Permission.findOrCreate({
                where: { action },
                defaults: { description: permissionMap[action] },
                transaction,
            });
        }

        /* ================== ROLES (FIXED ID) ================== */
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

        // reset AUTO_INCREMENT (MySQL)
        await db.sequelize.query("ALTER TABLE roles AUTO_INCREMENT = 5", {
            transaction,
        });

        /* ================== ROLE ↔ PERMISSION ================== */
        const permissions = await db.Permission.findAll({ transaction });
        const roles = await db.Role.findAll({ transaction });

        const roleMap = {};
        roles.forEach((r) => (roleMap[r.name] = r));

        /* -------- ADMIN -------- */
        await roleMap.admin.setPermissions(
            permissions.filter(
                (p) =>
                    // dashboard
                    ["dashboard:view", "dashboard:admin"].includes(p.action) ||
                    // business
                    p.action.startsWith("booking:") ||
                    p.action.startsWith("order:") ||
                    p.action.startsWith("product:") ||
                    p.action.startsWith("category:") ||
                    p.action.startsWith("voucher:") ||
                    p.action.startsWith("pet:") ||
                    // staff ops
                    p.action.startsWith("shift:") ||
                    p.action.startsWith("schedule:") ||
                    // system
                    p.action.startsWith("rbac:") ||
                    p.action.startsWith("user:"),
            ),
            { transaction },
        );

        /* -------- MANAGER -------- */
        await roleMap.manager.setPermissions(
            permissions.filter(
                (p) =>
                    // dashboard
                    ["dashboard:view", "dashboard:manager"].includes(
                        p.action,
                    ) ||
                    // business
                    p.action.startsWith("booking:") ||
                    p.action.startsWith("order:") ||
                    p.action.startsWith("product:") ||
                    p.action.startsWith("category:") ||
                    p.action.startsWith("voucher:") ||
                    p.action.startsWith("pet:") ||
                    p.action.startsWith("shift:") ||
                    // schedule (no delete)
                    [
                        "schedule:create",
                        "schedule:read",
                        "schedule:update",
                        "schedule:approve",
                        "schedule:replace",
                    ].includes(p.action) ||
                    // user (limited)
                    ["user:read", "user:update"].includes(p.action) ||
                    // RBAC read-only
                    ["rbac:role:read", "rbac:permission:read"].includes(
                        p.action,
                    ),
            ),
            { transaction },
        );

        /* -------- STAFF -------- */
        await roleMap.staff.setPermissions(
            permissions.filter((p) =>
                [
                    "dashboard:view",
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

                    "user:read",
                    "user:update",
                ].includes(p.action),
            ),
            { transaction },
        );

        /* -------- CUSTOMER -------- */
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
        console.log("✅ RBAC seeded with resource:action format");
        process.exit(0);
    } catch (err) {
        await transaction.rollback();
        console.error("❌ Seed failed:", err);
        process.exit(1);
    }
};

seed();
