import userService from "../services/UserService.js";

// 👤 Lấy thông tin người dùng hiện tại
let getCurrentUser = async (req, res) => {
    try {
        if (!req.user || !req.user.user_id) {
            return res.status(403).json({ message: "Authentication required" });
        }

        const user = await userService.getUserById(req.user.user_id);
        return res.status(200).json(user);
    } catch (e) {
        console.error("Error in getCurrentUser:", e);
        return res.status(500).json({ error: e.message || "Server error" });
    }
};

// 📋 Lấy tất cả người dùng
let getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        return res.status(200).json(users);
    } catch (e) {
        return res.status(500).json({ error: e.message || "Server error" });
    }
};

// ➕ Tạo người dùng mới
let registerUser = async (req, res) => {
    try {
        const data = req.body;
        const result = await userService.registerUser(data);
        return res.status(200).json(result);
    } catch (e) {
        console.error("Error in registerUser:", e);
        return res.status(500).json({ error: e.message || "Server error" });
    }
};

// ✏️ Cập nhật thông tin người dùng
let updateUser = async (req, res) => {
    console.log("🧩 req.body:", req.body);
    console.log("🖼 req.file:", req.file);

    try {
        const { user_id, ...data } = req.body;
        if (req.file) {
            data.img = `/uploadImageUsers/${req.file.filename}`;
        }

        const result = await userService.updateUser(user_id, data);
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({ error: e.message || "Server error" });
    }
};

// 🗑️ Xóa người dùng
let deleteUserById = async (req, res) => {
    try {
        const { user_id } = req.query;
        const result = await userService.deleteUserById(user_id);
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({ error: e.message || "Server error" });
    }
};

let login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await userService.login(email, password);

        if (result.errCode === 0) {
            res.cookie("access_token", result.token, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
            });
        }

        return res.status(200).json(result);
    } catch (e) {
        console.error("Error in login:", e);
        return res.status(500).json({ error: e.message || "Server error" });
    }
};

let logout = async (req, res) => {
    try {
        res.clearCookie("access_token", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
        });
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (e) {
        return res.status(500).json({ error: e.message || "Server error" });
    }
};

let getUsersByRole = async (req, res) => {
    try {
        const { role } = req.query;
        const result = await userService.getUsersByRole(role);
        return res.status(200).json(result);
    } catch (e) {
        console.error("Error in getUsersByRole:", e);
        return res.status(500).json({ error: e.message || "Server error" });
    }
};

// Reset mật khẩu người dùng (admin)
let resetUserPassword = async (req, res) => {
    try {
        const { user_id, newPassword } = req.body;
        const result = await userService.resetPassword(user_id, newPassword);
        return res.status(200).json(result);
    } catch (e) {
        console.error("Error in resetUserPassword:", e);
        return res.status(500).json({ error: e.message || "Server error" });
    }
};

// Đổi mật khẩu cá nhân
let changeMyPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const result = await userService.changeMyPassword(
            req.user.user_id,
            oldPassword,
            newPassword
        );
        return res.status(200).json(result);
    } catch (e) {
        console.error("Error in changeMyPassword:", e);
        return res.status(500).json({ error: e.message || "Server error" });
    }
};
let firebaseLogin = async (req, res) => {
    try {
        console.log("🔥 Body nhận từ frontend:", req.body);
        const { idToken } = req.body;
        const response = await userService.firebaseLogin(idToken);
        return res.status(200).json(response);
    } catch (error) {
        console.error("Firebase login controller error:", error);
        return res
            .status(500)
            .json({ errCode: -1, errMessage: "Server error" });
    }
};
export default {
    getCurrentUser,
    getAllUsers,
    registerUser,
    updateUser,
    deleteUserById,
    login,
    logout,
    getUsersByRole,
    resetUserPassword,
    changeMyPassword,
    firebaseLogin,
};
