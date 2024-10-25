/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/lib/auth";
import { readDB, writeDB } from "@/lib/db";
import { getToday, round2 } from "@/lib/utils";


const calcPrices = (orderItems: OrderItem[]) => {
    // Calculate the items price
    const itemsPrice = round2(
      orderItems.reduce((acc, item) => acc + item.price * item.qty, 0)
    )
    // Calculate the shipping price
    const shippingPrice = round2(itemsPrice > 100 ? 0 : 10)
    // Calculate the tax price
    const taxPrice = round2(Number((0.15 * itemsPrice).toFixed(2)))
    // Calculate the total price
    const totalPrice = round2(itemsPrice + shippingPrice + taxPrice)
    return { itemsPrice, shippingPrice, taxPrice, totalPrice }
  }

export const POST = auth(async (req) => {
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
       const payload = await req.json()
       const db = await readDB()
       // Extract product IDs from payload
        const productIds = payload.items.map((x: { id: number }) => x.id);

        // Filter products in the database based on the product IDs in the payload
        const dbProductPrices = db.products
            .filter((product: { id: number }) => productIds.includes(product.id))
            .map((product: { id: number, price: number }) => ({
                id: product.id,
                price: product.price
        }));

        const dbOrderItems = payload.items.map((x: { id: number }) => ({
            ...x,
            product: x.id,
            price: dbProductPrices.find((p: { id: number, price: number }) => p.id === x.id).price,
            id: undefined,
        }))

        const { itemsPrice, taxPrice, shippingPrice, totalPrice } = calcPrices(dbOrderItems)

        const newOrder: Order = {
            id: db.orders.length + 1,
            userId: user.id,
            items: dbOrderItems,
            shippingAddress: payload.shippingAddress,
            paymentMethod: payload.paymentMethod,
            itemsPrice,
            shippingPrice,
            taxPrice,
            totalPrice,
            isPaid: false,
            isDelivered: false,
            paidAt: '',
            deliveredAt: getToday(),
            createdAt: getToday(),
            user: { name: user.name! },
        }
        await db.orders.push(newOrder)
        writeDB(db)

        return Response.json(
            { message: 'Order has been created', order: newOrder },
            {
              status: 201,
            }
        )

    } catch (error: any) {
        return Response.json(
            { message: 'error creating order' + error.message },
            {
              status: 500,
            }
        )
    }
}) as any