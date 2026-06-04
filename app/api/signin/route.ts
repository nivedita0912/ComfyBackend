import mongoose from "mongoose";
import User from "@/model/user";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/connectToDB";
import bcrypt from "bcrypt";
import { generateToken } from "@/lib/tokenFunctions";

export async function POST(req: NextRequest) {
    const { username, email, password, role } = await req.json();

    try {
        if (!username || !email || !password) {

            return NextResponse.json(
                { success: false, message: "All values are required" },
                { status: 400 }
            )
        }
        await connectDB();
        const checkUser = await User.findOne({ email });
        if (checkUser) {
            return NextResponse.json(
                { success: false, message: "Already Exist with this email" },
                { status: 400 }
            )
        }
    

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username,
            email,
            role,
            password: hashedPassword
        })
        const token = generateToken({
            id: newUser._id.toString(),
            role:newUser.role
});

        const response = NextResponse.json(
            { success: true, newUser },
            { status: 200 },

        )
        response.cookies.set({
            name: "token",
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/"
        });
        return response;
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { success: false, message: "somthing is wrong with sever" },
            { status: 500 }
        )
    }
} 