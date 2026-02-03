import express from "express";
import petController from "../controllers/petController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";

const router = express.Router();

// ============================
// GET ALL PETS (ADMIN)
// ============================
router.get(
    "/api/pet/get-all",
    authMiddleware,
    permissionMiddleware({
        all: ["pet:read"],
        any: ["dashboard:admin"],
    }),
    petController.getAllPets,
);

// ============================
// CREATE PET (CUSTOMER / ADMIN)
// ============================
router.post(
    "/api/pet/create",
    authMiddleware,
    permissionMiddleware({
        all: ["pet:create"],
    }),
    petController.createPet,
);

// ============================
// GET MY PETS (CUSTOMER / ADMIN)
// ============================
router.get(
    "/api/pet/my-pets",
    authMiddleware,
    permissionMiddleware({
        all: ["pet:read"],
    }),
    petController.getMyPets,
);

// ============================
// GET PET BY ID
// ============================
router.get(
    "/api/pet/get-by-id",
    authMiddleware,
    permissionMiddleware({
        all: ["pet:read"],
    }),
    petController.getPetById,
);

// ============================
// UPDATE PET
// ============================
router.put(
    "/api/pet/update",
    authMiddleware,
    permissionMiddleware({
        all: ["pet:update"],
    }),
    petController.updatePet,
);

// ============================
// DELETE PET (SOFT)
// ============================
router.delete(
    "/api/pet/delete",
    authMiddleware,
    permissionMiddleware({
        all: ["pet:delete"],
    }),
    petController.deletePet,
);

export default router;
