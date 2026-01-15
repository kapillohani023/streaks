import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UpdateStreakEntrySchema } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string; entryId: string }> };

// PUT /api/streaks/[id]/entries/[entryId] - Update an entry
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id, entryId } = await params;
        const body = await request.json();
        const result = UpdateStreakEntrySchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Validation failed", details: result.error.flatten() },
                { status: 400 }
            );
        }

        // Verify the entry belongs to the streak
        const existingEntry = await prisma.streakEntry.findFirst({
            where: { id: entryId, streakId: id },
        });

        if (!existingEntry) {
            return NextResponse.json(
                { error: "Entry not found" },
                { status: 404 }
            );
        }

        const entry = await prisma.streakEntry.update({
            where: { id: entryId },
            data: result.data,
        });

        return NextResponse.json(entry);
    } catch (error) {
        console.error("Failed to update entry:", error);
        return NextResponse.json(
            { error: "Failed to update entry" },
            { status: 500 }
        );
    }
}

// DELETE /api/streaks/[id]/entries/[entryId] - Delete an entry
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id, entryId } = await params;

        // Verify the entry belongs to the streak
        const existingEntry = await prisma.streakEntry.findFirst({
            where: { id: entryId, streakId: id },
        });

        if (!existingEntry) {
            return NextResponse.json(
                { error: "Entry not found" },
                { status: 404 }
            );
        }

        await prisma.streakEntry.delete({
            where: { id: entryId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete entry:", error);
        return NextResponse.json(
            { error: "Failed to delete entry" },
            { status: 500 }
        );
    }
}
