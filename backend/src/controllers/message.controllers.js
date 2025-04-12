import Message from "../models/message.models.js";
import User from "../models/user.models.js";
import couldinary from "../lib/cloudinary.js";
import { io, getReceiverSocketId} from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    // console.log(loggedInUserId);
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("error in getUsersForSidebar controller", error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: senderId, recieverId: userToChatId },
        { senderId: userToChatId, recieverId: senderId },
      ],
    });
    res.status(200).json(messages);
  } catch (error) {
    console.log("error in getMessages controller", error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id: recieverId } = req.params;
    const senderId = req.user._id;
    const { text, image } = req.body;

    let imageUrl;
    if(image){
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
    }

    const message = new Message({
      senderId,
      recieverId,
      text,
      image: imageUrl,
    });
    await message.save();

    const recieverSocketId = getReceiverSocketId(recieverId);
    if (recieverSocketId) {
      io.to(recieverSocketId).emit("message", message);
    }

    res.status(200).json(message);
  } catch (error) {
    console.log("error in sendMessage controller", error);
    res.status(500).json({ message: "internal server error" });
  }
};
