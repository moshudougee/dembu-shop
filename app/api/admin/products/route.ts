/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '@/lib/auth'
import { readDB, writeDB } from '@/lib/db'
import { getToday } from '@/lib/utils'


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
  let products: Product[] = await db.products

  // Sort products by id in descending order (latest id first)
  products = products.sort((a: Product, b: Product) => b.id! - a.id!);

  return Response.json(products)
}) as any

export const POST = auth(async (req: any) => {
  if (!req.auth || !req.auth.user?.isAdmin) {
    return Response.json(
      { message: 'unauthorized' },
      {
        status: 401,
      }
    )
  }
  const db = await readDB()
  const siteUrl = process.env.AUTH_URL
  const product: Product = {
    id: db.products.length + 1,
    name: 'sample name',
    slug: 'sample-name-' + Math.random(),
    images: [`${siteUrl}/images/shirt1.jpg`],
    price: 0,
    category: 'sample category',
    brand: 'sample brand',
    countInStock: 0,
    description: 'sample description',
    rating: 0,
    numReviews: 0,
    isFeatured: false,
    createdAt: getToday(),
    updatedAt: getToday(),
  }
  try {
    await db.products.push(product)
    writeDB(db)
    return Response.json(
      { message: 'Product created successfully', product },
      {
        status: 201,
      }
    )
  } catch (err: any) {
    return Response.json(
      { message: err.message },
      {
        status: 500,
      }
    )
  }
}) as any
