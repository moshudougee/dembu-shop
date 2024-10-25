/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '@/lib/auth'
import { readDB, writeDB } from '@/lib/db'
import { getToday } from '@/lib/utils'


export const PUT = auth(async (...args: any) => {
  const [req, { params }] = args
  if (!req.auth || !req.auth.user?.isAdmin) {
    return Response.json(
      { message: 'unauthorized' },
      {
        status: 401,
      }
    )
  }
  try {
    const db = await readDB();

    const order = await db.orders.find((item : Order) => item.id === parseInt(params.id));
    if (order) {
      if (!order.isPaid)
        return Response.json(
          { message: 'Order is not paid' },
          {
            status: 400,
          }
        )
      order.isDelivered = true
      order.deliveredAt = getToday()
      writeDB(db)
      return Response.json(order)
    } else {
      return Response.json(
        { message: 'Order not found' },
        {
          status: 404,
        }
      )
    }
  } catch (err: any) {
    return Response.json(
      { message: err.message },
      {
        status: 500,
      }
    )
  }
}) as any
