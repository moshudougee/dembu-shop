/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '@/lib/auth'
import { readDB } from '@/lib/db'


export const GET = auth(async (req: any) => {
  if (!req.auth || !req.auth.user?.isAdmin) {
    return Response.json(
      { message: 'unauthorized' },
      {
        status: 401,
      }
    )
  }
  const db = await readDB()

  // Simulate the .find().sort({ createdAt: -1 }) and .populate('user', 'name')
  const orders = db.orders
    .sort((a: Order, b: Order) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()) // Sort by createdAt descending
    .map((order: any) => {
      // Simulate populate('user', 'name')
      const user = db.users.find((user: User) => user.id === order.userId) // Assuming userId in orders points to users
      return {
        ...order,
        user: user ? { name: user.name } : null // Attach the user's name
      }
    })

  return Response.json(orders)
}) as any
