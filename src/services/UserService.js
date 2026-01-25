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

// Mã hóa mật khẩu
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

//  Lấy thông tin người dùng theo ID
// let getUserById = (user_id) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const user = await db.User.findByPk(user_id, {
//                 attributes: { exclude: ["password"] },
//             });
//             if (!user) return reject("User not found");
//             resolve(user);
//         } catch (e) {
//             reject(e);
//         }
//     });
// };
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

      // ===== Build permission map =====
      const permissionMap = new Map();

      // từ role
      u.roles.forEach((role) => {
        role.permissions.forEach((p) => {
          permissionMap.set(p.action, true);
        });
      });

      // override
      u.permissionOverrides.forEach((o) => {
        permissionMap.set(o.Permission.action, o.allowed);
      });

      const finalPermissions = [...permissionMap.entries()]
        .filter(([_, allowed]) => allowed)
        .map(([action]) => action);

      const plain = u.toJSON();

      // expose roles dạng ["admin","staff"]
      plain.roles = plain.roles.map((r) => r.name);

      // expose permission final
      plain.permissions = finalPermissions;

      // xoá RBAC nội bộ
      delete plain.permissionOverrides;

      resolve(plain);
    } catch (e) {
      reject(e);
    }
  });
};

//  Lấy tất cả người dùng
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
// let getAllUsers = () => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const users = await db.User.findAll({
//                 attributes: { exclude: ["password"] },
//                 include: [
//                     {
//                         model: db.Role,
//                         as: "roles",
//                         attributes: ["id", "name"],
//                         through: { attributes: [] },
//                         include: [
//                             {
//                                 model: db.Permission,
//                                 as: "permissions",
//                                 attributes: ["id", "action"],
//                                 through: { attributes: [] },
//                             },
//                         ],
//                     },
//                     {
//                         model: db.UserPermission,
//                         as: "permissionOverrides",
//                         attributes: ["allowed"],
//                         include: [
//                             {
//                                 model: db.Permission,
//                                 attributes: ["action"],
//                             },
//                         ],
//                     },
//                 ],
//                 order: [["user_id", "ASC"]],
//             });

//             const result = users.map((u) => {
//                 const permissionMap = new Map();

//                 // permissions từ role
//                 u.roles.forEach((role) => {
//                     role.permissions.forEach((p) => {
//                         permissionMap.set(p.action, true);
//                     });
//                 });

//                 // override
//                 u.permissionOverrides.forEach((o) => {
//                     permissionMap.set(o.Permission.action, o.allowed);
//                 });

//                 const finalPermissions = [...permissionMap.entries()]
//                     .filter(([_, allowed]) => allowed)
//                     .map(([action]) => action);

//                 const plain = u.toJSON();

//                 // chỉ expose final permissions
//                 plain.permissions = finalPermissions;
//                 // Chỉ giữ tên role
//                 if (plain.roles) {
//                     plain.roles = plain.roles.map((r) => r.name);
//                 }
//                 // 🔥 xoá toàn bộ RBAC internal
//                 // delete plain.roles;
//                 delete plain.permissionOverrides;

//                 return plain;
//             });

//             resolve(result);
//         } catch (e) {
//             reject(e);
//         }
//     });
// };

//  Tạo người dùng mới
let registerUser = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.email || !data.password || !data.fullname) {
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
        fullname: data.fullname,
        phone: data.phone || "",
        address: data.address || "",
        role: "customer",
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
      if (!user) return resolve({ errCode: 1, errMessage: "User not found" });

      // 🧹 Nếu có ảnh mới & user có ảnh cũ → xóa ảnh cũ
      if (data.img && user.img && user.img !== data.img) {
        const oldFileName = path.basename(user.img);
        const oldImagePath = path.join(
          __dirname,
          "../public/uploadImageUsers",
          oldFileName,
        );
      }

      await user.update({
        fullname: data.fullname || user.fullname,
        email: data.email || user.email,
        phone: data.phone || user.phone,
        address: data.address || user.address,
        gender: data.gender || user.gender,
        role: data.role || user.role,
        isActive: data.isActive !== undefined ? data.isActive : user.isActive,
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
//  Xóa (ẩn) người dùng
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

    if (
      user.auth_provider === "firebase" ||
      user.auth_provider === "Firebase"
    ) {
      try {
        await admin.auth().deleteUser(user_id);
        console.log("Firebase user deleted:", user_id);
      } catch (firebaseError) {
        console.error("Error deleting Firebase user:", firebaseError);
      }
    }

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

//  Đăng nhập
// let login = (email, password) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             if (!email || !password)
//                 return resolve({
//                     errCode: 1,
//                     errMessage: "Missing email or password",
//                 });

//             const user = await db.User.findOne({ where: { email } });
//             if (!user)
//                 return resolve({ errCode: 2, errMessage: "User not found" });

//             const isMatch = await bcrypt.compare(password, user.password);
//             if (!isMatch)
//                 return resolve({
//                     errCode: 3,
//                     errMessage: "Incorrect password",
//                 });

//             const token = jwt.sign(
//                 {
//                     user_id: user.user_id,
//                     email: user.email,
//                     role: user.role,
//                 },
//                 process.env.JWT_SECRET,
//                 { expiresIn: "1d" }
//             );

//             const { password: pw, ...userWithoutPassword } = user.dataValues;

//             resolve({
//                 errCode: 0,
//                 errMessage: "Login successful",
//                 user: userWithoutPassword,
//                 token,
//             });
//         } catch (e) {
//             reject(e);
//         }
//     });
// };
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

      // cần query password riêng vì exclude ở trên
      const userWithPassword = await db.User.findOne({
        where: { email },
        attributes: ["password"],
      });

      const isMatch = await bcrypt.compare(password, userWithPassword.password);

      if (!isMatch) {
        return resolve({
          errCode: 3,
          errMessage: "Incorrect password",
        });
      }

      /* ================= MERGE PERMISSIONS ================= */
      const permissionMap = new Map();

      // từ role
      user.roles.forEach((role) => {
        role.permissions.forEach((p) => {
          permissionMap.set(p.action, true);
        });
      });

      // override từ user
      user.permissionOverrides.forEach((o) => {
        permissionMap.set(o.Permission.action, o.allowed);
      });

      const finalPermissions = [...permissionMap.entries()]
        .filter(([_, allowed]) => allowed)
        .map(([action]) => action);

      /* ================= JWT ================= */
      const token = jwt.sign(
        {
          user_id: user.user_id,
          email: user.email,
          permissions: finalPermissions,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" },
      );

      const plain = user.toJSON();

      plain.permissions = finalPermissions;
      plain.roles = plain.roles.map((r) => r.name);

      // xoá internal RBAC
      delete plain.permissionOverrides;

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

//  Lấy danh sách người dùng theo vai trò
// let getUsersByRole = (role) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             if (!role) return reject("Missing role parameter");
//             const users = await db.User.findAll({
//                 where: { role },
//                 attributes: ["user_id", "fullname", "email"],
//             });
//             resolve(users);
//         } catch (e) {
//             reject(e);
//         }
//     });
// };
//  Lấy danh sách người dùng theo vai trò + permissions
let getUsersByRole = async (roleName) => {
  try {
    if (!roleName) throw "Missing role parameter";

    const users = await db.User.findAll({
      include: [
        {
          model: db.Role,
          as: "roles",
          where: { name: "admin" }, // lọc theo role
          attributes: ["id", "name"],
          through: { attributes: [] }, // bỏ bảng trung gian UserRole
          include: [
            {
              model: db.Permission,
              as: "permissions",
              attributes: ["id", "action"],
              through: { attributes: [] }, // bỏ RolePermission
            },
          ],
        },
      ],
      attributes: ["user_id", "fullname", "email"],
    });

    // Chuẩn hoá output
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
        roles: user.roles.map((r) => r.name),
        permissions: [...permissionSet],
      };
    });

    return result;
  } catch (e) {
    throw e;
  }
};

//  Reset mật khẩu (Admin)
let resetPassword = (user_id, newPassword) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await db.User.findByPk(user_id);
      if (!user) return resolve({ errCode: 1, errMessage: "User not found" });

      const hashed = await hashPassword(newPassword);
      await user.update({ password: hashed });

      resolve({ errCode: 0, errMessage: "Password reset successfully" });
    } catch (e) {
      reject(e);
    }
  });
};

//  Đổi mật khẩu cá nhân
let changeMyPassword = (user_id, oldPassword, newPassword) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await db.User.findByPk(user_id);
      if (!user) return resolve({ errCode: 1, errMessage: "User not found" });

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
      avatar: decoded.avatar || "",
    };

    // ✅ Tìm user theo user_id = firebase uid
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

    // ✅ Nếu chưa có → tạo mới
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

    // ✅ Tạo JWT
    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    const { password, ...userData } = user.dataValues;

    return {
      errCode: 0,
      errMessage: "Firebase login successful",
      user: userData,
      token,
    };
  } catch (error) {
    console.error("Firebase login error:", error);
    return { errCode: -1, errMessage: "Firebase login failed" };
  }
};

let createUserByAdminOrManager = (creatorRole, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.email || !data.password || !data.fullname) {
        return resolve({
          errCode: 1,
          errMessage: "Missing required fields",
        });
      }

      //  Không phải admin hoặc manager
      if (!["admin", "manager"].includes(creatorRole)) {
        return resolve({
          errCode: 2,
          errMessage: "Permission denied",
        });
      }

      // -------------------------------------
      //  Auto-assign role theo quyền creator
      // -------------------------------------
      let assignedRole = data.role;

      if (creatorRole === "manager") {
        assignedRole = "staff"; // manager luôn tạo staff
      }

      if (creatorRole === "admin") {
        // Admin tự chọn role, nhưng vẫn check hợp lệ
        if (!["admin", "manager", "staff", "customer"].includes(assignedRole)) {
          return resolve({
            errCode: 3,
            errMessage: "Invalid role",
          });
        }
      }

      // ---------------------------------
      // Kiểm tra email tồn tại
      // ---------------------------------
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

      const userData = {
        email: data.email,
        password: hashed,
        fullname: data.fullname,
        phone: data.phone || "",
        address: data.address || "",
        role: assignedRole,
        status: "active",
        isActive: data.isActive !== undefined ? data.isActive : 1,
        auth_provider: data.firebaseUid ? "firebase" : "local",
      };

      if (data.firebaseUid) {
        userData.user_id = data.firebaseUid;
      }

      const newUser = await db.User.create(userData);

      const { password: _, ...userWithoutPassword } = newUser.dataValues;

      resolve({
        errCode: 0,
        errMessage: "User created successfully",
        newUser: userWithoutPassword,
      });
    } catch (e) {
      reject(e);
    }
  });
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
};
