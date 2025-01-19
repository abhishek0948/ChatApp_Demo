import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select("-password");
    res.status(200).json({
        users
    });
  } catch (error) {
    console.log("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: error.message });
}
};

export const getMessages = async(req,res) => {
    try {
        const {id:userToChatId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or:[
                {senderId:myId,receiverId:userToChatId},
                {senderId:userToChatId,receiverId:myId}
            ]
        })

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessage Controller: ", error.message);
        res.status(500).json({ error: error.message });
    }
}

export const sendMessage = async(req,res) => {
    try {
        const {id:receiverId} = req.params;
        const {text,image} = req.body;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            // const uploadResponse = await cloudinary.uploader.upload(image, {
            //     upload_preset: 'chat_app',
            // });
            imageUrl = uploadResponse.secure_url;
        }
        
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl
        })

        await newMessage.save();

        // Real time functionality to be added here => socket.io
        // If user is online send real time message
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage",newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage Controller: ", error.message);
        res.status(500).json({ error: error.message });
    }
}
