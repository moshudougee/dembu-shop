/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/lib/auth";
import { readDB, writeDB } from "@/lib/db";
import { paypal } from "@/lib/paypal";
import { getToday } from "@/lib/utils";



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
        const { orderID } = await req.json()
        const db = await readDB()
       const order: Order = await db.orders.find((item: Order) => item.id === parseInt(params.id))
       if (order) {
            const captureData = await paypal.capturePayment(orderID)
            order.isPaid = true
            order.paidAt = getToday()
            order.paymentResult = {
                id: captureData.id,
                status: captureData.status,
                email_address: captureData.payer.email_address,
            }
            writeDB(db)
            return Response.json(order)
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