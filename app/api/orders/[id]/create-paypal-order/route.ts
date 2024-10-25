/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/lib/auth"
import { readDB } from "@/lib/db"
import { paypal } from "@/lib/paypal"



export const POST = auth(async (...args: any) => {
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
        const order: Order = await db.orders.find((item: Order) => item.id === parseInt(params.id))
        if (order) {
            const paypalOrder = await paypal.createOrder(order.totalPrice)
            //console.log(paypalOrder)
            return Response.json(paypalOrder)
        } else {
            return Response.json(
                { message: 'order not found' },
                {
                    status: 404,
                }
            )
        }
    } catch (error: any) {
        return Response.json(
            { message: error.message },
            {
              status: 500,
            }
        )
    }
}) as any
