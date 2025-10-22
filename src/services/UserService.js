// import bcrypt from "bcrypt";
// import db from "../models/index.js";
// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";

// dotenv.config();
// const saltRounds = 10;
// const salt = bcrypt.genSaltSync(saltRounds);

// // 🧂 Mã hóa mật khẩu
// const hashPassword = async (password) => {
//   return await bcrypt.hash(password, salt);
// };

// // 👤 Lấy thông tin người dùng theo ID
// let getUserById = async (user_id) => {
//   try {
//     const user = await db.User.findByPk(user_id, {
//       attributes: { exclude: ["password"] },
//     });
//     if (!user) throw new Error("User not found");
//     return user;
//   } catch (e) {
//     throw e;
//   }
// };

// // 📋 Lấy tất cả người dùng
// let getAllUsers = async () => {
//   try {
//     const users = await db.User.findAll({
//       attributes: { exclude: ["password"] },
//       order: [["user_id", "ASC"]],
//     });
//     return users;
//   } catch (e) {
//     throw e;
//   }
// };

// // ➕ Tạo người dùng mới
// let createUser = async (data) => {
//   try {
//     if (!data.email || !data.password || !data.name) {
//       throw new Error("Missing required fields");
//     }

//     const existing = await db.User.findOne({ where: { email: data.email } });
//     if (existing) {
//       return { errCode: 1, errMessage: "Email already exists" };
//     }

//     const hashed = await hashPassword(data.password);
//     const newUser = await db.User.create({
//       email: data.email,
//       password: hashed,
//       name: data.name,
//       phone: data.phone || "",
//       address: data.address || "",
//       role: data.role || "customer",
//       status: data.status || "active",
//     });

//     return { errCode: 0, errMessage: "User created successfully", newUser };
//   } catch (e) {
//     throw e;
//   }
// };

// // ✏️ Cập nhật người dùng
// let updateUser = async (user_id, data) => {
//   try {
//     const user = await db.User.findByPk(user_id);
//     if (!user) {
//       return { errCode: 1, errMessage: "User not found" };
//     }

//     await user.update({
//       name: data.name || user.name,
//       email: data.email || user.email,
//       phone: data.phone || user.phone,
//       address: data.address || user.address,
//       role: data.role || user.role,
//       status: data.status || user.status,
//     });

//     return { errCode: 0, errMessage: "User updated successfully" };
//   } catch (e) {
//     throw e;
//   }
// };

// // 🗑️ Xóa (ẩn) người dùng
// let deleteUserById = async (user_id) => {
//   try {
//     const user = await db.User.findByPk(user_id);
//     if (!user) {
//       return { errCode: 1, errMessage: "User not found" };
//     }

//     await user.update({ status: "inactive" });
//     return { errCode: 0, errMessage: "User deleted successfully" };
//   } catch (e) {
//     throw e;
//   }
// };

// // 🔑 Đăng nhập
// let login = async (email, password) => {
//   try {
//     if (!email || !password)
//       return { errCode: 1, errMessage: "Missing email or password" };

//     const user = await db.User.findOne({ where: { email } });
//     if (!user) return { errCode: 2, errMessage: "User not found" };

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return { errCode: 3, errMessage: "Incorrect password" };

//     const token = jwt.sign(
//       {
//         user_id: user.user_id,
//         email: user.email,
//         role: user.role,
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     const { password: pw, ...userWithoutPassword } = user.dataValues;

//     return {
//       errCode: 0,
//       errMessage: "Login successful",
//       user: userWithoutPassword,
//       token,
//     };
//   } catch (e) {
//     throw e;
//   }
// };

// // 🔍 Lấy danh sách người dùng theo vai trò
// let getUsersByRole = async (role) => {
//   try {
//     if (!role) throw new Error("Missing role parameter");
//     const users = await db.User.findAll({
//       where: { role },
//       attributes: ["user_id", "name", "email"],
//     });
//     return users;
//   } catch (e) {
//     throw e;
//   }
// };

// // 🔄 Reset mật khẩu (Admin)
// let resetPassword = async (user_id, newPassword) => {
//   try {
//     const user = await db.User.findByPk(user_id);
//     if (!user) return { errCode: 1, errMessage: "User not found" };

//     const hashed = await hashPassword(newPassword);
//     await user.update({ password: hashed });

//     return { errCode: 0, errMessage: "Password reset successfully" };
//   } catch (e) {
//     throw e;
//   }
// };

// // 🔐 Đổi mật khẩu cá nhân
// let changeMyPassword = async (user_id, oldPassword, newPassword) => {
//   try {
//     const user = await db.User.findByPk(user_id);
//     if (!user) return { errCode: 1, errMessage: "User not found" };

//     const isMatch = await bcrypt.compare(oldPassword, user.password);
//     if (!isMatch) return { errCode: 2, errMessage: "Old password incorrect" };

//     const hashed = await hashPassword(newPassword);
//     await user.update({ password: hashed });

//     return { errCode: 0, errMessage: "Password changed successfully" };
//   } catch (e) {
//     throw e;
//   }
// };

// export default {
//   getUserById,
//   getAllUsers,
//   createUser,
//   updateUser,
//   deleteUserById,
//   login,
//   getUsersByRole,
//   resetPassword,
//   changeMyPassword,
// };
import bcrypt from "bcrypt";
import db from "../models/index.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

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
let createUser = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!data.email || !data.password || !data.name) {
        return reject("Missing required fields");
      }

      const existing = await db.User.findOne({ where: { email: data.email } });
      if (existing)
        return resolve({ errCode: 1, errMessage: "Email already exists" });

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

      resolve({ errCode: 0, errMessage: "User created successfully", newUser });
    } catch (e) {
      reject(e);
    }
  });
};

// ✏️ Cập nhật người dùng
let updateUser = (user_id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await db.User.findByPk(user_id);
      if (!user) return resolve({ errCode: 1, errMessage: "User not found" });

      await user.update({
        name: data.name || user.name,
        email: data.email || user.email,
        phone: data.phone || user.phone,
        address: data.address || user.address,
        role: data.role || user.role,
        status: data.status || user.status,
      });

      resolve({ errCode: 0, errMessage: "User updated successfully" });
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
      if (!user) return resolve({ errCode: 1, errMessage: "User not found" });

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
        return resolve({ errCode: 1, errMessage: "Missing email or password" });

      const user = await db.User.findOne({ where: { email } });
      if (!user) return resolve({ errCode: 2, errMessage: "User not found" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return resolve({ errCode: 3, errMessage: "Incorrect password" });

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
      if (!user) return resolve({ errCode: 1, errMessage: "User not found" });

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
      if (!user) return resolve({ errCode: 1, errMessage: "User not found" });

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch)
        return resolve({ errCode: 2, errMessage: "Old password incorrect" });

      const hashed = await hashPassword(newPassword);
      await user.update({ password: hashed });

      resolve({ errCode: 0, errMessage: "Password changed successfully" });
    } catch (e) {
      reject(e);
    }
  });
};

export default {
  getUserById,
  getAllUsers,
  createUser,
  updateUser,
  deleteUserById,
  login,
  getUsersByRole,
  resetPassword,
  changeMyPassword,
};
