import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CreateStreakEntrySchema } from "@/lib/validation";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/streaks/[id]/entries - List entries for a streak
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        // Verify streak exists
        const streak = await prisma.streak.findUnique({
            where: { id },
        });

        if (!streak) {
            return NextResponse.json(
                { error: "Streak not found" },
                { status: 404 }
            );
        }

        const entries = await prisma.streakEntry.findMany({
            where: { streakId: id },
            orderBy: { date: "desc" },
        });

        return NextResponse.json(entries);
    } catch (error) {
        console.error("Failed to fetch entries:", error);
        return NextResponse.json(
            { error: "Failed to fetch entries" },
            { status: 500 }
        );
    }
}

// POST /api/streaks/[id]/entries - Create a new entry
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const result = CreateStreakEntrySchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Validation failed", details: result.error.flatten() },
                { status: 400 }
            );
        }

        // Verify streak exists
        const streak = await prisma.streak.findUnique({
            where: { id },
        });

        if (!streak) {
            return NextResponse.json(
                { error: "Streak not found" },
                { status: 404 }
            );
        }

        const { date, completed, note } = result.data;

        const entry = await prisma.streakEntry.create({
            data: {
                streakId: id,
                date,
                completed,
                note,
            },
        });

        return NextResponse.json(entry, { status: 201 });
    } catch (error) {
        console.error("Failed to create entry:", error);
        return NextResponse.json(
            { error: "Failed to create entry" },
            { status: 500 }
        );
    }
}
