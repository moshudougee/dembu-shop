/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from '@/lib/auth'
import { readDB, writeDB } from '@/lib/db'
import { getToday } from '@/lib/utils'


export const GET = auth(async (...args: any) => {
  const [req, { params }] = args
  if (!req.auth || !req.auth.user?.isAdmin) {
    return Response.json(
      { message: 'unauthorized' },
      {
        status: 401,
      }
    )
  }
  const db = await readDB()
  const product = await db.products.find((item: Product) => item.id === parseInt(params.id))
  if (!product) {
    return Response.json(
      { message: 'product not found' },
      {
        status: 404,
      }
    )
  }
  return Response.json(product)
}) as any

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

  const {
    name,
    slug,
    price,
    category,
    isFeatured,
    images,
    brand,
    countInStock,
    description,
  } = await req.json()

  // Ensure that 'images' is always an array before updating the product
  const updatedImages = Array.isArray(images) ? images : []
  console.log("Images is array: " + Array.isArray(images))

  try {
    const db = await readDB()

    const product: Product = await db.products.find((item: Product) => item.id === parseInt(params.id))
    if (product) {
      product.name = name || product.name
      product.slug = slug || product.slug
      product.price = parseInt(price) || product.price
      product.category = category || product.category
      product.isFeatured = isFeatured || product.isFeatured
      product.images = updatedImages.length > 0 ? updatedImages : product.images
      product.brand = brand || product.brand
      product.countInStock = parseInt(countInStock) || product.countInStock
      product.description = description || product.description
      product.updatedAt = getToday()

      writeDB(db)
      return Response.json(product)
    } else {
      return Response.json(
        { message: 'Product not found' },
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

export const DELETE = auth(async (...args: any) => {
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
    const db = await readDB()
    const productIndex = await db.products.findIndex((item: Product) => item.id === parseInt(params.id))
    if (productIndex !== -1) {
      await db.products.splice(productIndex, 1)
      writeDB(db)
      return Response.json({ message: 'Product deleted successfully' })
    } else {
      return Response.json(
        { message: 'Product not found' },
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

/**
 * "https://res.cloudinary.com/dfjxfzium/image/upload/v1726441691/by3pw7kso3dt5hbobs1t.webp",
        "https://res.cloudinary.com/dfjxfzium/image/upload/v1726441706/si0j6wi7nggv6twho9wy.webp",
        "https://res.cloudinary.com/dfjxfzium/image/upload/v1726441719/lwjkx9tgcabmildlpajg.webp",
        "https://res.cloudinary.com/dfjxfzium/image/upload/v1726441732/jviivs9kcois0dcybsua.webp"
 */