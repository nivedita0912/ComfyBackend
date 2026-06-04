import mongoose from "mongoose";

export interface IProjects {
   title: string,
   userId: string,
   originalImageUrl: string,
   currentImageUrl: string,
   thumbnailUrl: string,
   width: number,
   height: number,
   canvaState: number,
   activeTransformations: string[];
   backgroundRemoved: boolean;
   createdAt: Date;
   updatedAt: Date;
}
const projectSchema =
   new mongoose.Schema({

      title: {
         type: String,
         required: true,
      },

      userId: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
         required: true,
      },
      originalImageUrl: {
         type: String,
      },
      currentImageUrl: {
         type: String,
      },
      thumbnailUrl: {
         type: String,
      },
      width: {
         type: Number,
      },
      height: {
         type: Number,
      },
      canvasState: {
         type: Object,
      },
      activeTransformations: [
         {
            type: String,
         },
      ],
      backgroundRemoved: {
         type: Boolean,
         default: false,
      },
   },
      {
         timestamps: true,
      }
   );

export default mongoose.models.Project || mongoose.model(
   "Project",
   projectSchema
);