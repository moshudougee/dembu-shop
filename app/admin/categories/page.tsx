import AdminLayout from '@/components/admin/AdminLayout'
import React from 'react'
import Categories from './Categories'

export const metadata = {
    title: 'Admin Categories',
}

const AdminCategoriesPage = () => {
  return (
    <AdminLayout activeItem='categories'>
        <Categories />
    </AdminLayout>
  )
}

export default AdminCategoriesPage

