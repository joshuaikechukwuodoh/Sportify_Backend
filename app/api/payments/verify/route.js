// app/api/payments/verify/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import fetch from "node-fetch";
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
import { payments } from "@/db/schema";

export const GET = async (request) => {
  try {
    const url = new URL(request.url);
    const reference = url.searchParams.get("reference");
    if (!reference)
      return NextResponse.json(
        { message: "reference required" },
        { status: 400 }
      );

    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(
        reference
      )}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
      }
    );
    const data = await res.json();
    if (!data.status) {
      return NextResponse.json(
        { message: "Verification failed", raw: data },
        { status: 400 }
      );
    }

    const { status, amount, reference: ref, metadata } = data.data; // amount in kobo
    // Update local payment record
    await db
      .update(payments)
      .set({
        status: status === "success" ? "success" : "failed",
        updated_at: new Date(),
      })
      .where(payments.reference.eq(ref));

    // If success, grant access: e.g., create a purchase row or mark track as unlocked for user
    if (status === "success") {
      // Example: grant access (pseudo)
      const parsedMeta = metadata || {};
      // await db.insert(purchases).values({ user_id: parsedMeta.userId, track_id: parsedMeta.trackId, paid_at: new Date() });
    }

    return NextResponse.json({ ok: true, verified: data.data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
};
