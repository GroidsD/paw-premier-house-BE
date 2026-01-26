import express from "express";
import bookingController from "../controllers/bookingController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// CUSTOMER tạo booking
router.post(
  "/api/booking/create",
  authMiddleware,
  roleMiddleware(["customer", "admin"]),
  bookingController.createBooking,
);

// CUSTOMER xem booking của mình
router.get(
  "/api/booking/my-bookings",
  authMiddleware,
  roleMiddleware(["customer", "admin"]),
  bookingController.getMyBookings,
);

// ADMIN / STAFF xem tất cả booking
router.get(
  "/api/booking/get-all",
  authMiddleware,
  roleMiddleware(["admin", "manager", "staff"]),
  bookingController.getAllBookings,
);

// ADMIN / STAFF update status
router.put(
  "/api/booking/update-status",
  authMiddleware,
  roleMiddleware(["admin", "manager", "staff"]),
  bookingController.updateBookingStatus,
);
router.post(
  "/api/booking/:bookingId/cancel",
  authMiddleware,
  bookingController.custonerCancelBooking,
);
router.post(
  "/booking/:bookingId/assign",
  authMiddleware,
  roleMiddleware(["staff"]),
  bookingController.assignBooking,
);

export default router;
