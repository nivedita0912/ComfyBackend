import { verifyToken } from "@/lib/tokenFunctions";
import { NextRequest, NextResponse } from "next/server";

interface DecodeToken {
    id: string;
    email: string;
    role: string;
    iat: number;
}
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
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

    const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&per_page=12`,
        {
            headers: {
                Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
            },
        }
    );

    const data = await response.json();
    return NextResponse.json(data);
}