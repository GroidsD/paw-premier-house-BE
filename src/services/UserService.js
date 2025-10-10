import bcrypt from "bcrypt";
import db from "../models/index";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

let createNewUser = async (data) => {
  try {
    // Check email exists ??
    const existingUser = await db.User.findOne({
      where: { email: data.email },
    });

    if (existingUser) {
      return { error: true, message: "Email already exists" };
    }

    let hashPasswordFromBcrypt = await hashUserPassword(data.password);
    await db.User.create({
      email: data.email,
      password: hashPasswordFromBcrypt,
      name: data.name,
      role: data.role,
    
    });

    return { error: false, message: "Create new user successful" };
  } catch (e) {
    throw e;
  }
};
//Encypt Password
let hashUserPassword = async (password) => {
  try {
    const hashPassword = await bcrypt.hash(password, salt);
    return hashPassword;
  } catch (e) {
    throw e;
  }
};
//Get all User
let getAllUser = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = await db.User.findAll({
        raw: true,
      });
      resolve(users);
    } catch (e) {
      reject(e);
    }
  });
};

let updateUserData = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { userId: data.userId },
      });

      if (user) {
        user.name = data.name;
        user.role = data.role;
        user.department = data.department;
        await user.save();

        let allUser = await db.User.findAll();
        resolve({
          errCode: 0,
          errMessage: "OK",
          users: allUser,
        });
      } else {
        resolve({
          errCode: 1,
          errMessage: "Cannot find user",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let deleteUserByID = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!userId) {
        resolve({
          errCode: 1,
          errMessage: "Missing required parameter: userId",
        });
        return;
      }

      let user = await db.User.findOne({
        where: { userId: userId },
      });

      if (!user) {
        resolve({
          errCode: 2,
          errMessage: "User not found",
        });
      } else {
        await user.destroy();
        resolve({
          errCode: 0,
          errMessage: "User deleted successfully",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

let handleLogin = (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      let userData = {};
      let isExist = await checkUserEmail(email);
      if (isExist) {
        //User Allready exist
        let user = await db.User.findOne({
          attributes: ["userId", "email", "role", "password"],
          where: { email: email },
          raw: true,
        });
        if (user) {
          //Compare PassWord
          let check = await bcrypt.compareSync(password, user.password); //false
          if (check) {
            userData.errCode = 0;
            userData.errMessage = "Ok";
            console.log(user);

            delete user.password;
            userData.user = user;

            const token = jwt.sign(
              {
                id: user.userId,
                email: user.email,
                role: user.role,
              },
              process.env.JWT_SECRET,
              { expiresIn: "1d" }
            );

            userData.token = token;
          } else {
            userData.errCode = 3;
            userData.errMessage = "Wrong Password";
          }
        } else {
          userData.errCode = 2;
          userData.errMessage = "User not found";
        }
      } else {
        //Return Error
        userData.errCode = 1;
        userData.errMessage = `Your email isn't exist in your system . Please try other email!`;
      }
      resolve(userData);
    } catch (e) {
      reject(e);
    }
  });
};
let checkUserEmail = (userEmail) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await db.User.findOne({
        where: { email: userEmail },
      });
      if (user) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (e) {
      reject(e);
    }
  });
};
let resetUserPassword = async (userId, newPassword) => {
  try {
    let user = await db.User.findOne({ where: { userId } });
    if (!user) {
      return { errCode: 1, errMessage: "User not found" };
    }

    const hashPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashPassword;
    await user.save();

    return { errCode: 0, errMessage: "Password reset successful" };
  } catch (e) {
    throw e;
  }
};

let changeMyPassword = async (
  userId,
  oldPassword,
  newPassword,
  logoutAllDevices
) => {
  try {
    let user = await db.User.findOne({ where: { userId } });
    if (!user) {
      return { errCode: 1, errMessage: "User not found" };
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return { errCode: 2, errMessage: "Old password incorrect" };
    }

    const hashPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashPassword;

    if (logoutAllDevices) {
      user.tokenVersion = (user.tokenVersion || 0) + 1;
    }

    await user.save();

    return { errCode: 0, errMessage: "Password changed successfully" };
  } catch (e) {
    throw e;
  }
};

module.exports = {
  createNewUser: createNewUser,
  getAllUser: getAllUser,
  updateUserData: updateUserData,
  deleteUserByID: deleteUserByID,
  handleLogin: handleLogin,
  resetUserPassword: resetUserPassword,
  changeMyPassword: changeMyPassword,
};
