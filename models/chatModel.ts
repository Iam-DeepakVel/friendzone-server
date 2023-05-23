import { Schema, Types, model } from "mongoose";

interface IChat {
  chatName: string;
  isGroupChat: boolean;
  users: Array<Types.ObjectId>;
  latestMessage: Types.ObjectId;
  groupAdmin: Types.ObjectId;
}

const chatSchema = new Schema<IChat>(
  {
    chatName: {
      type: String,
      trim: true,
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    latestMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    groupAdmin: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Chat = model<IChat>("Chat", chatSchema);
