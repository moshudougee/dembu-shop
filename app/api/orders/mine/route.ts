/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/lib/auth";
import { readDB } from "@/lib/db";



export const GET = auth(async (req: any) => {
    if (!req.auth) {
        return Response.json(
          { message: 'unauthorized' },
          {
            status: 401,
          }
        )
    }
    try {
        const { user } = req.auth
        const db = await readDB()
        const orders: Order[] = db.orders.filter((item: Order) => item.userId === user.id)
        return Response.json(orders)
    } catch (error: any) {
        return Response.json(
            { message: error.message },
            {
              status: 500,
            }
        )
    }
}) as any