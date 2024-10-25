/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/lib/auth"
import { readDB } from "@/lib/db"




export const GET = auth(async (req: any) => {
    if (!req.auth || !req.auth.user?.isAdmin) {
        return Response.json(
          { message: 'unauthorized' },
          {
            status: 401,
          }
        )
    }
    try {
        const db = await readDB()
        const productProperties = await db.productProperties
        return Response.json(productProperties)
    } catch (error: any) {
        return Response.json(
            { message: error.message },
            {
              status: 500,
            }
          )
    }
}) as any

