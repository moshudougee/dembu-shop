/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import useSWRMutation from 'swr/mutation'
import useSWR from 'swr'
import toast from 'react-hot-toast'
import Link from 'next/link'
import {  useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
//import { Product } from '@/lib/models/ProductModel'
//import { formatId } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { FilePen, ShieldBan, Trash2 } from 'lucide-react'
import { ACCEPTED_FILE_TYPES, MAX_UPLOAD_SIZE } from '@/lib/utils'
import Image from 'next/image'
import ProdImg from '@/public/images/shirt1.jpg'
import FormTextArea from '@/components/form/FormTextArea'
import { checkFeaturedCategory, getProductProperties } from '@/lib/services/propDescServices'
import FormSelect from '@/components/form/FormSelect'
import FormToggle from '@/components/form/FormToggle'
import FormInput from '@/components/form/FormInput'

export default function ProductEditForm({ productId }: { productId: string }) {
  
  const { data: product, error } = useSWR<Product, Error>(`/api/admin/products/${productId}`)
  const { data: categories, error: categoryError } = useSWR<Category[], Error>(`/api/categories`)
  const [productImages, setProductImages] = useState<string[]>(product?.images || [])
  const [created, setCreated] = useState<boolean>(false)
  const [isCreated, setIsCreated] = useState<boolean>(true)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [isCatFeatured, setIsCatFeatured] = useState<boolean>(false)
  const router = useRouter()

  useEffect(() => {
    const createProductProperties = async () => {
      try {
        const response = await fetch(`/api/admin/products/description/${productId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        const data = await response.json()
        if (!response.ok) {
          setCreated(false)
          toast.error(data.message)
        } else {
          setCreated(true)
          toast.success('Product descriptions created successfully')
        }
      } catch (error) {
        console.log(error)
      }
    }
    const checkProperties = async () => {
      const prodProperties = await getProductProperties(parseInt(productId))
      if (!prodProperties || prodProperties.length === 0) {
        setIsCreated(false)
      } else {
        setCreated(true)
      }
    }
    checkProperties()
    if (!isCreated) {
      createProductProperties()
    }
  }, [productId, isCreated])

  const { trigger: updateProduct, isMutating: isUpdating } = useSWRMutation(
    `/api/admin/products/${productId}`,
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

      toast.success('Product updated successfully')
      if (created) {
        router.push(`/admin/products/description/${productId}`)
      } else {
        router.push('/admin/products')
      }
      
    }
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Product>({
    defaultValues: {
      name: '',
      slug: '',
      price: 0,
      images: [],
      category: '',
      isFeatured: false,
      brand: '',
      countInStock: 0,
      description: '',
    },
  })

  useEffect(() => {
    if (!product) return
    setValue('name', product.name)
    setValue('slug', product.slug)
    setValue('price', product.price)
    //setValue('images', product.images)
    setValue('category', product.category)
    setValue('isFeatured', product.isFeatured)
    setValue('brand', product.brand)
    setValue('countInStock', product.countInStock)
    setValue('description', product.description)
    setProductImages(product.images)
    
  }, [product, setValue])
  //console.log(productImages)
  useEffect(() => {
    setValue('images', productImages)
  }, [productImages, setValue])

  const formSubmit = async (formData: any) => {
    await updateProduct(formData)
  }

  // Watch the name field to update the slug
  const productName = watch('name')

  useEffect(() => {
    if (productName) {
      // Generate slug: lowercase and replace spaces with hyphens
      const slug = productName
        .toLowerCase()
        .trim()
        .replace(/[^a-zA-Z0-9]+/g, "-");
      setValue("slug", slug);
    }
  }, [productName, setValue]);

  useEffect(() => {
    const evaluateFeatured = async () => {
      const catFeatured: boolean = await checkFeaturedCategory(product!.category)
      setIsCatFeatured(catFeatured)
    }
    if (product) {
      evaluateFeatured()
    }
  }, [product])

  if (error || categoryError) return error?.message
  if (!product || !categories) return 'Loading...'

 
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
      setProductImages((prev) => {
        return [...prev, imageUrl]
      })
      //setValue('images', productImages)
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

  return (
    <div>
      <h1 className="text-2xl py-4">Edit Product {productId}</h1>
      <div>
        <form onSubmit={handleSubmit(formSubmit)}>
          <FormInput<Product> name="Name" id="name" required register={register} errors={errors} />
          <FormInput<Product> name="Slug" id="slug" required register={register} errors={errors} />
          {/**<FormInput<Product> name="Images" id="images" required register={register} errors={errors} />**/}
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
              Current Images
            </label>
            <div className='flex gap-0.5 md:w-4/5'>
            {productImages.length > 0 ? (productImages.map((img, index) => {
              const handleDeleteImage = () => {
                const updatedImages = productImages.filter((item) => item !== img)
                setProductImages(updatedImages)
              }
              console.log(img)
              return (
                  <div key={index} className="flex relative my-2  w-[102px] h-[102px] rounded shadow-sm">
                    <Image src={img} alt='Product' sizes='100' fill className='object-cover rounded' />
                    <button 
                        className='group absolute p-0.5 m-1 bg-black/50 rounded text-red-700 cursor-pointer'
                        onClick={handleDeleteImage}
                        disabled={isUploading}
                    >
                        <Trash2 />
                        <span className='hover-text bg-black/85'>Delete</span>
                    </button>
                  </div>
              )
            })
            ) : (
              <div  className="relative my-2 w-[102px] h-[102px] rounded shadow-sm">
                <Image src={ProdImg} alt='Product' sizes='100' className='object-cover rounded' />
              </div>
            )
          }
          </div>
           
          </div>
          <FormInput<Product> name="Price" id="price" type='number' required register={register} errors={errors} />
          <FormSelect<Product> name="Category" id="category" items={categories} required register={register} errors={errors} />
          <FormToggle<Product> name='Featured Product' id='isFeatured' register={register} errors={errors} disabled={isCatFeatured} />
          <FormInput<Product> name="Brand" id="brand" required register={register} errors={errors} />
          <FormTextArea<Product> name='Description' id='description' maxLength={500} rows={6} required register={register} errors={errors} />
          <FormInput<Product> name="Count In Stock" id="countInStock" type='number' required register={register} errors={errors} />
          <div className='md:flex mb-6'>
            <div className='md:w-1/5'>
              <button
                type="submit"
                disabled={isUpdating}
                className="btn btn-primary"
              >
                {isUpdating && <span className="loading loading-spinner"></span>}
                
                <FilePen />
                <span>Update & Next</span>
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
