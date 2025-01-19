import {create} from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = "http://localhost:5001"

export const UserAuthStore = create((set,get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async() => {
        try {
            const response = await axiosInstance.get("/auth/check");
            set({authUser: response.data?.user});

            get().connectSocket();
        } catch (error) {
            console.log("Error in the CheckAuth Frontend\n", error);
            set({authUser: null});
        } finally{
            set({isCheckingAuth: false});
        }
    },

    signup: async (formData) => {
        set({isSigningUp: true});
        try {
            const response = await axiosInstance.post("/auth/signup",formData);
            set({authUser: response.data?.user});
            toast.success("User SignUp successfull");

            get().connectSocket();
        } catch (error) {
            console.log("Error in signUp Frontend store\n",error);
            toast.error(error.response.data.message);
        } finally{
            set({isSigningUp: false});
        }
    },

    logout : async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({authUser: null});
            toast.success("User Logged Out");

            get().disconnectSocket();
        } catch (error) {
            console.log("Error in Logout Frontend store\n",error);
            toast.error(error.response.data.message);
        }
    },
    
    login: async(formData) => {
        try {
            const response = await axiosInstance.post("/auth/login",formData);
            set({authUser: response.data?.data});
            toast.success(response.data.message);

            get().connectSocket();
        } catch (error) {
            console.log("Error in Login Frontend store\n",error);
            toast.error(error.response.data.message);
        }
    },
    
    updateProfile: async(data) => {
        set({isUpdatingProfile: true});
        try {
            const response = await axiosInstance.put("/auth/update-profile",data);
            set({authUser: response.data?.updateUser});
            toast.success(response.data.message);
        } catch (error) {
            console.log("Error in updateProfile Frontend store\n",error);
            toast.error(error.response.data.message);
        } finally{
            set({isUpdatingProfile: false});
        }
    },

    connectSocket: () => {
        const {authUser} = get();
        if(!authUser || get().socket?.connected) return ;

        const socket = io(BASE_URL,{
            query: {
                userId : authUser._id
            }
        });
        socket.connect();

        set({socket:socket})

        socket.on("getOnlineUsers",(userIds)=> {
            set({onlineUsers: userIds})
        });
    },

    disconnectSocket: () => {
        if(get().socket?.connected)  get().socket.disconnect();
    }
}))