import Message from "../model/Messages.js";
import User from "../model/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

//get all user except logged in user



export const getUsersForSidebar = async (req, res) => {
    try {
        const userID = req.user._id;
        const filteredUsers = await User.find({_id : {$ne : userID}}).select("-password");

        //Count of unseen messages from each user
        const unseenMessages = {};
        const promises = filteredUsers.map(async (user) => {
            const messages = await Message.find({sender : user._id, receiver : userID, seen : false})
            if(messages.length > 0){
                unseenMessages[user._id] = messages.length;
            }

            await Promise.all(promises);
            res.json({success : true, users : filteredUsers, unseenMessages});
        })
    } catch (error) {
        console.log(error.message);
        res.json({success : false, users : filteredUsers, unseenMessages});
        
    }
}

//get all messages for selected user

export const getMessages = async (req, res) => {
    try {
        const {id:selectedUserID} = req.params;
        const myID = req.user._id;

        const messages = await Message.find({
            $or : [
                {sender : myID, receiver : selectedUserID},
                {sender : selectedUserID, receiver : myID},
            ]
        })

        await Message.updateMany({senderId : selectedUserID, receiverId : myID},{ seen : true});

        res.json({success : true, messages});

    } catch (error) {
        console.log(error.message);
        res.json({success : false, message : error.message});
    }
}

//api to mark messages as seen

export const markMessageAsSeen = async (req, res) => {
    try {
        const {id} = req.params;
        await Message.findByIdAndUpdate(id,{ seen : true});
        res.json({success : true});
    } catch (error) {
        console.log(error.message);
        res.json({success : false, message : error.message});
    }
}

//Send message to selected user

export const sendMessage = async (req, res) => {
    try {
        const {text,image} = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image : imageUrl,
        });

        //emit the message to receiver socket
        const receiverSocketId = userSocketMap[receiverId];
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.json({success : true, message : newMessage});

    } catch (error) {
        console.log(error.message);
        res.json({success : false, message : error.message});
    }
}