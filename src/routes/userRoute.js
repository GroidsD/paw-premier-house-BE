import express from "express";
import userController from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
const { userSingleUpload } = require("../middleware/uploadImageUsers");
const { productSingleUpload } = require("../middleware/uploadImageProducts");
const { auditUpload } = require("../middleware/uploadExcel");

let router = express.Router();

let initWebRoutes = (app) => {
    router.post("/api/login", userController.login);
    router.post("/api/auth/firebase-login", userController.firebaseLogin);
    router.post("/api/logout", userController.logout);

    router.post(
        "/api/change-password",
        authMiddleware,
        userController.changeMyPassword
    );
    router.post(
        "/api/reset-password",
        authMiddleware,
        adminMiddleware,
        userController.resetUserPassword
    );

    router.get(
        "/api/me",
        //  authMiddleware,
        userController.getCurrentUser
    );
    router.get(
        "/api/get-users-role",
        authMiddleware,
        userController.getUsersByRole
    );
    router.get(
        "/api/get-all-users",
        authMiddleware,
        adminMiddleware,
        userController.getAllUsers
    );

    router.post(
        "/api/update-user",
        authMiddleware,
        userSingleUpload,
        userController.updateUser
    );
    router.post("/api/register", userController.registerUser);
    router.get(
        "/api/delete-user",
        authMiddleware,
        adminMiddleware,
        userController.deleteUserById
    );

    return app.use("/", router);
};

module.exports = initWebRoutes;
