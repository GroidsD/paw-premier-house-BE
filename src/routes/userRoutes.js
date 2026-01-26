import express from "express";
import userController from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import rbacMiddleware from "../middleware/rbacMiddleware.js";
import permissionMiddleware from "../middleware/permissionMiddleware.js";
const { userSingleUpload } = require("../middleware/uploadImageUsers.js");
const { productSingleUpload } = require("../middleware/uploadImageProducts.js");
const { auditUpload } = require("../middleware/uploadExcel.js");

let router = express.Router();

let initWebRoutes = (app) => {
    router.post("/api/login", userController.login);
    router.post("/api/auth/firebase-login", userController.firebaseLogin);
    router.post("/api/logout", userController.logout);

    router.post(
        "/api/change-password",
        authMiddleware,
        userController.changeMyPassword,
    );
    router.post(
        "/api/reset-password",
        authMiddleware,
        adminMiddleware,
        userController.resetUserPassword,
    );

    router.get("/api/me", authMiddleware, userController.getCurrentUser);
    router.get(
        "/api/get-users-role",
        authMiddleware,
        rbacMiddleware,
        userController.getUsersByRole,
    );
    router.get(
        "/api/get-all-users",
        authMiddleware,
        // adminMiddleware,
        rbacMiddleware,
        permissionMiddleware(["dashboard.view"]),
        userController.getAllUsers,
    );
    // const trace = (label) => (req, res, next) => {
    //     console.log(`➡️ ${label}`);
    //     next();
    // };

    // router.get(
    //     "/api/get-all-users",
    //     trace("ROUTE ENTER"),
    //     authMiddleware,
    //     trace("AFTER AUTH"),
    //     rbacMiddleware,
    //     trace("AFTER RBAC"),
    //     permissionMiddleware(["dashboard.view"]),
    //     trace("AFTER PERMISSION"),
    //     userController.getAllUsers,
    // );

    router.post(
        "/api/update-user",
        authMiddleware,
        userSingleUpload,
        userController.updateUser,
    );
    router.post("/api/register", userController.registerUser);
    router.delete(
        "/api/delete-user/:id",
        authMiddleware,
        adminMiddleware,
        userController.deleteUserById,
    );
    router.delete(
        "/api/delete-user/hard/:id",
        authMiddleware,
        adminMiddleware,
        userController.hardDeleteUserById,
    );
    router.post(
        "/api/create-user",
        authMiddleware,
        // roleMiddleware(["admin", "manager"]),
        // rbacMiddleware,
        // permissionMiddleware(["user:create"]),
        userController.createUserByAdminOrManager,
    );

    return app.use("/", router);
};

module.exports = initWebRoutes;
