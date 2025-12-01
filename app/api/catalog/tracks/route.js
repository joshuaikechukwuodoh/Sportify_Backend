import { NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";

export const POST = async (request) => {
  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ message: "Track not found" }, { status: 404 });
  }

  const {
    album_id,
    artist_id,
    title,
    duration_seconds,
    audio_url,
    track_number,
  } = body;

  if (
    !album_id ||
    !artist_id ||
    !title ||
    !duration_seconds ||
    !audio_url ||
    !track_number
  ) {
    return NextResponse.json({ message: "Track not found" }, { status: 404 });
  }

  await db.insert(tracks).values({
    id,
    album_id,
    artist_id,
    title,
    duration_seconds,
    audio_url,
    track_number,
    status: "pending",
    submitted_by: "",
    submitted_at: new Date(),
    published_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  });

  return NextResponse.json("Track created successfully", { status: 201 });
};
