/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import ProductImages from '@/components/products/ProductImages';
import { Rating } from '@/components/products/Rating';
import useLayoutService from '@/lib/hooks/useLayout';
import React, { useEffect, useState } from 'react'
import useSWR from 'swr';
import { getRelated} from '@/lib/services/propDescServices';
import Link from 'next/link';
import { Edit } from 'lucide-react';
import AdminProdItem from '@/components/admin/AdminProdItem';

interface ProductProps {
    product: Product;
    productProperties: ProductProperty | null;
}

const Product: React.FC<ProductProps> = ({product, productProperties}) => {
    const {data: properties, error, isLoading} = useSWR<Property[], Error>(`/api/properties`)
    const [choiceProperties, setChoiceProperties] = useState<Description[]>([])
    const [detailProperties, setDetailProperties] = useState<Description[]>([])
    const [conclusion, setConclusion] = useState<Description[]>([])
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
    const { theme } = useLayoutService()
    

    const getName = (propertyId: number) => {
        if (!properties) return ''
        const property = properties.find((p: Property) => p.id === propertyId)
        return property? property.name : ''
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

    // Format the product name for better readability
    let formatedName = ''
    if (product.name.length > 30) {
      formatedName = product.name.substring(0, 30) + '...'
    } else {
      formatedName = product.name
    }


    if (isLoading) return <div><p>Loading...</p></div>
    if (error) return <div><p>Error fetching product data: {error?.message}</p></div>

  return (
    <>
        <div className="grid lg:grid-cols-3 md:gap-3 mt-5">
            <div className="md:col-span-2 rounded-md shadow-md py-10">
                <ProductImages images={product.images} />
            </div>
            <div className="flex flex-col gap-3">
                <div>
                    <ul className="space-y-4 ml-5">
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
                                <li key={index} className='flex gap-2 items-center p-5'>
                                    <h2 className={`font-semibold w-1/4 ${theme === 'dark' ? 'text-orange-600/80' : ''}`}>
                                        {propertyName}
                                    </h2>
                                    <div className='flex gap-1 justify-center items-center'>
                                        <div className='flex flex-wrap w-3/4 gap-1'>
                                            {property.values?.map((value, index) => {
                                                
                                                return (
                                                    <div 
                                                        key={index} 
                                                        className='border border-slate-700 rounded-md p-2'
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
                    
                    </div>
                </div>
                <div className='flex flex-col gap-4 justify-center items-center bg-base-300 shadow-xl rounded-2xl py-4 px-8'>
                    <span>Product Ratings</span>
                    <div className='flex w-full justify-center items-center'>
                        <Rating
                            value={product.rating}
                            caption={`${product.numReviews} ratings`}
                        />
                    </div>
                </div>
                <div>
                    <Link 
                        href={`/admin/products/${product.id}`}
                        type='button'
                        className='btn btn-primary'
                    >
                        <Edit />
                        <span>Edit</span>
                    </Link>
                </div>
                
                </div>
            </div>
            
        </div>
        <div className="flex flex-col gap-1 lg:flex-row justify-center items-start w-full">
            <div className='admin-product-details'>
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
            <div className='flex flex-col gap-3 w-full lg:w-1/3 rounded-md shadow-md'>
                <div className='flex justify-center items-center'>
                    <h1 className={`font-bold text-xl ${theme === 'dark' ? 'text-success/80' : ''}`}>Related Products</h1>
                </div>
                <div className='flex flex-col md:flex-row md:flex-wrap lg:flex-col gap-2 px-2'>
                    {relatedProducts && relatedProducts.length > 0 && relatedProducts.map((related) => {
                        return (
                            <AdminProdItem key={related.id} product={related} />
                        )
                    })}
                </div>
            </div>
        </div>
            
        
        
    </>
  )
}

export default Product