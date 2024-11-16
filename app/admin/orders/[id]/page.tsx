import AdminLayout from '@/components/admin/AdminLayout'
import React from 'react'
import OrderDetails from './OrderDetails'

export const generateMetadata = ({ params }: { params: { id: string } }) => {
    return {
      title: `Order ${params.id}`,
    }
  }

const AdminOrderDetails = ({
    params,
  }: {
    params: { id: string }
  }) => {
  return (
    <AdminLayout activeItem='orders'>
        <OrderDetails orderId={params.id} />
    </AdminLayout>
  )
}

export default AdminOrderDetails