import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface JWTPayload {
  id: string;
}

export interface CustomRequest extends Request {
  user: JWTPayload;
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new Error("Token not found");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is required");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    (req as CustomRequest).user = decoded;

    next();
  } catch (err) {
    res.status(401).send("Please authenticate");
  }
};
