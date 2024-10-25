/* eslint-disable @typescript-eslint/no-explicit-any */
//import { auth } from "@/lib/auth"
import { readDB } from "@/lib/db"



export const GET = async() => {
    try {
        const db = await readDB()
        const categories = await db.categories
        return Response.json(categories)
    } catch (error: any) {
        return Response.json(
            { message: error.message },
            {
              status: 500,
            }
        )
    }
}