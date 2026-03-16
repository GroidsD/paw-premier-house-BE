import express from "express";
import serviceController from "../controllers/serviceController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";

import {
  serviceSingleUpload,
  handleServiceUploadError,
} from "../middleware/uploadImageServices.js";
const router = express.Router();

router.post(
  "/api/service/create",
  authMiddleware,
  rbacMiddleware,
  permissionMiddleware({
    all: ["dashboard:admin", "service:create"],
  }),
  serviceSingleUpload,
  handleServiceUploadError,
  serviceController.createService,
);

router.get("/api/service/get-all", serviceController.getAllServices);

router.get("/api/service/get-by-id", serviceController.getServiceById);

router.get(
<<<<<<< HEAD
  "/api/service/get-by-category",
  authMiddleware,
  rbacMiddleware,
  permissionMiddleware({
    all: ["service:read"],
  }),
  serviceController.getServicesByCategory,
=======
    "/api/service/get-by-category",

    serviceController.getServicesByCategory,
>>>>>>> 6781314b54e86875beadc3b24c8fd18688b64782
);

router.put(
  "/api/service/update",
  authMiddleware,
  rbacMiddleware,
  permissionMiddleware({
    any: ["dashboard:admin", "dashboard:manager", "dashboard:staff"],
    all: ["service:update"],
  }),
  serviceSingleUpload,
  handleServiceUploadError,

  serviceController.updateService,
);

router.delete(
  "/api/service/soft-delete",
  authMiddleware,
  rbacMiddleware,
  permissionMiddleware({
    all: ["dashboard:admin", "service:delete"],
  }),
  serviceController.softDeleteService,
);

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
