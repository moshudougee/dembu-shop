/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import AddToCart from '@/components/products/AddToCart';
import ProductImages from '@/components/products/ProductImages';
import { Rating } from '@/components/products/Rating';
import useLayoutService from '@/lib/hooks/useLayout';
import React, { useEffect, useState } from 'react'
import useSWR from 'swr';
import StarsDisplay from './StarsDisplay';
import { useSession } from 'next-auth/react';
import { getRelated, rateProduct } from '@/lib/services/propDescServices';
import toast from 'react-hot-toast';
import ProductItem from '@/components/products/ProductItem';

interface ProductProps {
    product: Product;
    productProperties: ProductProperty | null;
}

const Product: React.FC<ProductProps> = ({product, productProperties}) => {
    const {data: properties, error, isLoading} = useSWR<Property[], Error>(`/api/properties`)
    const [choiceProperties, setChoiceProperties] = useState<Description[]>([])
    const [detailProperties, setDetailProperties] = useState<Description[]>([])
    const [conclusion, setConclusion] = useState<Description[]>([])
    const [itemProperties, setItemProperties] = useState<OrderItemProperty[]>([])
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
    const [selected, setSelected] = useState<boolean>(false)
    const [active, setActive] = useState<string | number>('')
    const [starActive, setStarActive] = useState<number>(0)
    const [myRating, setMyRating] = useState<number>(0)
    const [comment, setComment] = useState<string>('')
    const [ratingError, setRatingError] = useState<boolean>(false)
    const { theme } = useLayoutService()
    const { data: session } = useSession()

    const user = session?.user
    const count = [1, 2, 3, 4, 5]
    

    const getName = (propertyId: number) => {
        if (!properties) return ''
        const property = properties.find((p: Property) => p.id === propertyId)
        return property? property.name : ''
    }

    const activateValue = (item: string | number, name: string, propertyId: number) => {
        setItemProperties((prev) => {
             // Check if the property already exists by name
            const propertyExists = prev.some(property => property["name"] === name);

            if (propertyExists) {
            // Update the value of the existing property
            return prev.map((property) =>
                property.name === name
                ? { ...property, value: item } // Update the value if the name matches
                : property
            );
            } else {
            // If it doesn't exist, add a new property
            return [...prev, { propertyId, name, value: item }];
            }
        })
        setActive(item)
    }

    const activateStars = (item: number) => {
        setMyRating(item)
        setStarActive(item)
    }

    const handleRatingUpdate = async () => {
        if (myRating === 0 || comment === '') {
           setRatingError(true) 
        } else {
            setRatingError(false)
            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
            const updated = await rateProduct(product.id!, user?.id!, myRating, comment)
            if (updated) {
              toast.success('Rating successfull')
              // Refresh the page after success
              window.location.reload();  
            } else {
                toast.error('Rating failed')
            }
        }
    }

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            const data = await getRelated(product.id!, product.category)
            setRelatedProducts(data)
        }
        fetchRelatedProducts()
    }, [product])

    useEffect(() => {
        const checkConclusion = (propertyId: number) => {
            if (!properties) return false
            for (const property of properties) {
                if (property.id === propertyId && property.name === 'Conclusion') {
                    return true
                }
            }
            return false
        }
        if (productProperties && properties) {
            const newChoiceProperties: Description[] = [];
            const newDetailProperties: Description[] = [];
            let newConclusion: Description[] = [];
    
            for (const description of productProperties.description) {
                if (description.fixedValues) {
                    newChoiceProperties.push(description);
                }
                if (checkConclusion(description.propertyId)) {
                    newConclusion = [description];
                } 
                if (!description.fixedValues && !checkConclusion(description.propertyId)){
                    newDetailProperties.push(description);
                }
            }
    
            setChoiceProperties(newChoiceProperties)
            setDetailProperties(newDetailProperties)
            setConclusion(newConclusion)
        }
    }, [productProperties, properties])

    useEffect(() => {
        if (choiceProperties.length > 0 && itemProperties.length === choiceProperties.length) {
            setSelected(true)
        }
    }, [choiceProperties, itemProperties])

    
    // Format the product name for better readability
    let formatedName = ''
    if (product.name.length > 20) {
      formatedName = product.name.substring(0, 20) + '...'
    } else {
      formatedName = product.name
    }


    if (isLoading) return <div><p>Loading...</p></div>
    if (error) return <div><p>Error fetching product data: {error?.message}</p></div>

  return (
    <>
        <div className="grid lg:grid-cols-4 md:gap-3">
            <div className="md:col-span-2 rounded-md shadow-md py-10">
                <ProductImages images={product.images} />
            </div>
            <div>
                <ul className="space-y-4">
                    <li>
                    <h1 className="text-xl">{formatedName}</h1>
                    </li>
                    <li>
                    <Rating
                        value={product.rating}
                        caption={`${product.numReviews} ratings`}
                    />
                    </li>
                    <li> {product.brand}</li>
                    <li>
                    <div className="divider"></div>
                    </li>
                    <li>
                        <div className='flex justify-center items-center'>
                            <h1 className={`font-bold text-xl ${theme === 'dark' ? 'text-success/80' : ''}`}>
                                Product Properties
                            </h1>
                        </div>
                    </li>
                    {choiceProperties.length > 0 && choiceProperties.map((property, index) => {
                        const propertyName = getName(property.propertyId)
                        return (
                            <li key={index} className='p-5'>
                                <h2 className={`font-semibold ${theme === 'dark' ? 'text-orange-600/80' : ''}`}>
                                    {propertyName}
                                </h2>
                                <div className='flex gap-1 justify-center items-center'>
                                    <span className='w-1/4 text-sm'>Select {propertyName} </span>
                                    <div className='flex flex-wrap w-3/4 gap-1'>
                                        {property.values?.map((value, index) => {
                                            
                                            return (
                                                <div 
                                                    key={index} 
                                                    className={
                                                        `${active === value.value ? 'border-info/80 text-info/80' : 'border-slate-700'}
                                                        border  rounded-md p-2 cursor-pointer`
                                                    }
                                                    onClick={() => activateValue(value.value, propertyName, property.propertyId)}
                                                >
                                                    <span>{value.value} </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </li>
                        )
                    })}
                    
                </ul>
            </div>
        <div className='flex flex-col gap-4'>
          <div className="card  bg-base-300 shadow-xl mt-3 md:mt-0">
            <div className="card-body">
              <div className="mb-2 flex justify-between">
                <div>Price</div>
                <div>${product.price}</div>
              </div>
              <div className="mb-2 flex justify-between">
                <div>Status</div>
                <div>
                  {product.countInStock > 0 ? 'In stock' : 'Unavailable'}
                </div>
              </div>
              {product.countInStock !== 0 && (
                <div className="card-actions justify-center">
                    {user?.isAdmin ? (
                        null
                    ) : (
                        <AddToCart
                            item={{
                            ...product,
                            qty: 0,
                            properties: itemProperties
                            }}
                            selected={selected}
                        />
                    )}
                  
                </div>
              )}
            </div>
          </div>
          {user?.isAdmin ? (
            <div className='flex flex-col gap-4 justify-center items-center bg-base-300 shadow-xl rounded-2xl py-4 px-8'>
                <span>Product Ratings</span>
                <div className='flex w-full justify-center items-center'>
                    <Rating
                        value={product.rating}
                        caption={`${product.numReviews} ratings`}
                    />
                </div>
            </div>
          ) : (
            <div className='flex flex-col gap-4 justify-center items-center bg-base-300 shadow-xl rounded-2xl py-4 px-8'>
                <span>Rate this product</span>
                <div className='flex w-full justify-center items-center'>
                    <Rating
                        value={product.rating}
                        caption={`${product.numReviews} ratings`}
                    />
                </div>
                <div className='flex w-full justify-center items-center'>
                    <div className='flex flex-col gap-2'>
                        {count.map((item) => {
                            return (
                                <div 
                                    key={item} 
                                    className={
                                        `${starActive === item ? 'border-info/80 text-info/80' : 'border-slate-700'}
                                        border  rounded-md p-2 cursor-pointer`
                                    }
                                    onClick={() => activateStars(item)}
                                >
                                    <StarsDisplay value={item} />
                                </div>
                            )
                        })}               
                    </div>
                </div>
                <div className='flex flex-col gap-1 w-full'>
                    <span>Leave a comment below</span>
                    <textarea 
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className='textarea textarea-bordered w-full max-w-md'
                    />
                </div>
                <div className='flex flex-col gap-2 w-full'>
                    <button
                        className='btn btn-primary w-full'
                        type='button'
                        onClick={handleRatingUpdate}
                    >
                        Rate
                    </button>
                    {ratingError && 
                        <span className='text-sm text-cyan-800'>Select at least one star rating and leave a comment</span>
                    }
                </div>
            </div>
          )}
          
        </div>
        </div>
        <div className="flex flex-col gap-1 lg:flex-row justify-center items-start w-full">
            <div className='product-details'>
                    <div className='flex'>
                        <h1 className={`font-bold text-xl ${theme === 'dark' ? 'text-success/80' : ''}`}>Product Details</h1>
                    </div>
                    <div className='flex flex-col gap-1'>
                        <h2 className={`font-semibold ${theme === 'dark' ? 'text-orange-600/80' : ''}`}>Product Overview </h2>
                        <span className='indent-3 leading-5'>{product.description}</span>
                    </div>
                    {detailProperties.length > 0 && detailProperties.map((property, index) => {
                        const propertyName = getName(property.propertyId)
                        return (
                            <div key={index} className='flex flex-col gap-1'>
                                <h2 className={`font-semibold ${theme === 'dark' ? 'text-orange-600/80' : ''}`}>{propertyName}</h2>
                                <div className='flex flex-col gap-2'>
                                    {property.values?.map((value, index) => {
                                        return (
                                            <div key={index} className='flex'>
                                                {property.hasTitle ? (
                                                    <div className='flex flex-wrap w-full'>
                                                        <span className='leading-5'>
                                                            <span className={`font-semibold ${theme === 'dark' ? 'text-primary-foreground/80' : ''}`}>
                                                                • {value.title}: {' '} 
                                                            </span>
                                                            {value.value} 
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className='leading-5'>• {value.value} </span>
                                                )}
                                                
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                    <div className='flex flex-col gap-1'>
                        {conclusion.length > 0 &&
                        <div>
                            <h2 className={`font-semibold ${theme === 'dark' ? 'text-orange-600/80' : ''}`}>
                                Why Choose the {product.name}?
                            </h2>
                            {conclusion[0].values?.map((item, index) => (
                                <span key={index} className='flex indent-3 leading-5'>{item.value} </span>
                            ))}
                        </div>
                        }
                    </div>
            </div>
            <div className='flex flex-col gap-3 w-full lg:w-1/4 rounded-md shadow-md'>
                <div className='flex justify-center items-center'>
                    <h1 className={`font-bold text-xl ${theme === 'dark' ? 'text-success/80' : ''}`}>Related Products</h1>
                </div>
                <div className='flex flex-col md:flex-row md:flex-wrap lg:flex-col gap-2 px-2'>
                    {relatedProducts && relatedProducts.length > 0 && relatedProducts.map((related) => {
                        return (
                            <ProductItem key={related.id} product={related} />
                        )
                    })}
                </div>
            </div>
        </div>
            
        
        
    </>
  )
}

export default Product