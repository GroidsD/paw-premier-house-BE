import express from "express";
import featureController from "../controllers/featureController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";
import serviceFeatureController from "../controllers/serviceFeatureController.js";

const router = express.Router();

router.post(
    "/api/features/create",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["feature:create"],
    }),
    featureController.createFeature,
);

router.get("/api/features/get-all", featureController.getAllFeatures);

router.get("/api/features/get-by-id", featureController.getFeatureById);

router.get(
    "/api/features/by-category",
    featureController.getFeaturesByCategory,
);

router.get(
    "/api/features/for-service",
    featureController.getFeaturesForService,
);

router.put(
    "/api/features/update",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        any: ["dashboard:admin", "dashboard:manager"],
        all: ["feature:update"],
    }),
    featureController.updateFeature,
);

router.delete(
    "/api/features/hard-delete",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["dashboard:admin", "feature:delete"],
    }),
    featureController.deleteFeature,
);

router.post("/api/service-features/add", serviceFeatureController.addFeature);

router.delete(
    "/api/service-features/remove",
    serviceFeatureController.removeFeature,
);

router.get(
    "/api/service-features/by-service",
    serviceFeatureController.getFeaturesByService,
);

export default router;
