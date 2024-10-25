/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/lib/auth";
import { readDB } from "@/lib/db";



export const GET = auth(async (...args: any) => {
    const [req, { params }] = args
    if (!req.auth) {
        return Response.json(
          { message: 'unauthorized' },
          {
            status: 401,
          }
        )
    }
    try {
       const db = await readDB()
       const order = await db.orders.find((item: Order) => item.id === parseInt(params.id))
       if (!order) {
            return Response.json(
                { message: 'order not found' },
                {
                    status: 404,
                }
            )
       }
       return Response.json(order) 
    } catch (error: any) {
        return Response.json(
            { message: error.message },
            {
                status: 500,
            }
        )
    }
}) as any