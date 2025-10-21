import express from "express";
import spaController from "../controllers/spaController";
const router = express.Router();

// CREATE
router.post("/api/create-new-spa-service", spaController.createSpaService);

// READ ALL
router.get("/api/get-all-spa-services", spaController.getAllSpaServices);

// READ ONE
router.get("/api/get-spa-service-by-id", spaController.getSpaServiceById);

// UPDATE
router.post("/api/update-spa-service", spaController.updateSpaService);

// DELETE
router.get("/api/delete-spa-service", spaController.deleteSpaService);

// CREATE
router.post("/api/create-new-appointment", spaController.createAppointment);

// READ ALL
router.get("/api/get-all-appointments", spaController.getAllAppointments);

// READ ONE
router.get("/api/get-appointment-by-id", spaController.getAppointmentById);

// UPDATE STATUS
router.put("/api/update-appointment-status", spaController.updateAppointmentStatus);

// DELETE
router.delete("/api/delete-appointment", spaController.deleteAppointment);
export default router;
