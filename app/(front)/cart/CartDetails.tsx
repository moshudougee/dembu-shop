'use client'

import useCartService from '@/lib/hooks/useCartStore'
import useLayoutService from '@/lib/hooks/useLayout'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function CartDetails() {
  const router = useRouter()
  const { items, itemsPrice, decrease, increase } = useCartService()
  const { theme } = useLayoutService()

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <></>

  return (
    <>
      <h1 className="py-4 text-2xl">Shopping Cart</h1>

      {items.length === 0 ? (
        <div>
          Cart is empty. <Link href="/">Go shopping</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          <div className="overflow-x-auto md:col-span-3">
            <table className="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Properties</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => { 
                  // Format the product name for better readability
                  let formatedName = ''
                  if (item.name.length > 20) {
                    formatedName = item.name.substring(0, 20) + '...'
                  } else {
                    formatedName = item.name
                  }
                  return (
                    <tr key={index}>
                      <td>
                        <Link
                          href={`/product/${item.slug}`}
                          className="flex items-center"
                        >
                          <Image
                            src={item.images[0]}
                            alt={item.name}
                            width={50}
                            height={50}
                          ></Image>
                          <span className="px-2">{formatedName}</span>
                        </Link>
                      </td>
                      <td>
                        {item.properties && item.properties?.length > 0 && item.properties?.map((property, index) => {
                          return (
                            <div key={property.propertyId} className='flex flex-wrap gap-1'>
                              <span className={`font-semibold ${theme === 'dark' ? 'text-orange-600/80' : ''}`}>
                                {property.name}:
                              </span>
                              <span className="ml-1">{property.value}</span>
                              <span>{index !== (item.properties?.length ?? 0) - 1 ? ',' : ''}</span>
                            </div>
                          )
                        })
                        }
                      </td>
                      <td>
                        <button
                          className="btn"
                          type="button"
                          onClick={() => decrease(item)}
                        >
                          -
                        </button>
                        <span className="px-2">{item.qty}</span>
                        <button
                          className="btn"
                          type="button"
                          onClick={() => increase(item)}
                        >
                          +
                        </button>
                      </td>
                      <td>${item.price}</td>
                    </tr>
                  )}
                )}
              </tbody>
            </table>
          </div>
          <div>
            <div className="card bg-base-300">
              <div className="card-body">
                <ul>
                  <li>
                    <div className="pb-3 text-xl">
                      Subtotal ({items.reduce((a, c) => a + c.qty, 0)}) : $
                      {itemsPrice}
                    </div>
                  </li>
                  <li>
                    <button
                      onClick={() => router.push('/shipping')}
                      className="btn btn-primary w-full"
                    >
                      Proceed to Checkout
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
