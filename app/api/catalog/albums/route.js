import { NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";

export const POST = async (request) => {
  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ message: "Album not found" }, { status: 404 });
  }

  const { artist_id, title, release_date, cover_url, track_id } = body;

  if (!artist_id || !title || !release_date || !cover_url || !track_id) {
    return NextResponse.json({ message: "Album not found" }, { status: 404 });
  }

  const exitingAlbum = await db.select().from(albums).where(eq(albums.id, id));

  if (exitingAlbum.length > 0) {
    return NextResponse.json(
      { message: "Album already exists" },
      { status: 404 }
    );
  }

  await db.insert(albums).values({
    id,
    artist_id,
    title,
    release_date,
    cover_url,
    track_id,
    status: "pending",
    submitted_by: "",
    submitted_at: new Date(),
    published_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  });

  return NextResponse.json("Album created successfully", { status: 201 });
};
