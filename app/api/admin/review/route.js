import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { tracks, albums, artists, admin_reviews } from "@/db/schema";
import { eq } from "drizzle-orm";

export const PATCH = async (request) => {
  const admin = await requireAdmin(request);
  if (!admin)
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });

  try {
    const body = await request.json().catch(() => ({}));
    const { itemType, itemId, action, reason } = body || {};
    // itemType: "track"|"album"|"artist"; action: "approve"|"reject"

    if (!itemType || !itemId || !action)
      return NextResponse.json(
        {
          message: "itemType, itemId, action required",
        },
        { status: 400 }
      );

    const tableMap = { track: tracks, album: albums, artist: artists };

    const table = tableMap[itemType];
    if (!table)
      return NextResponse.json(
        { message: "Invalid itemType" },
        { status: 400 }
      );

    if (action === "approve") {
      // set status to approved, set published_at
      await db
        .update(table)
        .set({ status: "approved", published_at: new Date() })
        .where(eq(table.id, Number(itemId)));
      return NextResponse.json({ ok: true }, { status: 200 });
    } else if (action === "reject") {
      await db
        .update(table)
        .set({ status: "rejected" })
        .where(eq(table.id, Number(itemId)));
    } else {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    // log review
    await db.insert(admin_reviews).values({
      item_type: itemType,
      item_id: Number(itemId),
      admin_id: admin.id,
      action: action === "approve" ? "approved" : "rejected",
      reason: reason ?? null,
      created_at: new Date(),
    });

    // optional: notify submitter via pusher
    try {
      // fetch item to get submitted_by
      const [itemRow] = await db
        .select()
        .from(table)
        .where(eq(table.id, Number(itemId)));
      if (itemRow && itemRow.submitted_by) {
        await pusher.trigger(
          `private-user-${itemRow.submitted_by}`,
          "submission-reviewed",
          {
            itemType,
            itemId: Number(itemId),
            action,
            reason: reason ?? null,
          }
        );
      }
    } catch (notifyErr) {
      console.error("Pusher notify failed:", notifyErr);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
};
