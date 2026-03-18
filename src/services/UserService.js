import bcrypt from "bcrypt";
import db from "../models/index.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import admin from "../config/firebaseAdmin.js";
import { log } from "console";
const fs = require("fs");
const path = require("path");
dotenv.config();

const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);


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

let getUserById = (user_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const u = await db.User.findByPk(user_id, {
                attributes: { exclude: ["password"] },
                include: [
                    {
                        model: db.Role,
                        as: "roles",
                        attributes: ["id", "name"],
                        through: { attributes: [] },
                        include: [
                            {
                                model: db.Permission,
                                as: "permissions",
                                attributes: ["id", "action"],
                                through: { attributes: [] },
                            },
                        ],
                    },
                    {
                        model: db.UserPermission,
                        as: "permissionOverrides",
                        attributes: ["allowed"],
                        include: [
                            {
                                model: db.Permission,
                                attributes: ["action"],
                            },
                        ],
                    },
                ],
            });

            if (!u) return reject("User not found");

            
            const permissionMap = new Map();

            
            u.roles.forEach((role) => {
                role.permissions.forEach((p) => {
                    permissionMap.set(p.action, true);
                });
            });

            
            u.permissionOverrides.forEach((o) => {
                permissionMap.set(o.Permission.action, o.allowed);
            });

            const finalPermissions = [...permissionMap.entries()]
                .filter(([_, allowed]) => allowed)
                .map(([action]) => action);

            const plain = u.toJSON();

            
            plain.roles = plain.roles.map((r) => r.name);

            
            plain.permissions = finalPermissions;

            
            delete plain.permissionOverrides;

            resolve(plain);
        } catch (e) {
            reject(e);
        }
    });
};

let getAllUsers = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const users = await db.User.findAll({
                attributes: { exclude: ["password"] },
                include: [
                    {
                        model: db.Role,
                        as: "roles",
                        attributes: ["id", "name"],
                        through: { attributes: [] },
                        include: [
                            {
                                model: db.Permission,
                                as: "permissions",
                                attributes: ["id", "action"],
                                through: { attributes: [] },
                            },
                        ],
                    },
                    {
                        model: db.UserPermission,
                        as: "permissionOverrides",
                        attributes: ["allowed"],
                        include: [
                            {
                                model: db.Permission,
                                attributes: ["action"],
                            },
                        ],
                    },
                ],
                order: [["user_id", "ASC"]],
            });

            const result = users.map((u) => {
                const permissionMap = new Map();

                
                u.roles.forEach((role) => {
                    role.permissions.forEach((p) => {
                        permissionMap.set(p.action, true);
                    });
                });

                
                u.permissionOverrides.forEach((o) => {
                    permissionMap.set(o.Permission.action, o.allowed);
                });

                const finalPermissions = [...permissionMap.entries()]
                    .filter(([_, allowed]) => allowed)
                    .map(([action]) => action);

                const plain = u.toJSON();

                
                plain.permissions = finalPermissions;
                
                if (plain.roles) {
                    plain.roles = plain.roles.map((r) => r.name);
                }
                
                
                delete plain.permissionOverrides;

                return plain;
            });

            resolve(result);
        } catch (e) {
            reject(e);
        }
    });
};


let registerUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.email || !data.password || !data.fullname) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing required fields",
                });
            }

            
            const existing = await db.User.findOne({
                where: { email: data.email },
            });
            if (existing) {
                return resolve({
                    errCode: 2,
                    errMessage: "Email already exists",
                });
            }

            
            const hashed = await hashPassword(data.password);

            
            console.log(data);

            const newUser = await db.User.create({
                user_id: data.firebaseUid || null,
                email: data.email,
                password: hashed,
                fullname: data.fullname,
                phone: data.phone || "",
                address: data.address || "",
                status: data.status || "active",
            });

            
            const defaultRole = await db.Role.findOne({
                where: { name: "customer" },
            });

            if (!defaultRole) {
                return resolve({
                    errCode: 3,
                    errMessage: "Default role not found",
                });
            }
            console.log(newUser.user_id);
            console.log(defaultRole);

            
            await db.UserRole.create({
                user_id: newUser.user_id,
                role_id: defaultRole.id,
            });

            resolve({
                errCode: 0,
                errMessage: "User created successfully",
                userId: newUser,
            });
        } catch (e) {
            reject(e);
        }
    });
};

let updateUser = (user_id, data) => {
    return new Promise(async (resolve, reject) => {
        const transaction = await db.sequelize.transaction();
        try {
            const user = await db.User.findByPk(user_id, { transaction });

            if (!user) {
                await transaction.rollback();
                return resolve({
                    errCode: 1,
                    errMessage: "User not found",
                });
            }

            
            if (data.avatar && user.avatar && user.avatar !== data.avatar) {
                const oldFileName = path.basename(user.avatar);
                const oldImagePath = path.join(
                    __dirname,
                    "../public/uploadImageUsers",
                    oldFileName,
                );

                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            
            await user.update(
                {
                    fullname: data.fullname ?? user.fullname,
                    email: data.email ?? user.email,
                    phone: data.phone ?? user.phone,
                    address: data.address ?? user.address,
                    dob: data.dob ?? user.dob,
                    gender: data.gender ?? user.gender,
                    status: data.status ?? user.status,
                    isActive: data.isActive ?? user.isActive,
                    avatar: data.avatar ?? user.avatar,
                },
                { transaction },
            );

            
            if (data.role) {
                
                const role = await db.Role.findOne({
                    where: { name: data.role },
                    transaction,
                });

                if (!role) {
                    await transaction.rollback();
                    return resolve({
                        errCode: 2,
                        errMessage: "Invalid role",
                    });
                }

                
                await db.UserRole.destroy({
                    where: { user_id },
                    transaction,
                });

                
                await db.UserRole.create(
                    {
                        user_id,
                        role_id: role.id,
                    },
                    { transaction },
                );
            }
            

            await transaction.commit();

            resolve({
                errCode: 0,
                errMessage: "User updated successfully",
                avatar: user.avatar,
            });
        } catch (e) {
            await transaction.rollback();
            reject(e);
        }
    });
};

let deleteUserById = async (user_id) => {
    try {
        console.log("SERVICE DELETE → id:", user_id);

        const user = await db.User.findByPk(user_id);

        if (!user) {
            return { errCode: 1, errMessage: "User not found" };
        }

        await user.update({ isActive: false });

        console.log("UPDATED USER:", user.toJSON());

        return {
            errCode: 0,
            errMessage: "User deleted successfully",
        };
    } catch (e) {
        console.error("SERVICE DELETE ERROR:", e);
        throw e;
    }
};

let hardDeleteUserById = async (user_id) => {
    try {
        const user = await db.User.findByPk(user_id);
        if (!user) {
            return { errCode: 1, errMessage: "User not found" };
        }

        if (user.auth_provider.toLowerCase() === "firebase") {
            try {
                await admin.auth().deleteUser(user_id);
                console.log("Firebase user deleted:", user_id);
            } catch (firebaseError) {
                if (firebaseError.code === "auth/user-not-found") {
                    console.warn(
                        `Firebase user ${user_id} not found, skip deletion`,
                    );
                } else {
                    console.error(
                        "Error deleting Firebase user:",
                        firebaseError,
                    );
                    throw firebaseError; 
                }
            }
        }

        await db.UserRole.destroy({
            where: { user_id },
        });

        await user.destroy();

        return {
            errCode: 0,
            errMessage: "User permanently deleted successfully",
        };
    } catch (e) {
        console.error("SERVICE HARD DELETE ERROR:", e);
        throw e;
    }
};

let login = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!email || !password) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing email or password",
                });
            }

            const user = await db.User.findOne({
                where: { email },
                attributes: { exclude: ["password"] },
                include: [
                    {
                        model: db.Role,
                        as: "roles",
                        attributes: ["id", "name"],
                        through: { attributes: [] },
                        include: [
                            {
                                model: db.Permission,
                                as: "permissions",
                                attributes: ["action"],
                                through: { attributes: [] },
                            },
                        ],
                    },
                    {
                        model: db.UserPermission,
                        as: "permissionOverrides",
                        attributes: ["allowed"],
                        include: [
                            {
                                model: db.Permission,
                                attributes: ["action"],
                            },
                        ],
                    },
                ],
            });

            if (!user) {
                return resolve({
                    errCode: 2,
                    errMessage: "User not found",
                });
            }

            
            const userWithPassword = await db.User.findOne({
                where: { email },
                attributes: ["password"],
            });

            const isMatch = await bcrypt.compare(
                password,
                userWithPassword.password,
            );

            if (!isMatch) {
                return resolve({
                    errCode: 3,
                    errMessage: "Incorrect password",
                });
            }

            
            const permissionMap = new Map();

            
            user.roles.forEach((role) => {
                role.permissions.forEach((p) => {
                    permissionMap.set(p.action, true);
                });
            });

            
            user.permissionOverrides.forEach((o) => {
                permissionMap.set(o.Permission.action, o.allowed);
            });

            const finalPermissions = [...permissionMap.entries()]
                .filter(([_, allowed]) => allowed)
                .map(([action]) => action);

            
            const dashboardPermissions = finalPermissions.filter(
                (p) => p.startsWith("dashboard.") || p.startsWith("dashboard:"),
            );

            
            const token = jwt.sign(
                {
                    user_id: user.user_id,
                    email: user.email,
                    
                },
                process.env.JWT_SECRET,
                { expiresIn: "1d" },
            );

            const plain = user.toJSON();
            plain.permissions = dashboardPermissions;
            plain.roles = plain.roles.map((r) => r.name);
            delete plain.permissionOverrides;
            await db.User.update(
                { last_login_at: new Date(), last_seen_at: new Date() },
                { where: { user_id: user.user_id } },
            );

            resolve({
                errCode: 0,
                errMessage: "Login successful",
                user: plain,
                token,
            });
        } catch (e) {
            reject(e);
        }
    });
};


let getUsersByRole = async (roleName) => {
    try {
        if (!roleName) throw "Missing role parameter";

        const users = await db.User.findAll({
            include: [
                {
                    model: db.Role,
                    as: "roles",
                    where: { name: roleName }, 
                    attributes: ["id", "name"],
                    through: { attributes: [] }, 
                    include: [
                        {
                            model: db.Permission,
                            as: "permissions",
                            attributes: ["id", "action"],
                            through: { attributes: [] }, 
                        },
                    ],
                },
            ],
            attributes: ["user_id", "fullname", "email", "isActive"],
        });

        
        const result = users.map((u) => {
            const user = u.toJSON();

            const permissionSet = new Set();

            user.roles.forEach((role) => {
                role.permissions.forEach((p) => {
                    permissionSet.add(p.action);
                });
            });

            return {
                user_id: user.user_id,
                fullname: user.fullname,
                email: user.email,
                isActive: user.isActive,
                roles: user.roles.map((r) => r.name),
                permissions: [...permissionSet],
            };
        });

        return result;
    } catch (e) {
        throw e;
    }
};


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
        if (!idToken) {
            return { errCode: 1, errMessage: "Missing Firebase ID token" };
        }

        
        const decoded = await admin.auth().verifyIdToken(idToken);

        const firebaseUser = {
            uid: decoded.uid,
            email: decoded.email,
            fullname: decoded.name || "",
            avatar: decoded.picture || "",
        };

        
        let user = await db.User.findByPk(firebaseUser.uid);

        if (!user && firebaseUser.email) {
            user = await db.User.findOne({
                where: { email: firebaseUser.email },
            });

            if (user) {
                await user.update({
                    user_id: firebaseUser.uid,
                    auth_provider: "firebase",
                });
            }
        }

        
        if (!user) {
            user = await db.User.create({
                user_id: firebaseUser.uid,
                email: firebaseUser.email,
                fullname: firebaseUser.fullname,
                avatar: firebaseUser.avatar,
                role: "customer",
                status: "active",
                isActive: true,
                auth_provider: "firebase",
            });
        }

        
        const fullUser = await db.User.findOne({
            where: { user_id: user.user_id },
            attributes: { exclude: ["password"] },
            include: [
                {
                    model: db.Role,
                    as: "roles",
                    attributes: ["id", "name"],
                    through: { attributes: [] },
                    include: [
                        {
                            model: db.Permission,
                            as: "permissions",
                            attributes: ["action"],
                            through: { attributes: [] },
                        },
                    ],
                },
                {
                    model: db.UserPermission,
                    as: "permissionOverrides",
                    attributes: ["allowed"],
                    include: [
                        {
                            model: db.Permission,
                            attributes: ["action"],
                        },
                    ],
                },
            ],
        });

        
        const permissionMap = new Map();

        
        fullUser.roles.forEach((role) => {
            role.permissions.forEach((p) => {
                permissionMap.set(p.action, true);
            });
        });

        
        fullUser.permissionOverrides.forEach((o) => {
            permissionMap.set(o.Permission.action, o.allowed);
        });

        const finalPermissions = [...permissionMap.entries()]
            .filter(([_, allowed]) => allowed)
            .map(([action]) => action);

        
        const token = jwt.sign(
            {
                user_id: fullUser.user_id,
                email: fullUser.email,
                
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" },
        );
        
        const dashboardPermissions = finalPermissions.filter((p) =>
            p.startsWith("dashboard:"),
        );
        
        const plain = fullUser.toJSON();

        plain.permissions = dashboardPermissions;
        plain.roles = plain.roles.map((r) => r.name);

        
        delete plain.permissionOverrides;
        await db.User.update(
            { last_login_at: new Date(), last_seen_at: new Date() },
            { where: { user_id: fullUser.user_id } },
        );

        return {
            errCode: 0,
            errMessage: "Firebase login successful",
            user: plain,
            token,
        };
    } catch (error) {
        console.error("Firebase login error:", error);
        return { errCode: -1, errMessage: "Firebase login failed" };
    }
};

let createUserByAdminOrManager = (permission, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(permission);
            console.log(data);

            if (!data.email || !data.password || !data.fullname) {
                return resolve({
                    errCode: 1,
                    errMessage: "Missing required fields",
                });
            }

            
            
            
            let assignedRole = data.role;

            
            
            
            const existing = await db.User.findOne({
                where: { email: data.email },
            });

            if (existing) {
                return resolve({
                    errCode: 4,
                    errMessage: "Email already exists",
                });
            }

            const hashed = await hashPassword(data.password);

            const newUser = await db.User.create({
                user_id: data.firebaseUid || null,
                email: data.email,
                password: hashed,
                fullname: data.fullname,
                phone: data.phone || "",
                address: data.address || "",
                status: "active",
            });

            
            
            
            const role = await db.Role.findOne({
                where: { name: assignedRole },
            });

            if (!role) {
                return resolve({
                    errCode: 5,
                    errMessage: "Role not found in system",
                });
            }

            await db.UserRole.create({
                user_id: newUser.user_id,
                role_id: role.id,
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
let pingPresence = async (user_id) => {
    await db.User.update({ last_seen_at: new Date() }, { where: { user_id } });
    return true;
};
let setOffline = async (user_id) => {
    await db.User.update({ last_seen_at: null }, { where: { user_id } });
};

export default {
    getUserById,
    getAllUsers,
    registerUser,
    updateUser,
    deleteUserById,
    hardDeleteUserById,
    login,
    getUsersByRole,
    resetPassword,
    changeMyPassword,
    firebaseLogin,
    createUserByAdminOrManager,
    pingPresence,
    setOffline,
};
