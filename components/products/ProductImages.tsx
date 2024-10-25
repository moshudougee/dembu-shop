'use client'
import Image from 'next/image'
import React, { useState } from 'react'

const ProductImages = ({ images }: { images: string[] }) => {
    const [displayImage, setDisplayImage] = useState<string>(images[0] || '')
  return (
    <div className='flex flex-col gap-1'>
            
                <Image
                    src={displayImage}
                    alt='product'
                    width={640}
                    height={640}
                    sizes="100vw"
                    style={{
                        width: 'auto',
                        height: '640px',
                        objectFit: 'contain',
                    }}
                    className='rounded-lg'
                    priority
                />
            
            <div className='flex flex-wrap gap-1 justify-center'>
              {images.length > 1 && images.map((image) => {
                return (
                  <Image
                    key={image}
                    src={image}
                    alt='product'
                    width={100}
                    height={100}
                    sizes='30vw'
                    className='border border-slate-400'
                    style={{
                        width: 'auto',
                        height: '120px',
                        borderRadius: '10px',
                        objectFit: 'contain',
                        cursor: 'pointer',
                    }}
                    onClick={() => {
                      setDisplayImage(image)
                    }}
                  />
                )
              })}
            </div>
          </div>
  )
}

export default ProductImages