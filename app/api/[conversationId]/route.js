// app/api/conversations/route.js

import { NextResponse } from "next/server";
import { db } from "@/db";
import { eq, or } from "drizzle-orm";
import { pusher } from "@/lib/pusher";
import { users, Artists, conversations, conversation_members } from "@/db/schema";

export const POST = async (request) => {
    try {
        const body = await request.json().catch(() => ({}));
        const { userId, artistId } = body || {};

        if (!userId || !artistId) {
            return NextResponse.json({ message: "userId and artistId required" }, { status: 400 });
        }

        if (userId === artistId) {
            return NextResponse.json({ message: "You can't chat with yourself" }, { status: 400 });
        }

        const [user] = await db.select().from(users).where(eq(users.id, userId));

        if (!user) return NextResponse.json(
            { message: "User not found" },
            { status: 404 });

        const [artist] = await db.select().from(Artists).
            where(eq(Artists.id, artistId));

        if (!artist) return NextResponse.json(
            { message: "Artist not found" },
            { status: 404 });

        const rowsWithBoth = await db
            .select({
                conversation_id: conversation_members.conversation_id,
                user_id: conversation_members.user_id,
            })
            .from(conversation_members)
            .where(or(eq(conversation_members.user_id, userId), eq(conversation_members.user_id, artistId)));

        // count the occurrences of each conversation_id
        const convoIdCounts = {};
        for (let i = 0; i < rowsWithBoth.length; i++) {
            const cid = rowsWithBoth[i].conversation_id;
            convoIdCounts[cid] = (convoIdCounts[cid] ?? 0) + 1;
        }

        // find a conversation that contains both participants (count === 2)
        const existingConvoId = Object.keys(convoIdCounts).find((cid) => convoIdCounts[cid] === 2);

        if (existingConvoId) {
            const [conversation] = await db.select().from(conversations).where(eq(conversations.id, Number(existingConvoId)));
            return NextResponse.json(
                { ok: true, conversation, existing: true },
                { status: 200 });
        }

        // create new conversation
        const [createdConversation] = await db
            .insert(conversations)
            .values({ title: null, created_at: new Date() })
            .returning();

        // add both members
        await db.insert(conversation_members).values([
            { conversation_id: createdConversation.id, user_id: userId, role: "user", joined_at: new Date() },
            { conversation_id: createdConversation.id, user_id: artistId, role: "artist", joined_at: new Date() },
        ]);

        // notify artist via Pusher (best-effort)
        try {
            await pusher.trigger(`private-user-${artistId}`, "new-conversation", {
                conversationId: createdConversation.id,
                fromUser: { id: user.id, name: user.name },
            });
        } catch (pusherErr) {
            console.error("Pusher notify failed:", pusherErr);
        }

        return NextResponse.json({ ok: true, conversation: createdConversation, created: true }, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
};

export const PATCH = async (request) => {
    try {
        const body = await request.json().catch(() => ({}));
        const { conversationId } = body || {};

        if (!conversationId) {
            return NextResponse.json({ message: "conversationId required" }, { status: 400 });
        }

        await db.update(conversations).set({ seen: true }).where(eq(conversations.id, Number(conversationId)));

        return NextResponse.json({ ok: true, message: "Conversation seen updated successfully" }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
};

//conservaton messages  

export const GET = async (request) => {
    try {
        const body = await request.json();
        const { conversationId } = body;

        if (!conversationId) {
            return NextResponse.json({
                message: "conversationId required"
            }, { status: 400 });
        }

        const [conversation] = await db.select().from(messages)
            .where(eq(messages.conversationId,(conversationId)));

        return NextResponse.json({
            ok: true,
            conversation
        }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 });
    }
}

