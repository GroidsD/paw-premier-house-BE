// import db from "../models/index";
// import UserService from "../services/UserService";
// import jwt from "jsonwebtoken";
// import bcrypt from "bcrypt";
// const getCurrentUser = async (req, res) => {
//   try {
//     // console.log("Check req.user in getCurrentUser:", req.user);
//     if (!req.user || !req.user.user_id) {
//       // Lỗi này cho thấy authMiddleware đã thất bại nhưng lại gọi next()
//       console.error(
//         "DEBUG: req.user is missing in getCurrentUser, potential auth bypass or next() misuse."
//       );
//       return res
//         .status(403)
//         .json({ message: "Authentication required or failed" });
//     }
//     const user = await db.User.findByPk(req.user.user_id, {
//       attributes: { exclude: ["password"] },
//     });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // return res.status(200).json({ user });
//     return await Promise.resolve(res.status(200).json({ user }));
//   } catch (err) {
//     console.error("Error getCurrentUser:", err);
//     if (!res.headersSent) {
//       return res
//         .status(500)
//         .json({ message: `Server error at User: ${err.message}` });
//     }
//   }
// };

// let getAllUser = async (req, res) => {
//   try {
//     const users = await db.User.findAll({
//       attributes: { exclude: ["password"] },
//     });

//     return res.status(200).json({
//       errCode: 0,
//       message: "OK",
//       users: users,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       errCode: 1,
//       message: "Something went wrong",
//     });
//   }
// };

// let createNewUser = async (req, res) => {
//   console.log("Check req.user:", req.body);
//   try {
//     // Check if the current logged in user is admin
//     // if (!req.user || req.user.role !== "admin") {
//     //   return res.status(403).json({
//     //     errCode: 1,
//     //     errMessage: "Access denied. Only admin can create new users.",
//     //   });
//     // }

//     const { user_id, role, email, password, name, phone, address, status } =
//       req.body;

//     if (!email || !password || !name) {
//       return res.status(400).json({
//         errCode: 1,
//         errMessage: "Missing required fields",
//       });
//     }

//     let result = await UserService.createNewUser({
//       user_id,
//       phone,
//       address,
//       status,
//       email,
//       password,
//       name,
//       role,
//     });

//     if (result.error) {
//       return res.status(400).json({ errCode: 1, errMessage: result.message });
//     }

//     return res.status(200).json({
//       errCode: 0,
//       message: result.message,
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       errCode: -1,
//       errMessage: "Server error",
//     });
//   }
// };

// let deleteUserByID = async (req, res) => {
//   try {
//     let user_id = req.query.user_id;
//     // console.log(userId, "ssss");

//     let data = await UserService.deleteUserByID(user_id);
//     //console.log(data);
//     return res.status(200).json(data);
//   } catch (error) {
//     return res.status(200).json({
//       errCode: -1,
//       errMessage: " Error from Server",
//     });
//   }
// };
// let updateUserData = async (req, res) => {
//   try {
//     if (!req.user || req.user.role !== "admin") {
//       return res.status(403).json({
//         errCode: 1,
//         errMessage: "Access denied. Only admin can update users.",
//       });
//     }

//     let data = req.body;
//     let result = await UserService.updateUserData(data);
//     return res.status(200).json(result);
//   } catch (error) {
//     return res.status(500).json({
//       errCode: -1,
//       errMessage: "Error from Server",
//     });
//   }
// };

// const handleLogin = async (req, res) => {
//   const { email, password } = req.body;
//   const user = await db.User.findOne({ where: { email } });

//   if (!user) {
//     return res.status(400).json({ errCode: 1, errMessage: "User not found" });
//   }

//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch) {
//     return res.status(400).json({ errCode: 2, errMessage: "Wrong password" });
//   }

//   // const token = jwt.sign(
//   //   { userId: user.userId, email: user.email, role: user.role },
//   //   process.env.JWT_SECRET,
//   //   { expiresIn: "1d" }
//   // );
//   const token = jwt.sign(
//     { user_id: user.user_id, email: user.email, role: user.role },
//     process.env.JWT_SECRET,
//     { expiresIn: "1d" }
//   );

//   res.cookie("access_token", token, {
//     httpOnly: true,
//     secure: true,
//     sameSite: "none",

//     // sameSite: "Lax",
//     // maxAge: 60 * 1000,
//   });

//   const { password: pw, ...userWithoutPassword } = user.dataValues;

//   return res.status(200).json({ user: userWithoutPassword });
// };
// const handleLogout = (req, res) => {
//   res.clearCookie("access_token", {
//     httpOnly: true,
//     secure: true,
//     sameSite: "none",

//     // sameSite: "Lax",
//   });

//   return res.status(200).json({ message: "Logged out successfully" });
// };

// let getUsersByRole = async (req, res) => {
//   try {
//     const role = req.query.role;

//     if (!role) {
//       return res.status(400).json({ error: "Missing role parameter." });
//     }

//     const users = await db.User.findAll({
//       where: { role: role },
//       attributes: ["user_id  ", "name", "email"],
//     });

//     return res.status(200).json({ users });
//   } catch (err) {
//     console.error("Failed to get users by role:", err);
//     return res.status(500).json({ error: "Internal server error." });
//   }
// };
// let resetUserPassword = async (req, res) => {
//   try {
//     if (!req.user || req.user.role !== "admin") {
//       return res.status(403).json({
//         errCode: 1,
//         errMessage: "Access denied. Only admin can reset password.",
//       });
//     }

//     const { user_id, newPassword } = req.body;
//     if (!user_id || !newPassword) {
//       return res.status(400).json({
//         errCode: 1,
//         errMessage: "Missing userId or newPassword",
//       });
//     }

//     let result = await UserService.resetUserPassword(user_id, newPassword);
//     return res.status(200).json(result);
//   } catch (error) {
//     return res.status(500).json({
//       errCode: -1,
//       errMessage: "Server error",
//     });
//   }
// };

// let changeMyPassword = async (req, res) => {
//   try {
//     const { oldPassword, newPassword, logoutAllDevices } = req.body;
//     if (!oldPassword || !newPassword) {
//       return res.status(400).json({
//         errCode: 1,
//         errMessage: "Missing oldPassword or newPassword",
//       });
//     }

//     let result = await UserService.changeMyPassword(
//       req.user.user_id,
//       oldPassword,
//       newPassword,
//       logoutAllDevices
//     );

//     if (logoutAllDevices) {
//       res.cookie("access_token", "", { expires: new Date(0), httpOnly: true });
//     }

//     return res.status(200).json(result);
//   } catch (error) {
//     return res.status(500).json({
//       errCode: -1,
//       errMessage: "Server error",
//     });
//   }
// };

// module.exports = {
//   getCurrentUser: getCurrentUser,
//   getAllUser: getAllUser,
//   createNewUser: createNewUser,
//   deleteUserByID: deleteUserByID,
//   updateUserData: updateUserData,
//   handleLogin: handleLogin,
//   handleLogout: handleLogout,
//   getUsersByRole: getUsersByRole,
//   resetUserPassword: resetUserPassword,
//   changeMyPassword: changeMyPassword,
// };
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
let createUser = async (req, res) => {
  try {
    const data = req.body;
    const result = await userService.createUser(data);
    return res.status(200).json(result);
  } catch (e) {
    console.error("Error in createUser:", e);
    return res.status(500).json({ error: e.message || "Server error" });
  }
};

// ✏️ Cập nhật thông tin người dùng
let updateUser = async (req, res) => {
  try {
    const { user_id, ...data } = req.body;
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

// 🔑 Đăng nhập
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

// 🚪 Đăng xuất
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

// 🔍 Lấy danh sách người dùng theo vai trò
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

// 🔄 Reset mật khẩu người dùng (admin)
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

// 🔐 Đổi mật khẩu cá nhân
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

export default {
  getCurrentUser,
  getAllUsers,
  createUser,
  updateUser,
  deleteUserById,
  login,
  logout,
  getUsersByRole,
  resetUserPassword,
  changeMyPassword,
};
