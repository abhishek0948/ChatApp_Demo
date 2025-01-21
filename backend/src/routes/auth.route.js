import express from "express";
import { checkAuth, googleLogin, login, logout, setPassword, signup, updateProfile } from "../controllers/auth.controller.js";
import { auth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post('/signup',signup)
router.post('/login',login)
router.post('/logout',logout)
router.put('/update-profile',auth,updateProfile)
router.get('/check',auth,checkAuth)
router.get('/google',googleLogin)
router.post('/set-password',setPassword)

export default router;