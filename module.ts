import "dotenv/config";
import "express-async-errors";
import express, { Application } from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import { userRoutes } from "./routes/userRoutes";
import { errorHandler, notFound } from "./middlewares/errorHandler";
import { chatRoutes } from "./routes/chatRoutes";

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
      this.app.listen(PORT, () =>
        console.log(`Server is listening on port ${PORT}...`)
      );
    } catch (error) {
      console.log(error);
    }
  }
}
