import User from "@/model/user";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/connectToDB";
import { verifyToken } from "@/lib/tokenFunctions";
import bcrypt from "bcrypt";

interface DecodeToken {
    id: string;
    email: string;
    role: string;
    iat: number;
}

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        const targetId = req.nextUrl.searchParams.get("id");

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized request" },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token) as DecodeToken;
        if (!decoded) {
            return NextResponse.json(
                { success: false, message: "Forbidden request" },
                { status: 403 }
            );
        }

        await connectDB();

        if (decoded.role === "admin") {
          
            if (targetId) {
                // Admin — get any user by id
                const user = await User.findById(targetId).select("-password");
                if (!user) {
                    return NextResponse.json(
                        { success: false, message: "User not found" },
                        { status: 404 }
                    );
                }
                return NextResponse.json({ success: true, user }, { status: 200 });
            }

            // Admin — get all users
            const users = await User.find().select("-password");
            return NextResponse.json({ success: true, users }, { status: 200 });
        }
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }
        return NextResponse.json({ success: true, user }, { status: 200 });

    } catch (e) {
        return NextResponse.json(
            { success: false, message: "Something went wrong or token is invalid" },
            { status: 500 }
        );
    }
}
export async function POST(req: NextRequest) {
    try {
        const { username, email, password,role } = await req.json();

        if (!username || !email || !password) {
            return NextResponse.json(
                { success: false, message: "All fields are required" },
                { status: 400 }
            );
        }

        await connectDB();

        const existing = await User.findOne({ email });
        if (existing) {
            return NextResponse.json(
                { success: false, message: "Email already in use" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ username, email, role ,password: hashedPassword });

        return NextResponse.json(
            { success: true, user: { ...user.toObject(), password: undefined } },
            { status: 201 }
        );
    } catch (e) {
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized request" },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token) as DecodeToken;
        if (!decoded) {
            return NextResponse.json(
                { success: false, message: "Forbidden request" },
                { status: 403 }
            );
        }

        await connectDB();
        const targetId =
            decoded.role === "admin"
                ? req.nextUrl.searchParams.get("id") ?? decoded.id
                : decoded.id;

        const { username, email, password, imageUrl } = await req.json();

        const updateData: Record<string, unknown> = { updatedAt: Date.now() };
        if (username !== undefined) updateData.username = username;
        if (email !== undefined) updateData.email = email;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
        if (password !== undefined) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(
            targetId,
            updateData,
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });

    } catch (e) {
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
export async function DELETE(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized request" },
                { status: 401 }
            );
        }

        const decoded = verifyToken(token) as DecodeToken;
        if (!decoded) {
            return NextResponse.json(
                { success: false, message: "Forbidden request" },
                { status: 403 }
            );
        }

        if (decoded.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Only admins can delete users" },
                { status: 403 }
            );
        }

        await connectDB();

        const targetId = req.nextUrl.searchParams.get("id");
        if (!targetId) {
            return NextResponse.json(
                { success: false, message: "User id is required as ?id=xxx" },
                { status: 400 }
            );
        }

        const deletedUser = await User.findByIdAndDelete(targetId).select("-password");
        if (!deletedUser) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, deletedUser }, { status: 200 });

    } catch (e) {
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}