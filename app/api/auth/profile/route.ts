/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/lib/auth";
import { readDB, writeDB } from "@/lib/db";



export const PUT = auth(async (req) => {
    if (!req.auth) {
        return Response.json({ message: 'Not authenticated' }, { status: 401 })
    }
    try {
        const { user } = req.auth
        const { name, email } = await req.json()
        const db = await readDB()
        const dbUser: User = await db.users.find((item: User) => item.id === user.id)
        if (!dbUser) {
            return Response.json(
                { message: 'User not found' },
                {
                  status: 404,
                }
            )
        }
        dbUser.name = name
        dbUser.email = email
        writeDB(db)
        return Response.json({ message: 'User has been updated' }) 
    } catch (error: any) {
        return Response.json(
            { message: error.message },
            {
              status: 500,
            }
          )
    }
}) as any