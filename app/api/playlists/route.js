import { playlists } from "@/db/schema";


export const GET = async (request) => {
    try {
        const playlist = await db.select().from(playlists);
        return new Response(JSON.stringify(playlist),
            { status: 200 },
            { message: "Playlists fetched successfully" });

    } catch (error) {
        return new Response("Internal Server Error",
            { status: 500 },
            { message: "Internal Server Error" });

    }

}   