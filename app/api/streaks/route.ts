import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CreateStreakSchema } from "@/lib/validation";

// GET /api/streaks - List all streaks with entries
export async function GET() {
    try {
        const streaks = await prisma.streak.findMany({
            include: {
                entries: {
                    orderBy: { date: "desc" },
                },
            },
            orderBy: { startDate: "desc" },
        });

        return NextResponse.json(streaks);
    } catch (error) {
        console.error("Failed to fetch streaks:", error);
        return NextResponse.json(
            { error: "Failed to fetch streaks" },
            { status: 500 }
        );
    }
}

// POST /api/streaks - Create a new streak
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const result = CreateStreakSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Validation failed", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { name, description, startDate } = result.data;

        const streak = await prisma.streak.create({
            data: {
                name,
                description,
                startDate: startDate ?? new Date(),
            },
            include: {
                entries: true,
            },
        });

        return NextResponse.json(streak, { status: 201 });
    } catch (error) {
        console.error("Failed to create streak:", error);
        return NextResponse.json(
            { error: "Failed to create streak" },
            { status: 500 }
        );
    }
}
