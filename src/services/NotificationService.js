import db from "../models/index";

let createNotification = async (data) => {
    try {
        let user = await db.User.findOne({
            where: { user_id: data.user_id },
        });

        if (!user) {
            return {
                errCode: 1,
                message: "User not found",
            };
        }

        let notification = await db.Notification.create({
            user_id: data.user_id,
            title: data.title,
            message: data.message,
            type: data.type,
            entity_type: data.entity_type,
            entity_id: data.entity_id,
            redirect_url: data.redirect_url,
        });

        return {
            errCode: 0,
            message: "Create notification success",
            data: notification,
        };
    } catch (e) {
        throw e;
    }
};

let getAllNotifications = async () => {
    try {
        let notifications = await db.Notification.findAll({
            order: [["created_at", "DESC"]],
        });

        return {
            errCode: 0,
            data: notifications,
        };
    } catch (e) {
        throw e;
    }
};

let getNotificationsByUser = async (user_id) => {
    try {
        let notifications = await db.Notification.findAll({
            where: { user_id },
            order: [["created_at", "DESC"]],
        });

        return {
            errCode: 0,
            data: notifications,
        };
    } catch (e) {
        throw e;
    }
};

let markAsRead = async (notification_id, user_id) => {
    try {
        let notification = await db.Notification.findOne({
            where: {
                notification_id,
                user_id,
            },
        });

        if (!notification) {
            return {
                errCode: 1,
                message: "Notification not found or not belong to user",
            };
        }

        notification.is_read = true;

        await notification.save();

        return {
            errCode: 0,
            message: "Marked as read",
        };
    } catch (e) {
        throw e;
    }
};

let markAllAsRead = async (user_id) => {
    try {
        await db.Notification.update(
            { is_read: true },
            {
                where: {
                    user_id,
                    is_read: false,
                },
            },
        );

        return {
            errCode: 0,
            message: "All notifications marked as read",
        };
    } catch (e) {
        throw e;
    }
};

let deleteNotification = async (notification_id, user_id) => {
    try {
        let notification = await db.Notification.findOne({
            where: {
                notification_id,
                user_id,
            },
        });

        if (!notification) {
            return {
                errCode: 1,
                message: "Notification not found or not belong to user",
            };
        }

        await notification.destroy();

        return {
            errCode: 0,
            message: "Delete success",
        };
    } catch (e) {
        throw e;
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
