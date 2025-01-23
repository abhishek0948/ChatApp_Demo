import React, { useEffect } from "react";
import Navbar from "./components/Navbar";
import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import ProfilePage from "./pages/ProfilePage";
import SettingPage from "./pages/SettingPage";
import LoginPage from "./pages/LoginPage";
import SetPassword from "./pages/SetPassword.jsx";
import { UserAuthStore } from "./store/userAuthStore.js";

import {Loader} from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "./store/useThemeStore.js";
import {GoogleOAuthProvider} from "@react-oauth/google";

const App = () => {
  const {authUser,checkAuth,isCheckingAuth,onlineUsers} = UserAuthStore();
  const {theme} = useThemeStore();

  useEffect(() => {
    checkAuth();
  },[checkAuth]);

  if(isCheckingAuth && !authUser){
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin"/>
      </div>
    )
  }

  const GoogleAuthWrapper = () => {
    return (
      <GoogleOAuthProvider clientId="624099658885-dm8ed3pat6o2fq7qcl8hu69v41it1ui5.apps.googleusercontent.com">
        <LoginPage></LoginPage>
      </GoogleOAuthProvider>
    )
  }

  // console.log(authUser);  
  return (
    <div data-theme={theme}>
      <Navbar/>

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login"/>} />
        <Route path="/signup" element={!authUser ?<SignUpPage /> : <Navigate to={"/"}/>} />
        <Route path="/login" element={!authUser ?<GoogleAuthWrapper /> : <Navigate to={"/"}/>} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to={'/login'}/>} />
        <Route path="/settings" element={<SettingPage />} />
        <Route path="/setpassword" element={!authUser ? <SetPassword/> : <Navigate to={"/"} />} />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
