import AdminLayout from '@/components/admin/AdminLayout'
import React from 'react'
import ProductDescriptionForm from './Form'

export function generateMetadata({ params }: { params: { id: string } }) {
    return {
      title: `Edit Product Description ${params.id}`,
    }
  }

const ProductDescriptionPage = ({
    params,
  }: {
    params: { id: string }
  }) => {
  return (
    <AdminLayout activeItem='products'>
        <ProductDescriptionForm productId={params.id} />
    </AdminLayout>
  )
}

export default ProductDescriptionPage