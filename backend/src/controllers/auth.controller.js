import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  try {
    const { fullName, password, email } = req?.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Please fill all the fields",
        success: false,
        error: true,
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password should be atleast 6 characters",
        error: true,
        success: false,
      });
    }

    const user = await User.findOne({ email });

    if (user)
      return res
        .status(200)
        .json({ message: "User already Exists", error: true, success: false });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName: fullName,
      email: email,
      password: hashedPassword,
    });

    if (newUser) {
      generateToken(newUser._id, res);
      await newUser.save();
      return res.status(200).json({
        message: "User Signup Successfull",
        success: true,
        error: false,
        user: {
          _id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          profilePic: newUser.profilePic,
        }
      });
    } else {
      return res
        .status(400)
        .json({ message: "Invalid User data", success: false, error: true });
    }
  } catch (error) {
    console.log("Error in SingUp controller\n", error);
    res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true,
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req?.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(user._id, res);

    res.status(200).json({
      message: "User Login Successfull",
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
      }
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({
      message: "User Logout Successfull",
      success: true,
      error: false,
    });
  } catch (error) {
    console.log("Error in Logout controller\n", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user?._id;

    if (!profilePic) {
      return res.status(400).json({
        message: "Please provide a profile picture",
        success: false,
        error: true,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updateUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    if (updateUser) {
      return res.status(200).json({
        message: "Profile Picture updated successfully",
        success: true,
        error: false,
        updateUser: updateUser,
      });
    }
  } catch (error) {
    console.log("Error in UpdateProfile controller\n", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true,
    });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
        success: false,
        error: true,
      });
    }
    return res.status(200).json({
      message: "User authenticated",
      success: true,
      error: false,
      user: user,
    });
  } catch (error) {
    console.log("Error in CheckAuth controller\n", error);
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: true,
    });
  }
};
