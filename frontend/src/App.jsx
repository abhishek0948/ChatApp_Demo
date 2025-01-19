import React, { useEffect } from "react";
import Navbar from "./components/NavBar";
import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import ProfilePage from "./pages/ProfilePage";
import SettingPage from "./pages/SettingPage";
import LoginPage from "./pages/LoginPage";
import { UserAuthStore } from "./store/userAuthStore.js";

import {Loader} from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "./store/useThemeStore.js";

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

  return (
    <div data-theme={theme}>
      <Navbar/>

      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login"/>} />
        <Route path="/signup" element={!authUser ?<SignUpPage /> : <Navigate to={"/"}/>} />
        <Route path="/login" element={!authUser ?<LoginPage /> : <Navigate to={"/"}/>} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to={'/login'}/>} />
        <Route path="/settings" element={<SettingPage />} />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
