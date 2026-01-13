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
    permissionMiddleware(["permission.read"]),
    rbacController.getAllPermissions
);

router.post(
    "/api/permission/create",
    authMiddleware,
    permissionMiddleware(["permission.create"]),
    rbacController.createPermission
);

router.delete(
    "/api/permission/delete",
    authMiddleware,
    permissionMiddleware(["permission.delete"]),
    rbacController.deletePermission
);

/* ======================================================
   ROLES
====================================================== */

router.get(
    "/api/role/get-all",
    authMiddleware,
    // permissionMiddleware(["role.read"]),
    rbacController.getAllRoles
);

router.post(
    "/api/role/create",
    authMiddleware,
    permissionMiddleware(["role.create"]),
    rbacController.createRole
);

router.delete(
    "/api/role/delete",
    authMiddleware,
    permissionMiddleware(["role.delete"]),
    rbacController.deleteRole
);

/* ======================================================
   ROLE → PERMISSIONS
====================================================== */

router.post(
    "/api/role/set-permissions",
    authMiddleware,
    permissionMiddleware(["role.assign.permission"]),
    rbacController.setPermissionsForRole
);

/* ======================================================
   USER → ROLES
====================================================== */

router.post(
    "/api/user/set-roles",
    authMiddleware,
    permissionMiddleware(["user.assign.role"]),
    rbacController.setRolesForUser
);

/* ======================================================
   USER → PERMISSION OVERRIDE
====================================================== */

router.post(
    "/api/user/set-permission",
    authMiddleware,
    permissionMiddleware(["user.assign.permission"]),
    rbacController.setUserPermission
);

export default router;
