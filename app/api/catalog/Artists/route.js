import { NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";

export const GET = async () => {
  const Artists = await db.select().from(Artists);
  return NextResponse.json(Artists);
};

export const POST = async (request) => {
  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const { song_url } = body;

  if (song_url === null) {
    return NextResponse.json(
      { message: "You must have a song_url before you can be Artist" },
      { status: 404 }
    );
  }

  await db.insert(Artists).values({
    id,
    song_url,
    status: "pending",
    submitted_by: "",
    submitted_at: new Date(),
    published_at: null,
    created_at: new Date(),
    updated_at: new Date(),
  });

  return NextResponse.json("Artist created successfully", { status: 201 });
};

export const PUT = async (request) => {
  const body = await request.json();
  const { Artist_id } = body;

  if (!Artist_id) {
    return NextResponse.json({ message: "Artist not found" }, { status: 404 });
  }
  await db
    .update(Artists)
    .set({
      ...body,
    })
    .where(eq(Artists.id, Artist_id));

  return NextResponse.json("Artist updated successfully", { status: 201 });
};

export const DELETE = async (request) => {
  const body = await request.json();
  const { Artist_id } = body;

  if (!Artist_id) {
    return NextResponse.json({ message: "Artist not found" }, { status: 404 });
  }
  await db.delete(Artists).where(eq(Artists.id, Artist_id));
  return NextResponse.json("Artist deleted successfully", { status: 201 });
};
