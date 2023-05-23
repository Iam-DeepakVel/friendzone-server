import { Request, Response } from "express";
import { User } from "../models/userModel";
import { generateToken } from "../config/generateToken";
import { compareSync } from "bcrypt";

export const register = async (req: Request, res: Response) => {
  const { name, email, password, picture } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please enter all the fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    picture,
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    picture: user.picture,
    access_token: generateToken(user._id),
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  console.log(email, password);

  if (!email || !password) {
    res.status(400);
    throw new Error("Please enter all the fields");
  }

  const user = await User.findOne({ email });

  if (user && compareSync(password, user.password)) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      access_token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Credentials");
  }
};
