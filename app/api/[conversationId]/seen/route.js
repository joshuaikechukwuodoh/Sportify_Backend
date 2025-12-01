
// app/api/conversations/seen/route.js


import { NextResponse } from "next/server";
import { db } from "@/db";
import { eq } from "drizzle-orm";
import { pusher } from "@/lib/pusher";


export const PATCH = async (request) => {
    try {
        const body = await request.json().catch(() => ({}));
        const { conversationId, userId } = body || {};

        if (!conversationId || !userId) {
            return NextResponse.json({ message: "conversationId and userId required" }, { status: 400 });
        }

        //verify the user is a member of the conversation
        const memberRows = await db
            .select()
            .from(conversation_members)
            .where(and(
                eq(conversation_members.conversation_id, Number(conversationId)),
                eq(conversation_members.user_id, Number(userId))
            ));

        if (!memberRows || memberRows.length === 0) {
            return NextResponse.json({ message: "Not a member of this conversation" }, { status: 403 });
        }

        const now = new Date();

        // Check for an existing read row
        const existing = await db
            .select()
            .from(conversation_reads)
            .where(and(
                eq(conversation_reads.conversation_id, Number(conversationId)),
                eq(conversation_reads.user_id, Number(userId))
            ));

        if (existing && existing.length > 0) {
            // update
            await db
                .update(conversation_reads)
                .set({ last_read_at: now })
                .where(and(
                    eq(conversation_reads.conversation_id, Number(conversationId)),
                    eq(conversation_reads.user_id, Number(userId))
                ));
        } else {
            // insert
            await db
                .insert(conversation_reads)
                .values({ conversation_id: Number(conversationId), user_id: Number(userId), last_read_at: now });
        }

        // Notify other participants via Pusher (best-effort)
        try {
            await pusher.trigger(`private-conversation-${conversationId}`, "message-read", {
                conversationId: Number(conversationId),
                userId: Number(userId),
                lastReadAt: now.toISOString(),
            });
        } catch (pusherErr) {
            console.error("Pusher notify failed:", pusherErr);
        }

        return NextResponse.json({ ok: true, conversationId: Number(conversationId), userId: Number(userId), lastReadAt: now.toISOString() }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
};
