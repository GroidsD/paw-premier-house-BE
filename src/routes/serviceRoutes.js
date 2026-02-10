import express from "express";
import serviceController from "../controllers/serviceController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const router = express.Router();

/* ======================================================
   SERVICE ROUTES (RBAC - permission based)
====================================================== */

// CREATE
router.post(
    "/api/service/create",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["dashboard:admin", "service:create"],
    }),
    serviceController.createService,
);

// GET ALL
router.get("/api/service/get-all", serviceController.getAllServices);

// GET BY ID
router.get("/api/service/get-by-id", serviceController.getServiceById);

// GET BY CATEGORY
router.get(
    "/api/service/get-by-category",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["service:read"],
    }),
    serviceController.getServicesByCategory,
);

// UPDATE
router.put(
    "/api/service/update",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:staff"],
        all: ["service:update"],
    }),
    serviceController.updateService,
);

// SOFT DELETE
router.delete(
    "/api/service/soft-delete",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["dashboard:admin", "service:delete"],
    }),
    serviceController.softDeleteService,
);

// HARD DELETE
router.delete(
    "/api/service/hard-delete",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["dashboard:admin", "service:delete"],
    }),
    serviceController.hardDeleteService,
);

export default router;
