'use client'
import { ArrowLeftToLine, ArrowRightToLine } from 'lucide-react'
//import { Order } from '@/lib/models/OrderModel'
import Link from 'next/link'
import { useState } from 'react'
import useSWR from 'swr'

export default function Orders() {
  const { data: orders, error } = useSWR(`/api/admin/orders`)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  if (error) return 'An error has occurred.'
  if (!orders) return 'Loading...'

  // Calculate the range of orders to display
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedOrders = orders.slice(startIndex, endIndex)
  const totalPages = Math.ceil(orders.length / pageSize)

  return (
    <div>
      <h1 className="py-4 text-2xl">Orders</h1>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>USER</th>
              <th>DATE</th>
              <th>TOTAL</th>
              <th>PAID</th>
              <th>DELIVERED</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((order: Order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.user?.name || 'Deleted user'}</td>
                <td>{order.createdAt}</td>
                <td>${order.totalPrice}</td>
                <td>
                  {order.isPaid && order.paidAt
                    ? `${order.paidAt}`
                    : 'not paid'}
                </td>
                <td>
                  {order.isDelivered && order.deliveredAt
                    ? `${order.deliveredAt}`
                    : 'not delivered'}
                </td>
                <td>
                  <Link href={`/admin/orders/${order.id}`} passHref>
                    Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      {totalPages > 1 && 
        <div className="flex justify-center items-center space-x-4 mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="btn btn-success w-32"
          >
            <ArrowLeftToLine />
            <span>Previous</span>
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="btn btn-success w-32"
          >
            <span>Next</span>
            <ArrowRightToLine />
          </button>
        </div>
      }
    </div>
  )
}
