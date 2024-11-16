import AdminLayout from '@/components/admin/AdminLayout'
import React from 'react'
import Reviews from './Reviews'
import productService from '@/lib/services/productService'

export const generateMetadata = ({ params }: { params: { id: string } }) => {
    return {
      title: `Customer Reviews for Product ${params.id}`,
    }
  }

const AdminProductReviews = async ({
    params,
  }: {
    params: { id: string }
  }) => {
    const product: Product = await productService.getById(parseInt(params.id))

    if (!product) {
        return <div>Product not found</div>  
    }

  return (
    <AdminLayout activeItem='products'>
        <Reviews product={product}/>
    </AdminLayout>
  )
}

export default AdminProductReviews