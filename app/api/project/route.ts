import User from "@/model/user";
import projects from "@/model/projects";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/connectToDB";
import jwt from "jsonwebtoken";
import ImageKit from "imagekit";

interface DecodedToken {
    id: string;
    role: string;
}

interface ImageKitConfig {
    publicKey: string;
    privateKey: string;
    urlEndpoint: string;
}

const imageKitConfig: ImageKitConfig = {
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
};

const imagekit = new ImageKit(imageKitConfig);

const jwtkey = process.env.JWT_SECRET;

function getDecodedToken(req: NextRequest): DecodedToken {
    const token = req.cookies.get("token")?.value;
    if (!token) throw new Error("NO_TOKEN");
    return jwt.verify(token, jwtkey!) as DecodedToken;
}
function handleError(err: unknown, label: string) {
    if (err instanceof Error && err.message === "NO_TOKEN") {
        return NextResponse.json(
            { success: false, message: "Unauthorized user" },
            { status: 401 }
        );
    }
    if (err instanceof jwt.JsonWebTokenError) {
        return NextResponse.json(
            { success: false, message: "Unauthorized user" },
            { status: 401 }
        );
    }
    console.error(`[${label}]`, err);
    return NextResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 }
    );
}

export async function POST(req: NextRequest) {
    try {
        const decodedToken = getDecodedToken(req);
        await connectDB();
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        const title = formData.get("title") as string | null;
        if (!file) {
            return NextResponse.json(
                { success: false, message: "file is required" },
                { status: 400 }
            );
        }
        if (!title?.trim()) {
            return NextResponse.json(
                { success: false, message: "title is required" },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const timeStamps = Date.now();
        const sanitizedFileName =
            title.replace(/[^a-zA-Z0-9.-]/g, "_") || "upload";
        const uniqueFileName = `${decodedToken.id}/${timeStamps}_${sanitizedFileName}`;

        const uploadResponse = await imagekit.upload({
            file: buffer,
            fileName: uniqueFileName,
            folder: "/comfy",
        });

        const thumbnailUrl = imagekit.url({
            src: uploadResponse.url,
            transformation: [
                {
                    width: "400",
                    height: "300",
                    cropMode: "maintain_ar",
                    quality: "80",
                },
            ],
        });

        const projectInDB = await projects.create({
            title: title.trim(),         
            userId: decodedToken.id,
            originalImageUrl: uploadResponse.url,
            currentImageUrl: uploadResponse.url,
            thumbnailUrl,
            width: uploadResponse.width,
            height: uploadResponse.height,
            fileId: uploadResponse.fileId,
            canvasState: null,
        });

        await User.findByIdAndUpdate(
            decodedToken.id,
            { $push: { projects: projectInDB._id } }, 
            { new: true }
        );

        return NextResponse.json(
            { success: true, projectInDB },
            { status: 201 }
        );
    } catch (err) {
        return handleError(err, "POST /projects");
    }
}

export async function GET(req: NextRequest) {
    try {
        const decodedToken = getDecodedToken(req);
        await connectDB();

        const projectId = req.nextUrl.searchParams.get("projectId");

        if (decodedToken.role === "admin") {
            if (projectId) {
                const project = await projects.findById(projectId);
                if (!project) {
                    return NextResponse.json(
                        { success: false, message: "Project not found" },
                        { status: 404 }
                    );
                }
                return NextResponse.json(
                    { success: true, project },
                    { status: 200 }
                );
            }

            const allProjects = await projects.find();
            return NextResponse.json(
                { success: true, projects: allProjects },
                { status: 200 }
            );
        }

        if (projectId) {
            const project = await projects.findOne({
                _id: projectId,
                userId: decodedToken.id,
            });
            if (!project) {
                return NextResponse.json(
                    { success: false, message: "Project not found" },
                    { status: 404 }
                );
            }
            return NextResponse.json(
                { success: true, project },
                { status: 200 }
            );
        }

        const userProjects = await projects.find({ userId: decodedToken.id });

        return NextResponse.json(
            { success: true, projects: userProjects },
            { status: 200 }
        );

    } catch (err) {
        return handleError(err, "GET /projects");
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const decodedToken = getDecodedToken(req);
        const { projectId } = await req.json();

        if (!projectId) {
            return NextResponse.json(
                { success: false, message: "projectId is required" },
                { status: 400 }
            );
        }

        await connectDB();

        const findProject = await projects.findById(projectId);
        if (!findProject) {
            return NextResponse.json(
                { success: false, message: "Project not found" },
                { status: 404 }
            );
        }
        if (
            decodedToken.role !== "admin" &&
            findProject.userId.toString() !== decodedToken.id
        ) {
            return NextResponse.json(
                { success: false, message: "Unauthorized to delete" },
                { status: 403 }
            );
        }

        const deletedProject = await projects.findOneAndDelete({ _id: projectId });

        await User.findByIdAndUpdate(
            findProject.userId,
            { $pull: { projects: projectId } }
        );

        return NextResponse.json(
            { success: true, deletedProject },
            { status: 200 }
        );
    } catch (err) {
        return handleError(err, "DELETE /projects");
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const decodedToken = getDecodedToken(req);

        const {
            projectId,
            title,
            currentImageUrl,
            thumbnailUrl,
            width,
            height,
            canvasState,
            backgroundRemoved,
            activeTransformations
        } = await req.json();

        if (!projectId) {
            return NextResponse.json(
                { success: false, message: "projectId is required" },
                { status: 400 }
            );
        }
        await connectDB();

        const findProject = await projects.findById(projectId);
        if (!findProject) {
            return NextResponse.json(
                { success: false, message: "Project not found" },
                { status: 404 }
            );
        }
        if (
            decodedToken.role !== "admin" &&
            findProject.userId.toString() !== decodedToken.id
        ) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 403 }
            );
        }

        const updateData: Record<string, unknown> = {};
        if (title !== undefined) updateData.title = title;
        if (activeTransformations !== undefined) updateData.activeTransformations = activeTransformations;
        if (currentImageUrl !== undefined) updateData.currentImageUrl = currentImageUrl;
        if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl;
        if (width !== undefined) updateData.width = width;
        if (height !== undefined) updateData.height = height;
        if (canvasState !== undefined) updateData.canvasState = canvasState;

        if (backgroundRemoved !== undefined) updateData.backgroundRemoved = backgroundRemoved;
        const updatedProject = await projects.findByIdAndUpdate(
            projectId,
            updateData,
            { new: true }   
        );

        return NextResponse.json(
            { success: true, updatedProject },
            { status: 200 }
        );
    } catch (err) {
        return handleError(err, "PATCH /projects");
    }
}