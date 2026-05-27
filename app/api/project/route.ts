import { connectDB } from "@/lib/connectToDB";
import { verifyToken } from "@/lib/tokenFunctions";
import projects from "@/model/projects";
import jwt from "jsonwebtoken";

import { NextRequest, NextResponse } from "next/server";

interface DecodedToken {
    id: string;
    email: string;
}
const jwtkey = process.env.JWT_SECRET;

export async function GET(req: NextRequest, { params }: { params: { projectId: string; } }) {
    try {
        const projectId = params.projectId;
        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized user", },
                { status: 401, }
            );
        }
        const isVerified = verifyToken(token);
        if (!isVerified) {
            return NextResponse.json(
                { success: false, message: "Unauthorized user" },
                { status: 401, }
            );
        }
        await connectDB();
        const decodedToken = jwt.verify(token, jwtkey!) as DecodedToken;
        const projectById = await projects.findById(projectId);
        if (projectById) {
            return NextResponse.json(
                { success: true, projectById },
                { status: 200, }
            );
        }
        const project = await projects.find({ userId: decodedToken.id });
        return NextResponse.json(
            { success: true, project },
            { status: 200, }
        );
    } catch (err) {
        console.log(err);
        return NextResponse.json(
            { success: false, message: "Internal server error", },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { projectId } = await req.json();
        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized user", },
                { status: 401, }
            );
        }
        const isVerified = verifyToken(token);
        if (!isVerified) {
            return NextResponse.json(
                { success: false, message: "Unauthorized user", },
                { status: 401, }
            );
        }
        await connectDB();
        const decodedToken = jwt.verify(token, jwtkey!) as DecodedToken;
        const findProject = await projects.findById(projectId);
        if (!findProject) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Project not found",
                },
                { status: 404, }
            );
        }
        if (findProject.userId.toString() !== decodedToken.id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unauthorized to delete",
                },
                { status: 401, }
            );
        }
        const deleteProject =
            await projects.findOneAndDelete({ _id: projectId });
        return NextResponse.json(
            { success: true, deleteProject, },
            { status: 200 }
        );
    } catch (err) {
        console.log(err);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {

    try {
        const { title, originalImagUrl, CurrentImagUrl, thumbnail, width, height, canvasState } = await req.json();
        const token = req.cookies.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized user" },
                { status: 401 }
            );
        }
        const decoded = verifyToken(token) as DecodedToken;
        await connectDB();
        const project = await projects.create({
            title,
            userId: decoded.id,
            originalImagUrl,
            CurrentImagUrl,
            thumbnail,
            width,
            height,
            canvasState,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
        return NextResponse.json(
            { success: true, project },
            { status: 201 }
        );
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: NextRequest
) {

    try {

        const {

            projectId,

            title,

            originalImagUrl,

            CurrentImagUrl,

            thumbnail,

            width,

            height,

            canvasState,

        } = await req.json();

        // TOKEN

        const token =
            req.cookies
                .get("token")
                ?.value;

        if (!token) {

            return NextResponse.json(

                {
                    success: false,

                    message:
                        "Unauthorized user",
                },

                {
                    status: 401,
                }
            );
        }

        // VERIFY TOKEN

        const decoded =
            verifyToken(token) as DecodedToken;
        await connectDB();
        const findProject = await projects.findById(projectId);

        if (!findProject) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Project not found",
                },
                {
                    status: 404,
                }
            );
        }
        if (findProject.userId.toString() !== decoded.id) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }
        const updateData: Record<string, unknown> = {
            updatedAt:
                Date.now(),
        };
        if (title !== undefined) {
            updateData.title =
                title;
        }
        if (originalImagUrl !== undefined) {
            updateData.originalImagUrl = originalImagUrl;
        }
        if (CurrentImagUrl !== undefined) {
            updateData.CurrentImagUrl = CurrentImagUrl;
        }
        if (thumbnail !== undefined) {
            updateData.thumbnail = thumbnail;
        }
        if (width !== undefined) {
            updateData.width = width;
        }
        if (height !== undefined) {
            updateData.height = height;
        }
        if (canvasState !== undefined) {
            updateData.canvasState = canvasState;
        }
        const updatedProject = await projects.findByIdAndUpdate(
            projectId,
            updateData,
            {
                new: true,
            }
        );
        return NextResponse.json(
            {
                success: true,
                updatedProject,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message:
                    "Internal server error",
            },
            {
                status: 500,
            }
        );
    }
}