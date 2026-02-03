import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import rbacController from "../controllers/rbacController.js";

const router = express.Router();

/* ======================================================
   PERMISSIONS
====================================================== */

router.get(
    "/api/permission/get-all",
    authMiddleware,
    permissionMiddleware({
        all: ["rbac:permission:read"],
    }),
    rbacController.getAllPermissions,
);

router.post(
    "/api/permission/create",
    authMiddleware,
    permissionMiddleware({
        all: ["rbac:permission:assign"],
        any: ["dashboard:admin"],
    }),
    rbacController.createPermission,
);

router.delete(
    "/api/permission/delete",
    authMiddleware,
    permissionMiddleware({
        all: ["rbac:permission:assign"],
        any: ["dashboard:admin"],
    }),
    rbacController.deletePermission,
);

/* ======================================================
   ROLES
====================================================== */

router.get(
    "/api/role/get-all",
    authMiddleware,
    permissionMiddleware({
        all: ["rbac:role:read"],
    }),
    rbacController.getAllRoles,
);

router.post(
    "/api/role/create",
    authMiddleware,
    permissionMiddleware({
        all: ["rbac:role:create"],
        any: ["dashboard:admin"],
    }),
    rbacController.createRole,
);

router.delete(
    "/api/role/delete",
    authMiddleware,
    permissionMiddleware({
        all: ["rbac:role:delete"],
        any: ["dashboard:admin"],
    }),
    rbacController.deleteRole,
);

/* ======================================================
   ROLE → PERMISSIONS
====================================================== */

router.post(
    "/api/role/set-permissions",
    authMiddleware,
    permissionMiddleware({
        all: ["rbac:permission:assign"],
        any: ["dashboard:admin"],
    }),
    rbacController.setPermissionsForRole,
);

/* ======================================================
   USER → ROLES
====================================================== */

router.post(
    "/api/user/set-roles",
    authMiddleware,
    permissionMiddleware({
        all: ["rbac:user-role:assign"],
        any: ["dashboard:admin"],
    }),
    rbacController.setRolesForUser,
);

/* ======================================================
   USER → PERMISSION OVERRIDE
====================================================== */

router.post(
    "/api/user/set-permission",
    authMiddleware,
    permissionMiddleware({
        all: ["rbac:user-permission:assign"],
        any: ["dashboard:admin"],
    }),
    rbacController.setUserPermission,
);

export default router;
