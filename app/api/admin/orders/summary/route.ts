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

  const ordersCount = await db.orders.length
  const productsCount = await db.products.length
  const usersCount = await db.users.length

  // Calculate total sales (equivalent of the first aggregation)
  const ordersPrice = db.orders.reduce((acc: number, order: any) => acc + order.totalPrice, 0)

  // Sales data aggregation: group by month (using string format 'yyyy-mm')
  const salesData = db.orders.reduce((acc: any[], order: any) => {
    const month = order.createdAt.slice(0, 7) // Extract 'yyyy-mm' from 'yyyy-mm-dd'
    const existing = acc.find((data) => data.id === month)
    if (existing) {
      existing.totalOrders += 1
      existing.totalSales += order.totalPrice
    } else {
      acc.push({ id: month, totalOrders: 1, totalSales: order.totalPrice })
    }
    return acc
  }, []).sort((a: SalesData, b: SalesData) => a.id.localeCompare(b.id))

   // Product data aggregation: group by category
   const productsData = db.products.reduce((acc: any[], product: any) => {
    const existing = acc.find((data) => data.id === product.category)
    if (existing) {
      existing.totalProducts += 1
    } else {
      acc.push({ id: product.category, totalProducts: 1 })
    }
    return acc
  }, []).sort((a: ProductsData, b: ProductsData) => a.id.localeCompare(b.id))

  // User data aggregation: group by month (using string format 'yyyy-mm')
  const usersData = db.users.reduce((acc: any[], user: any) => {
    const month = user.createdAt.slice(0, 7) // Extract 'yyyy-mm' from 'yyyy-mm-dd'
    const existing = acc.find((data) => data.id === month)
    if (existing) {
      existing.totalUsers += 1
    } else {
      acc.push({ id: month, totalUsers: 1 })
    }
    return acc
  }, []).sort((a: UsersData, b: UsersData) => a.id.localeCompare(b.id))

  return Response.json({
    ordersCount,
    productsCount,
    usersCount,
    ordersPrice,
    salesData,
    productsData,
    usersData,
  })
}) as any
