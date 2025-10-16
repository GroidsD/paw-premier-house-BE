import db from "../models/index";
import UserService from "../services/UserService";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const getCurrentUser = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.userId, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.error("Error getCurrentUser:", err);
    return res.status(500).json({ message: "Server error at User" });
  }
};

let getAllUser = async (req, res) => {
  try {
    const users = await db.User.findAll({
      attributes: { exclude: ["password"] },
    });

    return res.status(200).json({
      errCode: 0,
      message: "OK",
      users: users,
    });
  } catch (error) {
    return res.status(500).json({
      errCode: 1,
      message: "Something went wrong",
    });
  }
};

let createNewUser = async (req, res) => {
  console.log("Check req.user:", req.body);
  try {
    // Check if the current logged in user is admin
    // if (!req.user || req.user.role !== "admin") {
    //   return res.status(403).json({
    //     errCode: 1,
    //     errMessage: "Access denied. Only admin can create new users.",
    //   });
    // }

    const { userId, role, email, password, name, phone, address, status } = req.body;

    if (!email || !password || !name ) {
      return res.status(400).json({
        errCode: 1,
        errMessage: "Missing required fields",
      });
    }

    let result = await UserService.createNewUser({
      userId,
      phone,
      address,
      status,
      email,
      password,
      name,
      role,
    });

    if (result.error) {
      return res.status(400).json({ errCode: 1, errMessage: result.message });
    }

    return res.status(200).json({
      errCode: 0,
      message: result.message,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      errCode: -1,
      errMessage: "Server error",
    });
  }
};

let deleteUserByID = async (req, res) => {
  try {
    let userId = req.query.userId;
    // console.log(userId, "ssss");

    let data = await UserService.deleteUserByID(userId);
    //console.log(data);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(200).json({
      errCode: -1,
      errMessage: " Error from Server",
    });
  }
};
let updateUserData = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        errCode: 1,
        errMessage: "Access denied. Only admin can update users.",
      });
    }

    let data = req.body;
    let result = await UserService.updateUserData(data);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Error from Server",
    });
  }
};

const handleLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await db.User.findOne({ where: { email } });

  if (!user) {
    return res.status(400).json({ errCode: 1, errMessage: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ errCode: 2, errMessage: "Wrong password" });
  }

  // const token = jwt.sign(
  //   { userId: user.userId, email: user.email, role: user.role },
  //   process.env.JWT_SECRET,
  //   { expiresIn: "1d" }
  // );
  const token = jwt.sign(
    { userId: user.userId, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" } // hoặc expiresIn: 180
  );
  res.cookie("access_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    // maxAge: 60 * 1000,
  });

  const { password: pw, ...userWithoutPassword } = user.dataValues;
  return res.status(200).json({ user: userWithoutPassword });
};
const handleLogout = (req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
  });

  return res.status(200).json({ message: "Logged out successfully" });
};

let getUsersByRole = async (req, res) => {
  try {
    const role = req.query.role;

    if (!role) {
      return res.status(400).json({ error: "Missing role parameter." });
    }

    const users = await db.User.findAll({
      where: { role: role },
      attributes: ["userId", "name", "email"],
    });

    return res.status(200).json({ users });
  } catch (err) {
    console.error("Failed to get users by role:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
};
let resetUserPassword = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        errCode: 1,
        errMessage: "Access denied. Only admin can reset password.",
      });
    }

    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) {
      return res.status(400).json({
        errCode: 1,
        errMessage: "Missing userId or newPassword",
      });
    }

    let result = await UserService.resetUserPassword(userId, newPassword);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Server error",
    });
  }
};

let changeMyPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, logoutAllDevices } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        errCode: 1,
        errMessage: "Missing oldPassword or newPassword",
      });
    }

    let result = await UserService.changeMyPassword(
      req.user.userId,
      oldPassword,
      newPassword,
      logoutAllDevices
    );

    if (logoutAllDevices) {
      res.cookie("access_token", "", { expires: new Date(0), httpOnly: true });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      errCode: -1,
      errMessage: "Server error",
    });
  }
};

module.exports = {
  getCurrentUser: getCurrentUser,
  getAllUser: getAllUser,
  createNewUser: createNewUser,
  deleteUserByID: deleteUserByID,
  updateUserData: updateUserData,
  handleLogin: handleLogin,
  handleLogout: handleLogout,
  getUsersByRole: getUsersByRole,
  resetUserPassword: resetUserPassword,
  changeMyPassword: changeMyPassword,
};