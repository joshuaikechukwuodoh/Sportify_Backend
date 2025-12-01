import { NextResponse } from "next/server";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";


export const POST = async (request) => {
    try {
        const body = await request.json();
        const { song_id, user_id } = body;

        if (!song_id || !user_id) {
            return NextResponse.json({ message: "song_id and user_id required" }, { status: 400 });
        }

        // Check if song exists
        const [song] = await db.select().from(songs).where(eq(songs.id, song_id));
        if (!song) {
            return NextResponse.json({ message: "Song not found" }, { status: 404 });
        }

        // Check if user exists
        const [user] = await db.select().from(users).where(eq(users.id, user_id));
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Check if user already liked the song
        const existingLike = await db
            .select()
            .from(likes)
            .where(and(eq(likes.song_id, song_id), eq(likes.user_id, user_id)));

        if (existingLike.length > 0) {
            return NextResponse.json({ message: "Already liked" }, { status: 200 });
        }

        // Insert new like
        const [newLike] = await db
            .insert(likes)
            .values({
                song_id,
                user_id,
                created_at: new Date(),
            })
            .returning();

        return NextResponse.json(
            { message: "Song liked successfully", like: newLike },
            { status: 201 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
};

export const DELETE = async (request) => {
    try {
        const body = await request.json();
        const { song_id, user_id } = body;

        // Validate
        if (!song_id || !user_id) {
            return NextResponse.json({ message: "song_id and user_id required" }, { status: 400 });
        }

        // Delete the like
        await db.delete(likes).where(
            and(eq(likes.song_id, song_id), eq(likes.user_id, user_id))
        );

        return NextResponse.json({ message: "Song unliked successfully" }, { status: 200 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
};
