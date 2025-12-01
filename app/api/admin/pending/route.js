import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { tracks, albums, artists } from "@/db/schema";

export const GET = async (request) => {
  const admin = await requireAdmin(request);
  if (!admin)
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });

  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "all"; // track|album|artist|all

  try {
    const result = {};

    if (type === "track" || type === "all") {
      result.tracks = await db
        .select()
        .from(tracks)
        .where(tracks.status.eq("pending"));
      return NextResponse.json({ ok: true, pending: result }, { status: 200 });
    }
    if (type === "album" || type === "all") {
      result.albums = await db
        .select()
        .from(albums)
        .where(albums.status.eq("pending"));
      return NextResponse.json({ ok: true, pending: result }, { status: 200 });
    }

    if (type === "artist" || type === "all") {
      result.artists = await db
        .select()
        .from(artists)
        .where(artists.status.eq("pending"));
      return NextResponse.json({ ok: true, pending: result }, { status: 200 });
    }

    return NextResponse.json({ ok: true, pending: result }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
};
