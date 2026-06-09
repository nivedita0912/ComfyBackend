import { verifyToken } from "@/lib/tokenFunctions";
import { NextRequest, NextResponse } from "next/server";

interface DecodeToken {
    id: string;
    email: string;
    role: string;
    iat: number;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const token = request.cookies.get("token")?.value;
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

    const { id } = await params;

    const response = await fetch(
        `https://api.unsplash.com/photos/${id}/download`,
        {
            headers: {
                Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
            },
        }
    );

    if (!response.ok) {
        return NextResponse.json(
            { success: false, message: "Failed to trigger download" },
            { status: response.status }
        );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, url: data.url });
}