import express from "express";
import petController from "../controllers/petController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();
router.get(
    "/api/pet/get-all",
    authMiddleware,
    roleMiddleware(["admin"]),
    petController.getAllPets
);
router.post(
    "/api/pet/create",
    authMiddleware,
    roleMiddleware(["customer", "admin"]),
    petController.createPet
);

router.get(
    "/api/pet/my-pets",
    authMiddleware,
    roleMiddleware(["customer", "admin"]),
    petController.getMyPets
);

router.get(
    "/api/pet/get-by-id",
    authMiddleware,
    roleMiddleware(["customer", "admin"]),
    petController.getPetById
);

router.put(
    "/api/pet/update",
    authMiddleware,
    roleMiddleware(["customer", "admin"]),
    petController.updatePet
);

router.delete(
    "/api/pet/delete",
    authMiddleware,
    roleMiddleware(["customer", "admin"]),
    petController.deletePet
);

export default router;
