'use client'
import useCartService from '@/lib/hooks/useCartStore'
//import { OrderItem } from '@/lib/models/OrderModel'
//import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AddToCart({ item, selected }: { item: OrderItem, selected: boolean }) {
  //const router = useRouter()
  const { items, increase, decrease } = useCartService()
  const [existItem, setExistItem] = useState<OrderItem | undefined>()

  useEffect(() => {
    const foundItem = items.find(
      (x) =>
        x.slug === item.slug &&
        x.properties?.length === item.properties?.length && // Check if the length of the properties matches
        x.properties?.every((prop, index) => 
          prop.propertyId === item.properties?.[index]?.propertyId && 
          prop.value === item.properties?.[index]?.value
        ) // Compare each property
    );
    
    setExistItem(foundItem)
  }, [item, items])

  const addToCartHandler = () => {
    increase(item)
  }
  return existItem ? (
    <div className='flex flex-col gap-2 w-full'>
      <div className='flex gap-3 justify-center items-center'>
        <button className="btn" type="button" onClick={() => decrease(existItem)}>
          -
        </button>
        <span className="px-2">{existItem.qty}</span>
        <button className="btn" type="button" onClick={() => increase(existItem)}>
          +
        </button>
      </div>
      <div className='flex w-full'>
        <span className='text-sm text-cyan-800'>You can select different properties and add to cart.</span>
      </div>
    </div>
  ) : (
    <div className='flex flex-col gap-1 w-full'>
      <button
        className="btn btn-primary w-full"
        type="button"
        disabled={!selected}  // Add condition to disable the button if the product is not selected.
        onClick={addToCartHandler}
      >
        Add to cart
      </button>
      {!selected && 
        <span className='text-sm text-cyan-800'>Select each product property.</span>
      }
    </div>
  )
}
