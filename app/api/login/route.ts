import User from "@/model/user";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/connectToDB";
import bcrypt from "bcrypt";
import { generateToken } from "@/lib/tokenFunctions";


export async function POST(req: NextRequest) {
    const { email, password, role } = await req.json();

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
                role: checkUser.role
            });
            const checkedUser = {
                username: checkUser.username,
                email: checkUser.email,
                id: checkUser._id,
                role:checkUser.role
            };

            const response =
                NextResponse.json(
                    {
                        success: true,
                        checkedUser,
                    },
                    {
                        status: 200,
                    }
                );

            response.cookies.set({
                name: "token",
                value: token,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 7,
                path: "/",
            });

            return response;
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