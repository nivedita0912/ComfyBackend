import { verifyToken } from "@/lib/tokenFunctions";
import { NextRequest, NextResponse } from "next/server";

interface DecodeToken {
    id: string;
    email: string;
    role: string;
    iat: number;
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url");
    const transform = searchParams.get("tr");

    if (!imageUrl || !transform) {
        return NextResponse.json(
            { success: false, message: "Missing url or tr param" },
            { status: 400 }
        );
    }

    const baseUrl = imageUrl.split("?")[0];
    const transformedUrl = `${baseUrl}?tr=${transform}`;

    const response = await fetch(transformedUrl);

    if (!response.ok) {
        return NextResponse.json(
            { success: false, message: `ImageKit error: ${response.status}` },
            { status: response.status }
        );
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/png";

    return new NextResponse(buffer, {
        headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000",
        },
    });
}