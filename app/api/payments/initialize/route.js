// app/api/payments/initialize/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { payments } from "@/db/schema";
import fetch from "node-fetch"; // node 18+ has global fetch; if not, install node-fetch
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export const POST = async (request) => {
  try {
    const body = await request.json().catch(() => ({}));
    const { userId, trackId, amount } = body; // amount in Naira (e.g., 100)
    if (!userId || !trackId || !amount) {
      return NextResponse.json(
        { message: "userId, trackId and amount required" },
        { status: 400 }
      );
    }

    // convert to kobo
    const amount_kobo = Math.round(Number(amount) * 100);

    // create local payment row with status pending
    const reference = `pay_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    await db.insert(payments).values({
      reference,
      user_id: userId,
      amount_kobo,
      currency: "NGN",
      status: "pending",
      metadata: JSON.stringify({ trackId }),
      created_at: new Date(),
      updated_at: new Date(),
    });

    // initialize transaction with Paystack
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amount_kobo,
        email: "user@example.com", // ideally get user's email from DB
        reference,
        metadata: { trackId, userId },
      }),
    });

    const data = await res.json();

    if (!data.status) {
      // Paystack returned an error
      return NextResponse.json(
        { message: "Paystack init failed", raw: data },
        { status: 500 }
      );
    }

    // return the authorization_url to frontend so user can complete payment
    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
};
