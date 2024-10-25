/* eslint-disable @typescript-eslint/no-explicit-any */
import { readDB, writeDB } from "@/lib/db";
import { getToday } from "@/lib/utils";
import bcrypt from 'bcryptjs'


export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();
        const hashedPassword = await bcrypt.hash(password, 5);
        const db = readDB();
        const createdAt = getToday();
        const newUser = {
            id: db.users.length + 1,
            name: name,
            email: email,
            password: hashedPassword,
            isAdmin: false,
            createdAt: createdAt,
            updatedAt: createdAt
        };
        db.users.push(newUser);
        writeDB(db);
        return Response.json(
            { message: 'User has been created' },
            {
              status: 201,
            }); 
    } catch (error: any) {
        console.log(error);
        return  Response.json(
            { message: "Internal Server error, Register User" + error.message },
            {
                status: 500,
            }
        );
    }
}