/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Returns a list of all users
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *   post:
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 */



import { NextResponse } from "next/server";
import { db } from "@/db"
import { eq } from "drizzle-orm";



export const GET = async () => {
    const users = await db.select().from(users);
    return NextResponse.json(users);
};


export const PUT = async (request) => {

    const body = await request.json();

    const { id } = body;

    const user = await db.select().from(users).where(eq(users.id, id));

    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }


    const updatedUser = await db.update(users).set({
        ...body
    }).where(eq(users.id, id));

    return NextResponse.json(updatedUser);
}

export const DELETE = async (request) => {
    const body = await request.json();
    const { id } = body;

    const user = await db.select().from(users).where(eq(users.id, id));

    if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    await db.delete(users).where(eq(users.id, id));
    return NextResponse.json("User deleted successfully");
}   