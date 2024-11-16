'use client'
import { Rating } from '@/components/products/Rating'
import useLayoutService from '@/lib/hooks/useLayout'
import { getProductReviews } from '@/lib/services/propDescServices'
import React, { useEffect, useState } from 'react'

const Reviews = ({ product }: { product: Product }) => {
    const [reviews, setReviews] = useState<Reviews | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const { theme } = useLayoutService()

    useEffect(() => {
        const fetchReviews = async () => {
            setLoading(true)
            const data = await getProductReviews(product.id!)
            setReviews(data)
            setLoading(false)
        }
        if (product) {
            fetchReviews()
        }
    }, [product])

    if (loading) return <div>Loading...</div>

    let formatedName = ''
    if (product.name.length > 30) {
      formatedName = product.name.substring(0, 30) + '...'
    } else {
      formatedName = product.name
    }

  return (
    <div className='ml-5'>
        <h1 className="text-2xl py-4">Reviews for Product {formatedName}</h1>
        <div className='flex flex-col gap-4'>
            <div className='flex justify-center items-center bg-base-300 shadow-xl rounded-2xl py-4 px-8 w-full md:w-1/2 lg:w-1/3'>
                <Rating 
                    value={product.rating}
                    caption={`${product.numReviews} ratings`}
                />
            </div>
            {reviews === null ? (
                <div className='flex justify-center items-center shadow-xl rounded-2xl pt-4 px-8 w-full md:w-1/2 lg:w-1/3'>
                    <span>No reviews yet.</span>
                </div>
            ) : (
                <div className='flex flex-col gap-3'>
                    <h2 className={`font-semibold w-1/4 ${theme === 'dark' ? 'text-orange-600/80' : ''}`}>
                        {reviews.totalReviews} Reviews
                    </h2>
                    {reviews.comments.length > 0 && reviews.comments.map((comment, index) => {
                        return (
                            <div key={index}>
                                <span>{comment.comment}</span>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    </div>
  )
}

export default Reviews