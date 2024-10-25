/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { getCatProperties, getProductProperties } from '@/lib/services/propDescServices'
import { CheckSquare, CircleX, Cog, CopyPlus, FilePen, PenBox, ShieldBan } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'

const ProductDescriptionForm = ({ productId }: { productId: string }) => {
    const { data: product, error } = useSWR<Product, Error>(`/api/admin/products/${productId}`)
    const [catProperties, setCatProperties] = useState<Property[]>([])
    const [descriptions, setDescriptions] = useState<Description[]>([])
    const [displayValues, setDisplayValues] = useState<DisplayValues[]>([])
    const [propertyValues, setPropertyValues] = useState<PropertyValue[]>([])
    const [propValue, setPropValue] = useState<PropertyValue>({value: ''})
    const [title, setTitle] = useState<string>('')
    const [valueDesc, setValueDesc] = useState<string | number>('')
    const [productPropertyId, setProductPropertyId] = useState<number>(0)
    const [currentPropertyId, setCurrentPropertyId] = useState<number | null>(null);  // To track the current propertyId
    const [loading, setLoading] = useState<boolean>(false)
    const [isConclusion, setIsConclusion] = useState(false)
    const [active, setActive] = useState<number>(0)

    const router = useRouter()
    
    
    // Fetch product category properties
    useEffect(() => {
        const fetchCatProperties = async () => {
          try {
            setLoading(true);
            const propertiesData = await getCatProperties(product!.category);
            setCatProperties(propertiesData);
          } catch (error) {
            console.log(error);
          }
        };
      
        const fetchProductProperties = async () => {
          try {
            const propertyData: ProductProperty = await getProductProperties(product!.id!);
            setDescriptions(propertyData.description);
            setProductPropertyId(propertyData?.id || 0);
            
            if (propertyData.description.length > 0) {
              // Collect all display values first, then set them at once
              const newDisplayValues = propertyData.description.map((data) => ({
                propertyId: data.propertyId,
                values: data.values!,
              }));
              setDisplayValues(newDisplayValues); // Update state with collected values
            }
          } catch (error) {
            console.log(error);
          }
        };
      
        if (product) {
          fetchCatProperties();
          fetchProductProperties();
        }
      
        setLoading(false); // Only set loading to false after both fetches
      }, [product]);
      

    const { trigger: updateProductProperties, isMutating: isUpdating } = useSWRMutation(
        `/api/admin/products/description/${productPropertyId}`,
        async (url, { arg }) => {
            const res = await fetch(`${url}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(arg),
            })
            const data = await res.json()
            if (!res.ok) return toast.error(data.message)

            toast.success('Product properties updated successfully')
            router.push(`/admin/products`)
        }
    )

    const { handleSubmit, setValue } = useForm<ProductProperty>({
        defaultValues: {
             description: descriptions,
        },
    })

    const formSubmit = async (formData: any) => {
        try {
            await updateProductProperties(formData)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        setValue('description', descriptions)
    }, [descriptions, setValue])

    

    useEffect(() => {
        const getDescValues = (propertyId: number): DisplayValues | null => {
            if (displayValues.length > 0) {
              const descValues = displayValues.find((item) => item.propertyId === propertyId)
              if (descValues) {
                return descValues
              } else {
                return null
              }  
            }
            return null
        }
        if (active !== null && active >= 0) {
            const currentProperty = catProperties[active];
            if (currentProperty) {
                const descValues = getDescValues(currentProperty.id!);
                if (descValues) {
                  setPropertyValues(descValues.values!);
                } 
            }
        }
    }, [active, catProperties])

    const addPropertyValues = (propertyId: number) => {
        if (valueDesc !== '') {
            setIsConclusion(false)
            setCurrentPropertyId(propertyId); // Store propertyId in state
            setPropValue({title: title, value: valueDesc})
            
        }
    }

    // Trigger when propValue is updated
    useEffect(() => {
        // Only proceed if propValue is valid
    if (propValue.value !== '') {
        const valueExists = propertyValues.some(item => item["value"] === propValue.value);
        const titleExists = propValue.title !== '' && propertyValues.some(item => item["title"] === propValue.title && 
                            item["value"] === propValue.value);

        if (isConclusion) {
            setPropertyValues([propValue]);
        } else if (!valueExists && (propValue.title === '' || !titleExists)) {
            // Add new value only if it doesn't already exist
            setPropertyValues((prev) => [...prev, propValue]);
        }

        // Reset input fields
        setTitle('');
        setValueDesc('');
    }
    }, [propValue]);

    // Trigger when propertyValues is updated

    useEffect(() => {
        if (currentPropertyId !== null) {
            if (propertyValues.length > 0) {
                // Update or add the property values for the current propertyId
                if (displayValues.some(item => item["propertyId"] === currentPropertyId)) {
                    const updatedDisplayValues = displayValues.map((item) => {
                        if (item.propertyId === currentPropertyId) {
                            return { ...item, values: propertyValues };
                        }
                        return item;
                    });
                    setDisplayValues(updatedDisplayValues);
                } else {
                    const newDisplayValue: DisplayValues = {
                        propertyId: currentPropertyId,
                        values: propertyValues,
                    };
                    setDisplayValues((prev) => [...prev, newDisplayValue]);
                }
            } else {
                // Remove the entry from displayValues when propertyValues is empty
                setDisplayValues((prev) => prev.filter(item => item.propertyId !== currentPropertyId));
            }
        }
        
        setPropValue({value: ''})
    }, [propertyValues])

    const propertyValuesDone = (propertyId: number, hasTitle: boolean, fixedValues: boolean) => {
        if(descriptions.some(item => item["propertyId"] === propertyId)) {
            const updatedDescriptions = descriptions.map((desc) => {
                if (desc.propertyId === propertyId) {
                    return {...desc, values: propertyValues}
                }
                return desc
            })
            setDescriptions(updatedDescriptions)
            if (active !== catProperties.length -1) {
                setCurrentPropertyId(null)
                setActive(active + 1) 
            } else {
                setCurrentPropertyId(null)
                setActive(active - 1)
            } 

        } else {
            const newDescription: Description = {
                propertyId,
                hasTitle,
                fixedValues,
                values: propertyValues,
            }
            setDescriptions(prev => {
                return [...prev, newDescription]
            })
            if (active !== catProperties.length -1) {
                setCurrentPropertyId(null)
                setActive(active + 1) 
            } else {
                setCurrentPropertyId(null)
                setActive(active - 1)
            } 
        }

        
        setPropertyValues([])
    }


    const addConclusion = (propertyId: number) => {
        if (valueDesc !== '') {
            setIsConclusion(true)
            setCurrentPropertyId(propertyId); // Store propertyId in state
            setPropValue({title: title, value: valueDesc})
        }
    }

    const activateProperty = (index: number, propertyId: number) => {
        setCurrentPropertyId(propertyId)
        setActive(index)
    }

    const deleteProperty = (propertyId: number, hasTitle: boolean, title: string, value: string | number) => {
        setCurrentPropertyId(propertyId)

        setPropertyValues((prev) => {
            return prev.filter(item => {
                if (hasTitle) {
                    return item["title"] !== title || item["value"] !== value
                } else {
                    return item["value"] !== value
                }
            })
        })
    }
    
    
    if (error) return error.message
    if (!product || loading) return 'Loading...'

  return (
    <div>
        <h1 className="text-2xl py-4">Edit Product {productId}</h1>
        <div>
            <form onSubmit={handleSubmit(formSubmit)}>
                <div className='flex flex-col'>
                    {catProperties.length > 0 &&  catProperties.map((property, index) => {
                        const descValues = displayValues?.find(item => item.propertyId === property.id)
                        const disabled = active !== index
                       
                        return (
                            <div key={property.id} className='flex flex-col'>
                                { property.fixedValues ? (
                                    <div className='flex flex-col w-full'>
                                        <div className='md:flex mb-6'>
                                            <label className='label md:w-1/5'>{property?.name}</label>
                                            <div className='md:w-4/5 flex flex-wrap gap-2 max-h[300px] overflow-y-scroll custom-scrollbar'>
                                                {descValues && descValues.values?.map((desc, index) => {
                                                    return (
                                                        <div key={desc.value} className='flex gap-1 items-center'>
                                                            <span>{desc.value}</span>
                                                            <button 
                                                                type='button' 
                                                                className='btn btn-xs btn-square btn-outline text-error ms-3' 
                                                                disabled={disabled}
                                                                onClick={() => deleteProperty(property.id!, false, desc.title!, desc.value)}
                                                            >
                                                                <CircleX size={16} />
                                                            </button>
                                                            <span>
                                                                {index!== descValues.values!.length -1? ',' : null}
                                                            </span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                        <div className='md:flex mb-6'>
                                            <label className='label md:w-1/5'>{property?.name} Values</label>
                                            <div className='md:w-4/5'>
                                                <select
                                                    id={property.name}
                                                    value={!disabled ? valueDesc : ''}
                                                    onChange={(e) => setValueDesc(e.target.value)}
                                                >
                                                    <option value=''>Select from the list</option>
                                                    {property.values?.map((item) => (
                                                        <option key={item} value={item}>{item}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className='md:flex mb-6'>
                                            <label className='label md:w-1/5'>Add each value</label>
                                            <div className='md:w-4/5 flex gap-2'>
                                                <button 
                                                    type='button' 
                                                    disabled={disabled} 
                                                    className='btn btn-primary gap-1'
                                                    onClick={() => addPropertyValues(property.id!)}
                                                >
                                                    <CopyPlus />
                                                    <span>Add</span>
                                                </button>
                                                <button 
                                                    type='button' 
                                                    disabled={disabled} 
                                                    className='btn btn-success gap-1'
                                                    onClick={() => propertyValuesDone(property.id!, false, true)}
                                                >
                                                    <CheckSquare />
                                                    <span>Finish</span>
                                                </button>
                                                <button
                                                    type='button' 
                                                    disabled={!disabled} 
                                                    className='btn btn-success gap-1'
                                                    onClick={() => activateProperty(index, property.id!)}
                                                >
                                                    <Cog />
                                                    <span>Edit</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) :
                                property.hasTitle ? (
                                    <div className='flex flex-col w-full'>
                                        <div className='md:flex mb-6'>
                                            <label className='label md:w-1/5'>{property.name} Values</label>
                                            <div className='md:w-4/5 flex flex-col gap-2 max-h-[320px] overflow-y-scroll custom-scrollbar'>
                                                {descValues && descValues.values?.map((desc) => {
                                                    return (
                                                        <div key={desc.value} className='flex flex-col'>
                                                            <div className='flex w-full items-center py-2'>
                                                                <span className='font-semibold w-2/12'>• {desc.title}</span>
                                                                <span className='w-9/12'>{desc.value}</span>
                                                                <button 
                                                                    type='button' 
                                                                    className='btn btn-xs btn-square btn-outline text-error ms-3' 
                                                                    disabled={disabled}
                                                                    onClick={() => deleteProperty(property.id!, true, desc.title!, desc.value)}
                                                                >
                                                                    <CircleX size={16} />
                                                                </button>
                                                            </div>
                                                            <hr className='flex-grow mx-20 border-slate-600' />
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                        <div className='md:flex mb-6'>
                                            <label className='label md:w-1/5'>Enter {property.name} values</label>
                                            <div className='md:w-4/5 flex flex-col gap-1'>
                                                <input
                                                    type='text'
                                                    placeholder='Enter title'
                                                    value={!disabled ? title : ''}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    className='input input-bordered w-full max-w-md'
                                                />
                                                <textarea 
                                                    rows={5}
                                                    placeholder='Enter description'
                                                    value={!disabled ? valueDesc : ''}
                                                    onChange={(e) => setValueDesc(e.target.value)}
                                                    className='textarea textarea-bordered w-full max-w-md'
                                                />
                                            </div>
                                        </div>
                                        <div className='md:flex mb-6'>
                                            <label className='label md:w-1/5'>Add each value</label>
                                            <div className='md:w-4/5 flex gap-2'>
                                                <button 
                                                    type='button' 
                                                    disabled={disabled} 
                                                    className='btn btn-primary gap-1'
                                                    onClick={() => addPropertyValues(property.id!)}
                                                >
                                                    <CopyPlus />
                                                    <span>Add</span>
                                                </button>
                                                <button 
                                                    type='button' 
                                                    disabled={disabled} 
                                                    className='btn btn-success gap-1'
                                                    onClick={() => propertyValuesDone(property.id!, true, false)}
                                                >
                                                    <CheckSquare />
                                                    <span>Finish</span>
                                                </button>
                                                <button
                                                    type='button' 
                                                    disabled={!disabled} 
                                                    className='btn btn-success gap-1'
                                                    onClick={() => activateProperty(index, property.id!)}
                                                >
                                                    <Cog />
                                                    <span>Edit</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) :
                                property.name === 'Conclusion' ? (
                                    <div className='flex flex-col w-full'>
                                        <div className='md:flex mb-6'>
                                            <label className='label md:w-1/5'>{property.name}</label>
                                            <div className='md:w-4/5 flex gap-1 items-center'>
                                                <span>{descValues?.values![0].value}</span>
                                                <button type='button' className='text-error' disabled={true}>
                                                    <CircleX />
                                                </button>
                                            </div>
                                        </div>
                                        <div className='md:flex mb-6'>
                                            <label className='label md:w-1/5'>Edit {property.name}</label>
                                            <div className='md:w-4/5'>
                                                <textarea 
                                                    rows={5}
                                                    placeholder='Enter conclusion'
                                                    value={!disabled ? valueDesc : ''}
                                                    onChange={(e) => setValueDesc(e.target.value)}
                                                    className='textarea textarea-bordered w-full max-w-md'
                                                />
                                            </div>
                                        </div>
                                        <div className='md:flex mb-6'>
                                            <label className='label md:w-1/5'>Update Conclusion</label>
                                            <div className='md:w-4/5 flex gap-1'>
                                                <button
                                                    type='button'
                                                    disabled={disabled}
                                                    className='btn btn-primary gap-1'
                                                    onClick={() => addConclusion(property.id!)}
                                                >
                                                    <PenBox />
                                                    <span>Update</span>
                                                </button>
                                                <button
                                                    type='button'
                                                    disabled={disabled} 
                                                    className='btn btn-success gap-1'
                                                    onClick={() => propertyValuesDone(property.id!, false, false)}
                                                >
                                                    <CheckSquare />
                                                    <span>Finish</span>
                                                </button>
                                                <button
                                                    type='button' 
                                                    disabled={!disabled} 
                                                    className='btn btn-success gap-1'
                                                    onClick={() => activateProperty(index, property.id!)}
                                                >
                                                    <Cog />
                                                    <span>Edit</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className='flex flex-col w-full'>
                                        <div className='md:flex mb-6'>
                                            <label className='label md:w-1/5'>{property.name} Values</label>
                                            <div className='md:w-4/5 flex flex-wrap gap-2 max-h-[300px] overflow-y-scroll custom-scrollbar'>
                                                {descValues && descValues.values?.map((desc, index) => {
                                                    return (
                                                        <div key={desc.value} className='flex gap-1 items-center'>
                                                            <span>{desc.value}</span>
                                                            <button 
                                                                type='button' 
                                                                className='btn btn-xs btn-square btn-outline text-error ms-3' 
                                                                disabled={disabled}
                                                                onClick={() => deleteProperty(property.id!, false, desc.title!, desc.value)}
                                                            >
                                                                <CircleX size={16} />
                                                            </button>
                                                            <span>{index!== descValues.values!.length -1? ',' : null}</span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                        <div className='md:flex mb-6'>
                                            <label className='label md:w-1/5'>Enter values</label>
                                            <div className='md:w-4/5'>
                                                <input 
                                                   type='text'
                                                   placeholder='Enter value'
                                                   value={!disabled ? valueDesc : ''}
                                                   onChange={(e) => setValueDesc(e.target.value)}
                                                   className='input input-bordered w-full max-w-md' 
                                                />
                                            </div>
                                        </div>
                                        <div className='md:flex mb-6'>
                                            <label className='label md:w-1/5'>Add each value</label>
                                            <div className='md:w-4/5 flex gap-1'>
                                                <button 
                                                    type='button' 
                                                    disabled={disabled} 
                                                    className='btn btn-primary gap-1'
                                                     onClick={() => addPropertyValues(property.id!)}
                                                >
                                                    <CopyPlus />
                                                    <span>Add</span>
                                                </button>
                                                <button 
                                                    type='button' 
                                                    disabled={disabled} 
                                                    className='btn btn-success gap-1'
                                                    onClick={() => propertyValuesDone(property.id!, false, false)}
                                                >
                                                    <CheckSquare />
                                                    <span>Finish</span>
                                                </button>
                                                <button
                                                    type='button' 
                                                    disabled={!disabled} 
                                                    className='btn btn-success gap-1'
                                                    onClick={() => activateProperty(index, property.id!)}
                                                >
                                                    <Cog />
                                                    <span>Edit</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
                <div className='md:flex mb-6'>
                    <div className='md:w-1/5'>
                        <button
                            type="submit"
                            disabled={isUpdating}
                            className="btn btn-primary"
                        >
                            {isUpdating && <span className="loading loading-spinner"></span>}
                            
                            <FilePen />
                            <span>Update</span>
                        </button>
                    </div>
                    <Link className="btn ml-4 " href="/admin/products">
                        <ShieldBan />
                        <span>Cancel</span>
                    </Link>
                </div>
            </form>
        </div>
    </div>
  )
}

export default ProductDescriptionForm