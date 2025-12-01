import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { tracks } from "@/db/schema";
import { eq } from "drizzle-orm";

export const POST = async (request) => {
  try {
    const user = await getUserFromRequest(request);
    if (!user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const { title, audio_url, album_id, artist_id } = body || {};

    if (!title || !audio_url)
      return NextResponse.json(
        { message: "title and audio_url required" },
        { status: 400 }
      );

    // Create track in "draft" state then mark submitted to be reviewed
    const [newTrack] = await db
      .insert(tracks)
      .values({
        album_id: album_id ?? null,
        artist_id: artist_id ?? null,
        title,
        audio_url,
        status: "pending",
        submitted_by: user.id,
        submitted_at: new Date(),
        created_at: new Date(),
      })
      .returning();

    return NextResponse.json({ ok: true, track: newTrack }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
};
