'use client'
import { Switch } from '@/components/ui/switch'
import { ArrowLeftToLine, ArrowRightToLine, CopyPlus } from 'lucide-react'
//import { Product } from '@/lib/models/ProductModel'
//import { formatId } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'

export default function Products() {
  const { data: products, error } = useSWR(`/api/admin/products`)
  const [enable, setEnable] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const router = useRouter()

  const { trigger: deleteProduct } = useSWRMutation(
    `/api/admin/products`,
    async (url, { arg }: { arg: { productId: number } }) => {
      const toastId = toast.loading('Deleting product...')
      const res = await fetch(`${url}/${arg.productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await res.json()
      res.ok
        ? toast.success('Product deleted successfully', {
            id: toastId,
          })
        : toast.error(data.message, {
            id: toastId,
          })
    }
  )

  const { trigger: createProduct, isMutating: isCreating } = useSWRMutation(
    `/api/admin/products`,
    async (url) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await res.json()
      if (!res.ok) return toast.error(data.message)

      toast.success('Product created successfully')
      router.push(`/admin/products/${data.product.id}`)
    }
  )

  if (error) return 'An error has occurred.'
  if (!products) return 'Loading...'

   // Calculate the range of products to display
   const startIndex = (currentPage - 1) * pageSize
   const endIndex = startIndex + pageSize
   const paginatedProducts = products.slice(startIndex, endIndex)
   const totalPages = Math.ceil(products.length / pageSize)

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="py-4 text-2xl">Products</h1>
        <div className='flex gap-2'>
          <button
            disabled={isCreating}
            onClick={() => createProduct()}
            className="btn btn-primary btn-sm"
          >
            {isCreating && <span className="loading loading-spinner"></span>}
            <CopyPlus size={16} />
            <span>Create</span>
          </button>
          <div className='flex items-center space-x-2'>
            <Switch 
              id='enable-delete'
              checked={enable}
              onCheckedChange={() => setEnable(!enable)}
            />
            <label htmlFor="enable-delete">Enable Delete</label>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th>id</th>
              <th>name</th>
              <th>price</th>
              <th>category</th>
              <th>count in stock</th>
              <th>rating</th>
              <th>actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product: Product) => { 
              let formatedName = ''
              if (product.name.length > 50) {
                formatedName = product.name.substring(0, 50) + '...'
              } else {
                formatedName = product.name  // Keep the original name if it's short enough
              }
              return(
              <tr key={product.id}>
                <td>{product.id!}</td>
                <td>
                  <Link href={`/admin/products/details/${product.id}`}>
                    {formatedName}
                  </Link>
                </td>
                <td>${product.price}</td>
                <td>{product.category}</td>
                <td>{product.countInStock}</td>
                <td>{product.rating}</td>
                <td>
                  <Link
                    href={`/admin/products/${product.id}`}
                    type="button"
                    className="btn btn-ghost btn-sm"
                  >
                    Edit
                  </Link>
                  &nbsp;
                  <button
                    onClick={() => deleteProduct({ productId: product.id! })}
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={!enable}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            )})}
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
