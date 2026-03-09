import notificationService from "../services/notificationService";

let createNotification = async (req, res) => {
    try {
        let data = await notificationService.createNotification(req.body);

        return res.status(200).json(data);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            message: "Error from server",
        });
    }
};

let getAllNotifications = async (req, res) => {
    try {
        let data = await notificationService.getAllNotifications();

        return res.status(200).json(data);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            message: "Error from server",
        });
    }
};

let getNotificationsByUser = async (req, res) => {
    try {
        let { user_id } = req.query;

        if (!user_id) {
            return res.status(400).json({
                errCode: 1,
                message: "Missing user_id",
            });
        }

        let data = await notificationService.getNotificationsByUser(user_id);

        return res.status(200).json(data);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            message: "Error from server",
        });
    }
};

let markAsRead = async (req, res) => {
    try {
        let { notification_id, user_id } = req.body;

        if (!notification_id || !user_id) {
            return res.status(400).json({
                errCode: 1,
                message: "Missing input parameter",
            });
        }

        let data = await notificationService.markAsRead(
            notification_id,
            user_id,
        );

        return res.status(200).json(data);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            message: "Error from server",
        });
    }
};

let markAllAsRead = async (req, res) => {
    try {
        let { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({
                errCode: 1,
                message: "Missing user_id",
            });
        }

        let data = await notificationService.markAllAsRead(user_id);

        return res.status(200).json(data);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            message: "Error from server",
        });
    }
};

let deleteNotification = async (req, res) => {
    try {
        let { notification_id, user_id } = req.body;

        if (!notification_id || !user_id) {
            return res.status(400).json({
                errCode: 1,
                message: "Missing input parameter",
            });
        }

        let data = await notificationService.deleteNotification(
            notification_id,
            user_id,
        );

        return res.status(200).json(data);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            message: "Error from server",
        });
    }
};

export default {
    createNotification,
    getAllNotifications,
    getNotificationsByUser,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};
