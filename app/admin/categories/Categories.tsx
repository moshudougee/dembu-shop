'use client'
import { Switch } from '@/components/ui/switch'
import { ArrowLeftToLine, ArrowRightToLine, CopyPlus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'

const Categories = () => {
    const { data: categories, error } = useSWR(`/api/admin/categories`)
    const [enable, setEnable] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    const router = useRouter()

    const { trigger: deleteCategory } = useSWRMutation(
        `/api/admin/categories`,
        async (url, { arg }: { arg: { categoryId: number } }) => {
            const toastId = toast.loading('Deleting category...')
            const res = await fetch(`${url}/${arg.categoryId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const data = await res.json()
            res.ok
            ? toast.success('Category deleted successfully', {
                id: toastId,
            })
            : toast.error(data.message, {
                id: toastId,
            })
        },
        
    )

    const {trigger: createCategory, isMutating: isCreating} = useSWRMutation(
        '/api/admin/categories',
        async (url) => {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const data = await res.json()
            if (!res.ok) return toast.error(data.message)

            toast.success('Category created successfully')
            router.push(`/admin/categories/${data.category.id}`)
        }
    )

    if (error) return 'An error has occurred.'
    if (!categories) return 'Loading...'

    // Calculate the range of products to display
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedCategories = categories.slice(startIndex, endIndex)
    const totalPages = Math.ceil(categories.length / pageSize)

    return (
        <div>
            <div className='flex justify-between items-center'>
                <h1 className="py-4 text-2xl">Categories</h1>
                <div className='flex gap-2'>
                    <button
                        disabled={isCreating} 
                        onClick={() => createCategory()} 
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
                            <th>ID</th>
                            <th>Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedCategories.map((category: Category) => (
                            <tr key={category.id}>
                                <td>{category.id}</td>
                                <td>{category.name}</td>
                                <td>
                                    <Link
                                        href={`/admin/categories/${category.id}`}
                                        type="button"
                                        className="btn btn-ghost btn-sm"
                                    >
                                        Edit
                                    </Link>
                                    &nbsp;
                                    <button
                                        onClick={() => deleteCategory({ categoryId: category.id! } )}
                                        className="btn btn-danger btn-sm"
                                        disabled={!enable}
                                    >
                                        Delete
                                    </button>
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

export default Categories