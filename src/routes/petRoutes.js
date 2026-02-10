import express from "express";
import petController from "../controllers/petController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const router = express.Router();

router.get(
    "/api/pet/get-all",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["pet:read"],
        any: ["dashboard:admin"],
    }),
    petController.getAllPets,
);

router.post(
    "/api/pet/create",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["pet:create"],
    }),
    petController.createPet,
);

router.get(
    "/api/pet/my-pets",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["pet:read"],
    }),
    petController.getMyPets,
);

router.get(
    "/api/pet/get-by-id",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["pet:read"],
    }),
    petController.getPetById,
);

router.put(
    "/api/pet/update",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["pet:update"],
    }),
    petController.updatePet,
);

router.delete(
    "/api/pet/delete",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["pet:delete"],
    }),
    petController.deletePet,
);

export default router;
