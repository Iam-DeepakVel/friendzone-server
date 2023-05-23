import { Schema, Types, model } from "mongoose";

interface IMessage {
  sender: Types.ObjectId;
  content: string;
  chat: Types.ObjectId;
}

const messageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      trim: true,
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
    },
  },
  { timestamps: true }
);

export const Message = model<IMessage>("Message", messageSchema);
