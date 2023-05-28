import { Request, Response } from "express";
import { CustomRequest } from "../middlewares/requireAuth";
import { Message } from "../models/messageModel";
import { User } from "../models/userModel";
import { Chat } from "../models/chatModel";

export const sendMessage = async (req: Request, res: Response) => {
  const { content, chatId } = req.body;
  if (!content || !chatId) {
    console.log("Invalid data passsed into request");
    return res.sendStatus(400);
  }

  try {
    const newMessage = {
      sender: (req as CustomRequest).user.id,
      content: content,
      chat: chatId,
    };

    let message: any = await Message.create(newMessage);
    message = await message.populate("sender", "name picture");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name picture email",
    });

    // Updating latest message in ChatModel
    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });

    return res.status(200).json(message);
  } catch (error: any) {
    res.sendStatus(500);
    throw new Error(error.message);
  }
};

export const allMessages = async (req: Request, res: Response) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name picture email")
      .populate("chat");

    res.status(200).json(messages);
  } catch (error: any) {
    res.sendStatus(500);
    throw new Error(error.message);
  }
};
