import {create} from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { UserAuthStore } from "./userAuthStore.js";

export const useChatStore = create((set,get) => ({
    users: [],
    messages: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    isInVideoCall: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const response = await axiosInstance.get("/messages/users");
            set({ users: response.data?.users})
        } catch (error) {
            toast.error(error.response?.data?.error || "Something went wrong");
        } finally {
            set({ isUsersLoading: false });
        }
    },
    
    getMessages: async(userId) => {
        set({ isMessagesLoading: true });
        try {
            const response = await axiosInstance.get(`/messages/${userId}`);
            // console.log(response.data);
            set({ messages: response.data });
        } catch (error) {
            toast.error(error.response?.data?.error || "Something went wrong");  
        } finally {
            set({ isMessagesLoading: false });
        }
    },
    
    sendMessage: async (messageData) => {
        const { messages, selectedUser } = get();
 
        if (!selectedUser || !selectedUser._id) {
            toast.error("No user selected. Please select a user.");
            return;
        }

        const updatedMessages = Array.isArray(messages) ? messages : [];
    
        try {
            const response = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages: [...updatedMessages, response.data] });

        } catch (error) {
            toast.error(error.response?.data?.error || "Error in sending message");
        }
    },

    subscribeToMessages: () => {
        const {selectedUser} = get();
        if(!selectedUser) return ;

        const socket = UserAuthStore.getState().socket;

        socket.on('newMessage',(newMessage) => {
            if(newMessage.senderId !== selectedUser._id) return;
            set({messages: [...get().messages,newMessage]})
        })
    },

    unsubscribeFromMessages : () => {
        const socket = UserAuthStore.getState().socket;
        socket.off("newMessage");
    },

    setSelectedUser: (user) => {set({ selectedUser: user })},

    setVideoCallStatus: (status) => {
        set({ isInVideoCall: status });
    },
}))