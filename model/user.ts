import mongoose from "mongoose";
export interface IUser {
   username: string;
   email: string;
   password: string;
   imageUrl?: string;
   projects: mongoose.Types.ObjectId[];
   createdAt: Date;
   updatedAt: Date;
   role: string
}

const userSchema =
   new mongoose.Schema<IUser>({
      username: {
         type: String,
         required: true,
      },
      role: {
         enum: ["user", "admin"],
         type: String,
         default: "user",
         required: true
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
      projects: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Projects"
         }
      ],
      createdAt: {
         type: Date,
         default: Date.now,
      },
      updatedAt: {
         type: Date,
         default: Date.now
      }
   });

const User =
   mongoose.models.User ||

   mongoose.model<IUser>(
      "User",
      userSchema
   );

export default User; 