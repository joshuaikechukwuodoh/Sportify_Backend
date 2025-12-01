// app/api/payments/webhook/route.js
import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { payments } from "@/db/schema";
// import { pusher } from "@/lib/pusher"; // optional notify
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export const POST = async (request) => {
  try {
    const bodyText = await request.text(); // raw body required for signature
    const signature = request.headers.get("x-paystack-signature") || "";

    // verify signature
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET)
      .update(bodyText)
      .digest("hex");
    if (hash !== signature) {
      console.warn("Paystack webhook signature invalid");
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 400 }
      );
    }

    const payload = JSON.parse(bodyText);
    const event = payload.event; // e.g., "charge.success"
    const data = payload.data || {};

    if (event === "charge.success" || event === "payment.success") {
      const ref = data.reference;
      // Update payment record
      await db
        .update(payments)
        .set({
          status: "success",
          updated_at: new Date(),
        })
        .where(payments.reference.eq(ref));

      // Grant user access to track based on metadata
      const meta = data.metadata || {};
      const userId = meta.userId;
      const trackId = meta.trackId;
      if (userId && trackId) {
        // Example: insert into purchases table
        // await db.insert(purchases).values({ user_id: userId, track_id: trackId, paid_at: new Date() });
        await db
          .update(users)
          .set({
            subscription_tier: "premium",
            updated_at: new Date(),
          })
          .where(users.id.eq(userId));
      }

      // Optionally notify via pusher/email
      // await pusher.trigger(`private-user-${userId}`, "payment:success", { reference: ref, trackId });
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
};
