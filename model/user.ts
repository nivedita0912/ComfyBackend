import mongoose from "mongoose";
export interface IUser {
   username: string;
   email: string;
   password: string;
   imageUrl?: string;
   projects: mongoose.Types.ObjectId[];
   createdAt: number;
   updatedAt: number;
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
      projects: [
         {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Projects"
         }
      ],
      createdAt: {
         type: Number,
         default: Date.now,
      },
      updatedAt: {
         type: Number,
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