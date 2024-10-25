import productService from '@/lib/services/productService'
import { getProductProperties } from '@/lib/services/propDescServices'
//import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import Product from './Product'

export const generateMetadata = async  ({
    params,
  }: {
    params: { slug: string }
  }) => {
    const product = await productService.getBySlug(params.slug)
    if (!product) {
      return { title: 'Product not found' }
    }
    return {
      title: product.name,
      description: product.description,
    }
  }

const ProductDetails = async ({
    params,
  }: {
    params: { slug: string }
  }) => {
    const product: Product = await productService.getBySlug(params.slug)

  if (!product) {
    return <div>Product not found</div>
  }

    
    const productProperties: ProductProperty | null = await getProductProperties(product.id!)

  return (
    <>
      <div className="my-2">
        <Link href="/">back to products</Link>
      </div>
      <Product 
        product={product}
        productProperties={productProperties}
      />
    </>
  )
}

export default ProductDetails