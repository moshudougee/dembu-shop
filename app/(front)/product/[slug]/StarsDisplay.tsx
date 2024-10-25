import Empty from '@/components/stars/Empty'
import Full from '@/components/stars/Full'
import React from 'react'

const StarsDisplay = ({ value }: { value: number }) => {
    const starCount = [1, 2, 3, 4, 5]
  return (
    <span className='flex gap-2'>
        {starCount.map((star) => {
            return (
                <span key={star}>
                    {value >= star ? <Full /> : <Empty />}
                </span>
            )
        })}
    </span>
  )
}

export default StarsDisplay