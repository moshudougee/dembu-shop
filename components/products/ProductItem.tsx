//import { Product } from '@/lib/models/ProductModel'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Rating } from './Rating'

export default function ProductItem({ product }: { product: Product }) {
        let formatedName = ''
        if (product.name.length > 20) {
          formatedName = product.name.substring(0, 20) + '...'
        } else {
          formatedName = product.name
        }
  return (
    <div className="card bg-base-300 shadow-xl mb-4">
      <figure className='p-2'>
        <Link href={`/product/${product.slug}`}>
          <Image
            src={product.images[0]}
            alt={product.name}
            width={280}
            height={280}
            className="object-cover h-64 w-full rounded-md mt-4 mx-2"
            priority
          />
        </Link>
      </figure>
      <div className="card-body">
        <Link href={`/product/${product.slug}`}>
          <h2 className="card-title font-normal">{formatedName}</h2>
        </Link>
        <Rating value={product.rating} caption={`(${product.numReviews})`} />
        <p className="mb-2">{product.brand}</p>
        <div className="card-actions flex items-center justify-between">
          <span className="text-2xl">${product.price}</span>
        </div>
      </div>
    </div>
  )
}
