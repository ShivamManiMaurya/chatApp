import { emailRegex, passwordRegex, validatePassword } from "../helpers.js";
import { generateToken } from "../lib/generateToken.js";
import User from "../models/auth.model.js";
import bcript from "bcryptjs";

export const signup = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    // check fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: name, email, and password are required",
      });
    }

    // valid email
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format.",
      });
    }
    const user = User.findOne({ email });
    if (!user) {
      return res.status(409).json({
        success: false,
        error: "Email already exist.",
      });
    }

    // valid password
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      return res.status(400).json({
        success: false,
        error: passwordCheck.errors,
      });
    }

    // valid username
    if (name.length < 3) {
      return res.status(400).json({
        success: false,
        error: "Name must be atleast 3 characters long.",
      });
    }

    // hash password
    const salt = await bcript.genSalt(10);
    const hashedPassword = await bcript.hash(password, salt);

    const newUser = new User({
      email,
      name,
      password: hashedPassword,
    });
    if (newUser) {
      const token = generateToken(newUser._id, res);

      await newUser.save();

      return res.status(201).json({
        success: true,
        msg: "Signup successfull.",
        token,
        user: {
          id: newUser._id,
          username: newUser.name,
          email: newUser.email,
          profilePic: newUser.profilePic,
          createdAt: newUser.createdAt,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        error: "Invalid user data.",
      });
    }
  } catch (error) {
    console.error("Registration error: ", error);
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// LOGIN ---------------------------------------
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: email and password are required",
      });
    }

    if (typeof password !== "string") {
      return res.status(409).json({
        success: false,
        error: "Password type must be string",
      });
    }

    // valid email
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "User not exist",
      });
    }

    const isMatch = await bcript.compare(password, user.password);
    if (!isMatch) {
      return res.status(409).json({
        success: false,
        error: "Password is incorrect.",
      });
    }

    if (user) {
      const token = generateToken(user._id, res);

      return res.status(201).json({
        success: true,
        msg: "Login successfull.",
        token,
        user: {
          id: user._id,
          username: user.name,
          email: user.email,
          profilePic: user.profilePic,
          createdAt: user.createdAt,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        error: "Invalid user data.",
      });
    }
  } catch (error) {
    console.error("Registration error: ", error);
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

// LOGOUT ------------------------------
export const logout = (req, res) => {
  // Clear the cookie
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0, // Expire immediately
  });

  return res.status(200).json({ message: "Logged out successfully" });
};
