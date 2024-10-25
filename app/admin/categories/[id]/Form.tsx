/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import FormInput from '@/components/form/FormInput'
import { ACCEPTED_FILE_TYPES, MAX_UPLOAD_SIZE } from '@/lib/utils'
import { CircleX, CopyPlus, LucideFilePen, ShieldBan } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'

const CategoryEditForm = ({ categoryId }: { categoryId: string }) => {
    const { data: category, error } = useSWR(`/api/admin/categories/${categoryId}`)
    const { data: properties, error: properror } = useSWR('/api/admin/properties')
    const [catProperties, setCatProperties] = useState<number[]>([])
    const [singleProperty, setSingleProperty] = useState<number>(0)
    const [isUploading, setIsUploading] = useState<boolean>(false)
    const router = useRouter()

    const { trigger: updateCategory, isMutating: isUpdating } = useSWRMutation(
        `/api/admin/categories/${categoryId}`,
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

            toast.success('Category updated successfully')
            router.push('/admin/categories')
        }
    )

    const getPropertyName = (id: number) : string => {
      if (!properties) return ''
      const property = properties.find((p: Property) => p.id === id)
      return property? property.name : ''
    }

    const addProperty = () => {
      setCatProperties((prev) => {
        if (singleProperty > 0 && !prev.includes(singleProperty)) {
          return [...prev, singleProperty]
        }
        return prev
      })
      setSingleProperty(0)
    }

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
      } = useForm<Category>({
        defaultValues: {
          name: category?.name || '',
          description: category?.description || '',
          banner: category?.banner || '',
          properties: category?.properties || [],
        },
    })

    useEffect(() => {
        if (!category) return
        setValue('name', category.name)
        setValue('description', category.description)
        setValue('banner', category.banner)
        setCatProperties(category.properties)
    }, [category, setValue])

    useEffect(() => {
      setValue('properties', catProperties)
    }, [catProperties, setValue])


    const onSubmit = async (formData: any) => {
        await updateCategory(formData)
    }

    const uploadHandler = async (e: any) => {
      const toastId = toast.loading('Uploading image...')
      setIsUploading(true)
      try {
        const resSign = await fetch('/api/cloudinary-sign', {
          method: 'POST',
        })
        const { signature, timestamp } = await resSign.json()
        const file = e.target.files[0]
        if (!file) {
          toast.error('Please select an image', {
            id: toastId,
          })
          return
        }
        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
          toast.error('Invalid file type, Image must be a PNG, JPG, JPEG, GIF or WEBP Image type', {
            id: toastId,
          })
          return
        }
        if (file.size > MAX_UPLOAD_SIZE) {
          toast.error('Image size must be less than 2MB', {
            id: toastId,
          })
          return
        }
        const formData = new FormData()
        formData.append('file', file)
        formData.append('signature', signature)
        formData.append('timestamp', timestamp)
        formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!)
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
          {
            method: 'POST',
            body: formData,
          }
        )
        const data = await res.json()
        const imageUrl = data.secure_url
        
        setValue('banner', imageUrl)
        toast.success('File uploaded successfully', {
          id: toastId,
        })
      } catch (err: any) {
        toast.error(err.message, {
          id: toastId,
        })
      } finally {
        setIsUploading(false)
      }
    }

    const bannerImage = watch('banner')

    if (error || properror) return error.message
    if (!category || !properties) return 'Loading...'

    
  return (
    <div>
        <h1 className='text-2xl py-4'>Edit Category {category.id}</h1>
        <div>
            <form onSubmit={handleSubmit(onSubmit)}>
                <FormInput<Category> name='Name' id='name' required register={register} errors={errors}/>
                <FormInput<Category> name='Description' id='description' required register={register} errors={errors}/>
                <div className="md:flex mb-6">
                  <label className="label md:w-1/5" htmlFor="imageFile">
                    Upload Image
                  </label>
                  <div className="md:w-4/5">
                    <input
                      type="file"
                      className="file-input w-full max-w-md"
                      id="imageFile"
                      onChange={uploadHandler}
                      disabled={isUploading}
                    />
                  </div>
                </div>
                <div className='md:flex mb-6'>
                  <label className='label md:w-1/5'>
                    Current Banner
                  </label>
                  <div className='flex gap-1 md:w-4/5'>
                    {bannerImage && 
                      <div className='relative flex w-[400px] h-[100px] md:w-[800px] md:h-[200px]'>
                        <Image 
                          src={bannerImage} 
                          alt='banner'
                          fill
                          className='object-cover rounded'
                          priority 
                        />
                      </div>
                    }
                  </div>
                </div>
                <div className='flex flex-col'>
                  <div className='md:flex mb-6'>
                    <label className='label md:w-1/5'>
                      Properties
                    </label>
                    <div className='flex flex-wrap gap-3 md:w-4/5'>
                      {catProperties.map((item, index) => {
                        const name = getPropertyName(item)
                        return(
                          <div key={item} className='flex gap-1'>
                            <span>{name}</span>
                            <span className='text-error cursor-pointer'>
                              <CircleX onClick={() => setCatProperties(catProperties.filter((p) => p!== item))}/>
                            </span>
                            <span>{index !== catProperties.length -1 ? ',' : null}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div className='md:flex mb-6'>
                    <label className='label md:w-1/5'>
                      Select Properties
                    </label>
                    <div className='flex gap-3 md:w-4/5'>
                      <select
                        id='properties'
                        value={singleProperty}
                        onChange={(e) => setSingleProperty(parseInt(e.target.value))}
                        className='select select-bordered w-full max-w-md'
                      >
                        <option value={0}>Select Property</option>
                        {properties.map((property: Property) => (
                          <option key={property.id} value={property.id}>
                            {property.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className='md:flex mb-6'>
                    <label className='label md:w-1/5'>Add each selected Property</label>
                    <button type='button' className='btn btn-primary gap-1' onClick={addProperty}>
                      <CopyPlus />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
                <div className='md:flex mb-6'>
                  <div className='md:w-1/5 justify-center'>
                    <button
                        className='btn btn-primary'
                        type='submit'
                        disabled={isUpdating}
                    >
                        {isUpdating && <span className="loading loading-spinner"></span>}
                        <LucideFilePen />
                        <span>Update</span>
                    </button>
                  </div>
                  <Link className="btn" href="/admin/categories">
                      <ShieldBan />
                      <span>Cancel</span>
                  </Link>
                </div>
            </form>
        </div>
    </div>
  )
}

export default CategoryEditForm