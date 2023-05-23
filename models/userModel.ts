import { Schema, model } from "mongoose";
import { hashSync } from "bcrypt";

interface IUser {
  name: string;
  email: string;
  password: string;
  picture: string;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified) {
    next();
  }
  this.password = hashSync(this.password, 13);
});

export const User = model<IUser>("User", userSchema);
