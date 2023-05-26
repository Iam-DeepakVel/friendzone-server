import { Request, Response } from "express";
import { Chat } from "../models/chatModel";
import { CustomRequest } from "../middlewares/requireAuth";
import { User } from "../models/userModel";

export const accessChat = async (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) {
    console.log("UserId is not sent with request");
    return res.sendStatus(400);
  }

  let isChat: any = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: (req as CustomRequest).user.id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name picture email",
  });

  // Checks whether chat already exists
  if (isChat.length > 0) {
    // return the chat if it already exists
    return res.send(isChat[0]);
  } else {
    // create one if chat doesn't exists already
    try {
      const chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [(req as CustomRequest).user.id, userId],
      };
      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      return res.status(200).json(fullChat);
    } catch (error: any) {
      res.sendStatus(400);
      throw new Error(error.message);
    }
  }
};

export const fetchChats = async (req: Request, res: Response) => {
  try {
    // Finding the chats in which the loggedInUser is a part of that chats
    let chats: any = await Chat.find({
      users: { $elemMatch: { $eq: (req as CustomRequest).user.id } },
    })
      .populate("users", "-password")
      .populate("latestMessage")
      .populate("groupAdmin", "-password")
      .sort({ updatedAt: -1 });

    chats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "name email picture ",
    });

    res.status(200).json(chats);
  } catch (error: any) {
    res.sendStatus(400);
    throw new Error(error.message);
  }
};

export const createGroupChat = async (req: Request, res: Response) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please fill all the fields" });
  }

  //   Converting stringified array to js array
  const users: any = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  // Along with (users)group members comming from req.body, we pushing loggedInUser's id since he/she is creating the group
  users.push((req as CustomRequest).user.id);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      isGroupChat: true,
      users,
      groupAdmin: (req as CustomRequest).user.id,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error: any) {
    res.sendStatus(400);
    throw new Error(error.message);
  }
};

export const renameGroup = async (req: Request, res: Response) => {
  const { chatId, chatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { chatName },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.sendStatus(404);
    throw new Error("Chat Not Found");
  } else {
    res.status(200).json(updatedChat);
  }
};

export const addToGroup = async (req: Request, res: Response) => {
  const { chatId, userId } = req.body;

  // Pushing new user to users array
  const updatedChatWithUserAdded = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChatWithUserAdded) {
    res.sendStatus(404);
    throw new Error("Chat Not Found");
  } else {
    res.status(200).json(updatedChatWithUserAdded);
  }
};

export const removeFromGroup = async (req: Request, res: Response) => {
  const { chatId, userId } = req.body;

  // Pushing new user to users array
  const updatedChatWithUserRemoved = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChatWithUserRemoved) {
    res.sendStatus(404);
    throw new Error("Chat Not Found");
  } else {
    res.status(200).json(updatedChatWithUserRemoved);
  }
};
