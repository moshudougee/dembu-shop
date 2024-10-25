import AdminLayout from '@/components/admin/AdminLayout'
import React from 'react'
import Properties from './Properties'

export const metadata = {
  title: 'Admin Properties',
}
const AdminPropertiesPage = () => {
  return (
    <AdminLayout activeItem='properties'>
      <Properties />
    </AdminLayout>
  )
}

export default AdminPropertiesPage