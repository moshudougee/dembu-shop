import AdminLayout from '@/components/admin/AdminLayout'
import React from 'react'
import PropertyEditForm from './Form'

export function generateMetadata({ params }: { params: { id: string } }) {
    return {
      title: `Edit Property ${params.id}`,
    }
  }

const PropertyEditPage = ({
    params,
  }: {
    params: { id: string }
  }) => {
  return (
    <AdminLayout activeItem='properties'>
        <PropertyEditForm propertyId={ params.id } />
    </AdminLayout>
  )
}

export default PropertyEditPage