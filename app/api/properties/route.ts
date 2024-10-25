/* eslint-disable @typescript-eslint/no-explicit-any */

import { readDB } from "@/lib/db"


export const GET = async() => {
    try {
       const db = await readDB()
       const properties = await db.properties
       return Response.json(properties) 
    } catch (error:any) {
        return Response.json(
            { message: error.message },
            {
              status: 500,
            }
        )
    }
}