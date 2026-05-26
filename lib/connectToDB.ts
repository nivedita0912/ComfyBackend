import mongoose from "mongoose";
import { Noto_Sans_Tamil_Supplement } from "next/font/google";

const MONGO_URI = process.env.MONGODB_URI as string;

if (!MONGO_URI) {
    throw new Error("Please define the MONGO URI in .env file");
}


interface MongoCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
};
declare global {
    var mongoCache:
        | MongoCache
        | undefined;
};

const cached = global.mongoCache || {
    conn: null,
    promise: null
};

export async function connectDB() {
    if(cached.conn){
        return cached.conn;
    }
    if(!cached.promise){
        cached.promise  = mongoose.connect(MONGO_URI,{
            dbName:"comfy",
        });
    }
try{
    cached.conn = await cached.promise;
     console.log("Mongo DB is connected...");

     return cached.conn;
}catch(error){
    cached.promise = null;
  console.log("monog db is not connected ..")
   throw  error;
}
}
