import User from "@/model/user";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/connectToDB";
import bcrypt from "bcrypt";
import { generateToken } from "@/lib/tokenFuncions";

export async function POST(req: NextRequest) {
    const { email, password } = await req.json();

    try {
        if (!email || !password) {

            return NextResponse.json(
                { success: false, message: "All values are required" },
                { status: 400 }
            )
        }
        await connectDB();
        const checkUser = await User.findOne({ email });
        if (!checkUser) {
            return NextResponse.json(
                { success: false, message: "No user found try with other credentials" },
                { status: 404 }
            )
        }
        const hashedPassword = await bcrypt.compare(password, checkUser.password);
        if (hashedPassword) {
            const token = generateToken({
                id: checkUser._id.toString(),
                email
            });
            const checkedUser = {
                username: checkUser.username,
                email: checkUser.email,
                id: checkUser._id
            };
            return NextResponse.json(
                { success: true, checkedUser, "Token": token },
                { status: 200 },
            )
        }
        else {
            return NextResponse.json(
                { success: false, message: "Password don't match" },
                { status: 400 },
            )
        }

    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { success: false, message: "somthing is wrong with sever" },
            { status: 500 }
        )
    }
} 