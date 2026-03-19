import express from "express";
import bookingController from "../controllers/bookingController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

const router = express.Router();

router.post("/api/booking/verify", bookingController.verifyBooking);

router.post(
    "/api/booking/create",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["booking:create"],
    }),
    bookingController.createBooking,
);

router.get(
    "/api/booking/my-bookings",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["booking:read"],
    }),
    bookingController.getMyBookings,
);
router.get(
    "/api/booking/:bookingId",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["booking:read"],
    }),
    bookingController.getBookingById,
);
router.get(
    "/api/booking/get-all",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["booking:read"],
        any: ["dashboard:admin", "dashboard:staff", "dashboard:manager"],
    }),
    bookingController.getAllBookings,
);

router.put(
    "/api/booking/update-status",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["booking:update"],
        any: ["dashboard:admin", "dashboard:staff", "dashboard:manager"],
    }),
    bookingController.updateBookingStatus,
);

router.post(
    "/api/booking/:bookingId/cancel",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["booking:update"],
    }),
    bookingController.customerCancelBooking,
);

router.post(
    "/booking/:bookingId/assign",
    authMiddleware,
    rbacMiddleware,
    permissionMiddleware({
        all: ["booking:update"],
        any: ["dashboard:staff"],
    }),
    bookingController.assignBooking,
);

export default router;
