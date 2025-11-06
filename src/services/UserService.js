import bcrypt from "bcrypt";
import db from "../models/index.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import admin from "../config/firebaseAdmin.js";
const fs = require("fs");
const path = require("path");
dotenv.config();

const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

// 🧂 Mã hóa mật khẩu
let hashPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            const hash = await bcrypt.hash(password, salt);
            resolve(hash);
        } catch (e) {
            reject(e);
        }
    });
};

// 👤 Lấy thông tin người dùng theo ID
let getUserById = (user_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await db.User.findByPk(user_id, {
                attributes: { exclude: ["password"] },
            });
            if (!user) return reject("User not found");
            resolve(user);
        } catch (e) {
            reject(e);
        }
    });
};

// 📋 Lấy tất cả người dùng
let getAllUsers = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const users = await db.User.findAll({
                attributes: { exclude: ["password"] },
                order: [["user_id", "ASC"]],
            });
            resolve(users);
        } catch (e) {
            reject(e);
        }
    });
};

// ➕ Tạo người dùng mới
let registerUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.email || !data.password || !data.name) {
                return reject("Missing required fields");
            }

            const existing = await db.User.findOne({
                where: { email: data.email },
            });
            if (existing)
                return resolve({
                    errCode: 1,
                    errMessage: "Email already exists",
                });

            const hashed = await hashPassword(data.password);
            const newUser = await db.User.create({
                email: data.email,
                password: hashed,
                name: data.name,
                phone: data.phone || "",
                address: data.address || "",
                role: data.role || "customer",
                status: data.status || "active",
            });

            resolve({
                errCode: 0,
                errMessage: "User created successfully",
                newUser,
            });
        } catch (e) {
            reject(e);
        }
    });
};

let updateUser = (user_id, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await db.User.findByPk(user_id);
            if (!user)
                return resolve({ errCode: 1, errMessage: "User not found" });

            // 🧹 Nếu có ảnh mới & user có ảnh cũ → xóa ảnh cũ
            if (data.img && user.img && user.img !== data.img) {
                const oldFileName = path.basename(user.img);
                const oldImagePath = path.join(
                    __dirname,
                    "../public/uploadImageUsers",
                    oldFileName
                );
            }

            await user.update({
                name: data.name || user.name,
                email: data.email || user.email,
                phone: data.phone || user.phone,
                address: data.address || user.address,
                gender: data.gender || user.gender,
                role: data.role || user.role,
                status: data.status || user.status,
                img: data.img || user.img,
            });

            resolve({
                errCode: 0,
                errMessage: "User updated successfully",
                img: data.img,
            });
        } catch (e) {
            reject(e);
        }
    });
};
// 🗑️ Xóa (ẩn) người dùng
let deleteUserById = (user_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await db.User.findByPk(user_id);
            if (!user)
                return resolve({ errCode: 1, errMessage: "User not found" });

            await user.update({ status: "inactive" });
            resolve({ errCode: 0, errMessage: "User deleted successfully" });
        } catch (e) {
            reject(e);
        }
    });
};

// 🔑 Đăng nhập
let login = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!email || !password)
                return resolve({
                    errCode: 1,
                    errMessage: "Missing email or password",
                });

            const user = await db.User.findOne({ where: { email } });
            if (!user)
                return resolve({ errCode: 2, errMessage: "User not found" });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch)
                return resolve({
                    errCode: 3,
                    errMessage: "Incorrect password",
                });

            const token = jwt.sign(
                {
                    user_id: user.user_id,
                    email: user.email,
                    role: user.role,
                },
                process.env.JWT_SECRET,
                { expiresIn: "1d" }
            );

            const { password: pw, ...userWithoutPassword } = user.dataValues;

            resolve({
                errCode: 0,
                errMessage: "Login successful",
                user: userWithoutPassword,
                token,
            });
        } catch (e) {
            reject(e);
        }
    });
};

// 🔍 Lấy danh sách người dùng theo vai trò
let getUsersByRole = (role) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!role) return reject("Missing role parameter");
            const users = await db.User.findAll({
                where: { role },
                attributes: ["user_id", "name", "email"],
            });
            resolve(users);
        } catch (e) {
            reject(e);
        }
    });
};

// 🔄 Reset mật khẩu (Admin)
let resetPassword = (user_id, newPassword) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await db.User.findByPk(user_id);
            if (!user)
                return resolve({ errCode: 1, errMessage: "User not found" });

            const hashed = await hashPassword(newPassword);
            await user.update({ password: hashed });

            resolve({ errCode: 0, errMessage: "Password reset successfully" });
        } catch (e) {
            reject(e);
        }
    });
};

// 🔐 Đổi mật khẩu cá nhân
let changeMyPassword = (user_id, oldPassword, newPassword) => {
    return new Promise(async (resolve, reject) => {
        try {
            const user = await db.User.findByPk(user_id);
            if (!user)
                return resolve({ errCode: 1, errMessage: "User not found" });

            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch)
                return resolve({
                    errCode: 2,
                    errMessage: "Old password incorrect",
                });

            const hashed = await hashPassword(newPassword);
            await user.update({ password: hashed });

            resolve({
                errCode: 0,
                errMessage: "Password changed successfully",
            });
        } catch (e) {
            reject(e);
        }
    });
};
let firebaseLogin = async (idToken) => {
    try {
        if (!idToken)
            return { errCode: 1, errMessage: "Missing Firebase ID token" };

        // ✅ Xác thực token với Firebase Admin
        const decoded = await admin.auth().verifyIdToken(idToken);

        // Thông tin từ Firebase
        const firebaseUser = {
            uid: decoded.uid,
            email: decoded.email,
            fullname: decoded.name || "",
            avatar: decoded.picture || "",
        };

        // ✅ Kiểm tra có user nào trong DB chưa
        let user = await db.User.findOne({
            where: { firebase_uid: firebaseUser.uid },
        });

        if (!user) {
            // Nếu chưa có thì tạo mới
            user = await db.User.create({
                firebase_uid: firebaseUser.uid,
                email: firebaseUser.email,
                fullname: firebaseUser.fullname,
                avatar: firebaseUser.avatar,
                role: "customer",
                isActive: true,
            });
        }

        // ✅ Tạo JWT cho backend
        const token = jwt.sign(
            {
                user_id: user.user_id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        const { password, ...userData } = user.dataValues;

        return {
            errCode: 0,
            errMessage: "Firebase login successful",
            user: userData,
            token,
        };
    } catch (error) {
        console.error("🔥 Firebase login error:", error);
        return { errCode: -1, errMessage: "Firebase login failed" };
    }
};
export default {
    getUserById,
    getAllUsers,
    registerUser,
    updateUser,
    deleteUserById,
    login,
    getUsersByRole,
    resetPassword,
    changeMyPassword,
    firebaseLogin,
};
