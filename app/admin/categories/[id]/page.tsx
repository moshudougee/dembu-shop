import AdminLayout from '@/components/admin/AdminLayout'
import React from 'react'
import CategoryEditForm from './Form'

export function generateMetadata({ params }: { params: { id: string } }) {
    return {
      title: `Edit Category ${params.id}`,
    }
}

const CategoryEditPage = ({
    params,
  }: {
    params: { id: string }
  }) => {
  return (
    <AdminLayout activeItem='categories'>
        <CategoryEditForm categoryId={ params.id } />
    </AdminLayout>
  )
}

export default CategoryEditPage