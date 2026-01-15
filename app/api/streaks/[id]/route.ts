import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UpdateStreakSchema } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/streaks/[id] - Get a single streak with entries
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const streak = await prisma.streak.findUnique({
            where: { id },
            include: {
                entries: {
                    orderBy: { date: "desc" },
                },
            },
        });

        if (!streak) {
            return NextResponse.json(
                { error: "Streak not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(streak);
    } catch (error) {
        console.error("Failed to fetch streak:", error);
        return NextResponse.json(
            { error: "Failed to fetch streak" },
            { status: 500 }
        );
    }
}

// PUT /api/streaks/[id] - Update a streak
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const result = UpdateStreakSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Validation failed", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const streak = await prisma.streak.update({
            where: { id },
            data: result.data,
            include: {
                entries: true,
            },
        });

        return NextResponse.json(streak);
    } catch (error) {
        console.error("Failed to update streak:", error);
        return NextResponse.json(
            { error: "Failed to update streak" },
            { status: 500 }
        );
    }
}

// DELETE /api/streaks/[id] - Delete a streak
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        await prisma.streak.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete streak:", error);
        return NextResponse.json(
            { error: "Failed to delete streak" },
            { status: 500 }
        );
    }
}
