import mongoose from "mongoose";

export interface IUser {

   username: string;

   email: string;

   password: string;

   imageUrl?: string;

   plan: string;

   projectsUsed: number;

   exportsThisMonth: number;

   creditsRemaining: number;

   createdAt: number;

   lastActiveAt: number;

   isVerified: boolean;

   role: string;
}

const userSchema =
   new mongoose.Schema<IUser>({

      username: {
         type: String,
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

      imageUrl: {
         type: String,
         default: "",
      },

      plan: {
         type: String,
         enum: ["free", "pro"],
         default: "free",
      },

      projectsUsed: {
         type: Number,
         default: 0,
      },

      exportsThisMonth: {
         type: Number,
         default: 0,
      },

      creditsRemaining: {
         type: Number,
         default: 10,
      },

      isVerified: {
         type: Boolean,
         default: false,
      },

      role: {
         type: String,
         enum: ["user", "admin"],
         default: "user",
      },

      createdAt: {
         type: Number,
         default: Date.now,
      },

      lastActiveAt: {
         type: Number,
         default: Date.now,
      },

   });

const User =
   mongoose.models.User ||

   mongoose.model<IUser>(
      "User",
      userSchema
   );

export default User;