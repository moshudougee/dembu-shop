/* eslint-disable @typescript-eslint/no-explicit-any */
import { cache } from "react"
import { readDB } from "../db"


export const revalidate = 3600

// Get latest products (sorted by _id, assuming _id can be an identifier like a timestamp)
const getLatest = cache(async () => {
    const db = await readDB()
    const products = db.products
      .sort((a: any, b: any) => b.id - a.id) // Sort by descending ID
      .slice(0, 8) // Limit to 6 latest products
    return products
})

// Get featured products
const getFeatured = cache(async () => {
    const db = await readDB()
    const products = db.products
      .filter((product: any) => product.isFeatured) // Filter by isFeatured flag
      .slice(0, 12) // Limit to 12 featured products
    return products
})

// Get product by slug
const getBySlug = cache(async (slug: string) => {
    const db = await readDB()
    const product = db.products.find((product: any) => product.slug === slug) // Find product by slug
    return product
})

// Get product by id
const getById = cache(async (id: number) => {
    const db = await readDB()
    const product = db.products.find((product: any) => product.id === id) // Find product by id
    return product
})

// Pagination parameters
const PAGE_SIZE = 3

// Get products by query
const getByQuery = cache(async ({
  q,
  category,
  sort,
  price,
  rating,
  page = '1',
}: {
  q: string
  category: string
  price: string
  rating: string
  sort: string
  page: string
}) => {
  const db = await readDB()

  // Filters
  const queryFilter = q && q !== 'all'
  ? (product: any) => new RegExp(q, 'i').test(product.name)
  : () => true

  const categoryFilter = category && category !== 'all'
    ? (product: any) => product.category === category
    : () => true

  const ratingFilter = rating && rating !== 'all'
    ? (product: any) => product.rating >= Number(rating)
    : () => true

  const priceFilter = price && price !== 'all'
    ? (product: any) => {
        const [minPrice, maxPrice] = price.split('-').map(Number)
        return product.price >= minPrice && product.price <= maxPrice
      }
    : () => true

  // Sort order
  const order = (a: any, b: any) => {
    if (sort === 'lowest') return a.price - b.price
    if (sort === 'highest') return b.price - a.price
    if (sort === 'toprated') return b.rating - a.rating
    return b.id - a.id // Default sort by _id descending
  }

  // Apply filters and sort
  const filteredProducts: Product[] = db.products
    .filter(queryFilter)
    .filter(categoryFilter)
    .filter(ratingFilter)
    .filter(priceFilter)
    .sort(order)

  // Pagination
  const countProducts: number = filteredProducts.length
  const products: Product[] = filteredProducts.slice(PAGE_SIZE * (Number(page) - 1), PAGE_SIZE * Number(page))

  // Get distinct categories
  //const categories = Array.from(new Set(db.products.map((product: any) => product.category)))
  const categories: Category[] = db.categories

  return {
    products,
    countProducts,
    page,
    pages: Math.ceil(countProducts / PAGE_SIZE),
    categories,
  }
})

// Get all categories (distinct)
const getCategories = cache(async () => {
    const db = await readDB()
    const categories = db.categories
    return categories
  })
  
  // Export all services
  const productService = {
    getLatest,
    getFeatured,
    getBySlug,
    getById,
    getByQuery,
    getCategories,
  }
  
  export default productService