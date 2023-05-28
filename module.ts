import "dotenv/config";
import "express-async-errors";
import express, { Application } from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import { userRoutes } from "./routes/userRoutes";
import { errorHandler, notFound } from "./middlewares/errorHandler";
import { chatRoutes } from "./routes/chatRoutes";
import { messageRoutes } from "./routes/messageRoutes";

export class AppModule {
  constructor(public app: Application) {
    app.use(
      cors({
        origin: "*",
      })
    );
    app.use(express.json());

    app.use("/api/v1/user", userRoutes);
    app.use("/api/v1/chat", chatRoutes);
    app.use("/api/v1/message", messageRoutes);

    app.use(notFound);
    app.use(errorHandler);
  }

  async start() {
    const PORT = process.env.PORT || 5000;
    try {
      if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is required");
      }
      await connectDB(process.env.MONGO_URI);
      const server = this.app.listen(PORT, () =>
        console.log(`Server is listening on port ${PORT}...`)
      );
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const io = require("socket.io")(server, {
        pingTimeOut: 60000,
        cors: {
          origin: "*",
        },
      });
      io.on("connection", (socket: any) => {
        console.log("conntected to socket.io");
        socket.on("setup", (userData: any) => {
          socket.join(userData._id);
          socket.emit("connected");
        });

        socket.on("join chat", (room: any) => {
          socket.join(room);
          console.log("User Joined Room: " + room);
        });

        socket.on("typing", (room: any) => socket.in(room).emit("typing"));
        socket.on("stop typing", (room: any) =>
          socket.in(room).emit("stop typing")
        );

        socket.on("new message", (newMessageReceived: any) => {
          const chat: any = newMessageReceived.chat;
          if (!chat.users) {
            return console.log("Chat.users not defined");
          }
          chat.users.forEach((user: any) => {
            if (user._id == newMessageReceived.sender._id) return;
            socket.in(user._id).emit("message received", newMessageReceived);
          });

          socket.off("setup", (userData: any) => {
            console.log("User Disconnected");
            socket.leave(userData._id);
          });
        });
      });
    } catch (error) {
      console.log(error);
    }
  }
}
