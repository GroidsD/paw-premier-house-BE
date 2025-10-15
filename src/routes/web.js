import express from "express";

import userController from "../controllers/userController";
import authMiddleware from "../middleware/authMiddleware";
import adminMiddleware from "../middleware/adminMiddleware";
import roleMiddleware from "../middleware/roleMiddleware";

const { singleUpload, userSingleUpload } = require("../middleware/upload");
const { auditUpload } = require("../middleware/uploadExcel");

let router = express.Router();
let initWebRoutes = (app) => {
    //---------------------------------------------------------------------------------------------

    // User Routes
    router.post("/api/login", userController.handleLogin);
    router.post("/api/logout", userController.handleLogout);
    // User Change Password (Need Login)
    router.post(
        "/api/change-password",
        authMiddleware,
        userController.changeMyPassword
    );
    // Admin reset Password for user
    router.post(
        "/api/reset-password",
        authMiddleware,
        adminMiddleware,
        userController.resetUserPassword
    );

    //Get Token
    router.get("/api/me", authMiddleware, userController.getCurrentUser);
    //---------------------------------------------------------------------------------------------------------
    // User Routes
    router.get(
        "/api/get-users-role",
        authMiddleware,
        userController.getUsersByRole
    );
    // Get All Users
    router.get(
        "/api/get-all-user",
        // authMiddleware,
        // adminMiddleware,
        userController.getAllUser
    );
    //Update User Data
    router.post(
        "/api/update-user",
        authMiddleware,
        adminMiddleware,
        userController.updateUserData
    );
    //create new user
    router.post(
        "/api/create-new-user",
        authMiddleware,
        adminMiddleware,
        userController.createNewUser
    );
    //Delete User by ID
    router.get(
        "/api/delete-user",
        // authMiddleware,
        // adminMiddleware,
        userController.deleteUserByID
    );
    //---------------------------------------------------------------------------------------------


    return app.use("/", router);
};

module.exports = initWebRoutes;
