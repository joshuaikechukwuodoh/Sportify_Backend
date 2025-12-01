import { NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { pusher } from "@/lib/pusher";

export const POST = async (request) => {
    const body = await request.json();
    const { conversationId,
        senderId,
        receiverId,
        content } = body;

    await db.insert(messages).values({
        conversationId,
        senderId,
        receiverId,
        content,
    });

    pusher.trigger(`conversation-${conversationId}`, "new-message", {
        senderId,
        receiverId,
        content,
    });

    return NextResponse.json
        ("Message sent successfully", {
            status: 201
        });
}   