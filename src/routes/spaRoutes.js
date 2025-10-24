import express from "express";
import spaController from "../controllers/spaController";
import authMiddleware from "../middleware/authMiddleware";
import adminMiddleware from "../middleware/adminMiddleware";
import roleMiddleware from "../middleware/roleMiddleware";
const router = express.Router();

// CREATE
router.post(
  "/api/create-new-spa-service",
  authMiddleware,
  // roleMiddleware[("admin", "staff")],
  spaController.createSpaService
);

// READ ALL
router.get(
  "/api/get-all-spa-services",
  //   authMiddleware,
  spaController.getAllSpaServices
);

// READ ONE
router.get(
  "/api/get-spa-service-by-id",
  authMiddleware,
  spaController.getSpaServiceById
);

// UPDATE
router.post(
  "/api/update-spa-service",
  authMiddleware,
  spaController.updateSpaService
);

// DELETE
router.get(
  "/api/delete-spa-service",
  adminMiddleware,
  spaController.deleteSpaService
);

// CREATE
router.post(
  "/api/create-new-appointment",
  authMiddleware,
  spaController.createAppointment
);

// READ ALL
router.get(
  "/api/get-all-appointments",
  authMiddleware,
  spaController.getAllAppointments
);

// READ ONE
router.get(
  "/api/get-appointment-by-id",
  authMiddleware,
  spaController.getAppointmentById
);

// UPDATE STATUS
router.put(
  "/api/update-appointment-status",
  authMiddleware,
  spaController.updateAppointmentStatus
);

// DELETE
router.delete("/api/delete-appointment", spaController.deleteAppointment);
export default router;
