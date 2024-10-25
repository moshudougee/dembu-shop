/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import FormInput from '@/components/form/FormInput'
import { CircleX, CopyPlus, FilePen, ShieldBan } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'

const PropertyEditForm = ({ propertyId }: { propertyId: string }) => {
    // Add form logic to edit property with given id
    const { data: property, error } = useSWR(`/api/admin/properties/${propertyId}`)
    const [values, setValues] = useState<string[]>(property?.values || [])
    const [singleValue, setSingleValue] = useState<string>('')
    const [hasTitle, setHasTitle] = useState<boolean>(property?.hasTitle || false)
    const [fixedValues, setFixedValues] = useState<boolean>(property?.fixedValues || false)

    const isNumber = (str: string) : boolean => {
        return !isNaN(Number(str));
    }
    const [typeOfValues, setTypeOfValues] = useState<string>(isNumber(values[0]) ? 'number' : 'text')
    const router = useRouter()

    

    const { trigger: updateProperty, isMutating: isUpdating } = useSWRMutation(
        `/api/admin/properties/${propertyId}`,
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
                
            toast.success('Property updated successfully')
            router.push('/admin/properties')
        }
    )

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue
    } = useForm<Property>({
        defaultValues: {
            name: property?.name || '',
            values: property?.values || values,
            hasTitle: property?.hasTitle || false,
            fixedValues: property?.fixedValues || fixedValues,
        },
    })

    useEffect(() => {
        if (!property) return
        setValue('name', property.name)
        setValues(property.values)
        setHasTitle(property.hasTitle)
        setFixedValues(property.fixedValues)
    }, [property, setValue])

    useEffect(() => {
        setValue('values', values)
    },[values, setValue])

    useEffect(() => {
        setValue('fixedValues', fixedValues)
    }, [fixedValues, setValue])

    useEffect(() => {
        setValue('hasTitle', hasTitle)
    }, [hasTitle, setValue])

    const formSubmit = async (formData: any) => {
        await updateProperty(formData)
    }

    const addValue = () => {
        if (!singleValue) return
        setValues((prev) => {
            if (prev.includes(singleValue)) {
                return prev
            }
            return [...prev, singleValue]
        })
        setSingleValue('')
    }

    if (error) return error.message
    if (!property) return 'Loading...'

  return (
    <div>
        <h1 className="text-2xl py-4">Edit Property {propertyId}</h1>
        <div>
            <form onSubmit={handleSubmit(formSubmit)}>
                <FormInput<Property> name='Name' id='name' required register={register} errors={errors} />
                <div className='md:flex mb-6'>
                    <label className='label md:w-1/5'>
                        Has Title
                    </label>
                    <div className='md:w-4/5'>
                        <input 
                            type='checkbox'
                            className='toggle'
                            checked={hasTitle}
                            onChange={() => setHasTitle(!hasTitle)}
                            disabled={fixedValues}
                        />
                    </div>
                </div>
                <div className='md:flex mb-6'>
                    <label className='label md:w-1/5'>
                        Fixed Values
                    </label>
                    <div className='md:w-4/5'>
                        <input 
                            type='checkbox'
                            className='toggle'
                            checked={fixedValues}
                            onChange={() => setFixedValues(!fixedValues)}
                            disabled={hasTitle}
                        />
                    </div>
                </div>
                {fixedValues && (
                    <div className='flex flex-col gap-1'>
                        <div className='md:flex mb-6'>
                            <span className='label md:w-1/5'>Values: </span>
                            <div className='flex flex-wrap md:w-4/5 gap-3'>
                            {values.map((value, index) => {
                                return (
                                    <div key={value} className='flex gap-1'>
                                        <span>{value}</span>
                                        <span className='text-error cursor-pointer'>
                                            <CircleX onClick={() => setValues(values.filter((item) => item!== value))} />
                                        </span>
                                        <span>{index !== values.length -1 ? ',' : null}</span>
                                    </div>
                                )
                            })}
                            </div>
                        </div>
                        <div className='md:flex mb-6'>
                            <label className='label md:w-1/5'>
                                Type of Value
                            </label>
                            <div className='flex md:w-4/5'>
                                <div className='flex w-1/4 gap-2'>
                                    <input 
                                        type='radio'
                                        name='typeOfValue'
                                        value='text'
                                        checked={typeOfValues === 'text'}
                                        onChange={(e) => setTypeOfValues(e.target.value)}
                                        className='radio'  
                                    />
                                    <span>Text & Numbers</span>
                                </div>
                                <div className='flex w-1/4 gap-2'>
                                    <input 
                                        type='radio'
                                        name='typeOfValue'
                                        value='number'
                                        checked={typeOfValues === 'number'}
                                        onChange={(e) => setTypeOfValues(e.target.value)}
                                        className='radio'  
                                    />
                                    <span>Numbers Only</span>
                                </div>
                            </div>
                        </div>
                        <div className='md:flex mb-6'>
                            <label className='label md:w-1/5'>
                                Value
                            </label>
                            <div className='md:w-4/5'>
                                <input 
                                    type={typeOfValues}
                                    className='input input-bordered w-full max-w-md'
                                    value={singleValue}
                                    onChange={(e) => setSingleValue(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className='md:flex mb-6 gap-2'>
                            <span className='label md:w-1/5'>Add each new value </span>
                            <button type='button' className='btn btn-primary' onClick={addValue}>
                                <CopyPlus />
                                <span>Add</span>
                            </button>
                        </div>
                    </div>
                )}
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
                    <Link className="btn" href="/admin/properties">
                        <ShieldBan />
                        <span>Cancel</span>
                    </Link>
                </div>
            </form>
        </div>
    </div>
  )
}

export default PropertyEditForm