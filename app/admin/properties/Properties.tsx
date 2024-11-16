'use client'
import { Switch } from '@/components/ui/switch'
import { ArrowLeftToLine, ArrowRightToLine, CopyPlus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'

const Properties = () => {
    const { data: properties, error } = useSWR(`/api/admin/properties`)
    const [enable, setEnable] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10

    const router = useRouter()

    const { trigger: deleteProperty } = useSWRMutation(
        `/api/admin/properties`,
        async (url, { arg }: { arg: { propertyId: number } }) => {
            const toastId = toast.loading('Deleting property...')
            const res = await fetch(`${url}/${arg.propertyId}`, {
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

    const { trigger: createProperty, isMutating: isCreating } = useSWRMutation(
        `/api/admin/properties`,
        async (url) => {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
            const data = await res.json()
            if (!res.ok) return toast.error(data.message)

            toast.success('Property created successfully')
            router.push(`/admin/properties/${data.property.id}`)
        }
    )

    if (error) return 'An error has occurred.'
    if (!properties) return 'Loading...'
    // Calculate the range of properties to display
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedProperties = properties.slice(startIndex, endIndex)
    const totalPages = Math.ceil(properties.length / pageSize)

    return (
        <div>
            <div className="flex justify-between items-center">
                <h1 className="py-4 text-2xl">Properties</h1>
                <div className='flex gap-2'>
                    <button
                        disabled={isCreating}
                        onClick={() => createProperty()}
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
                        {paginatedProperties.map((property: Property) => (
                            <tr key={property.id}>
                                <td>{property.id!}</td>
                                <td>{property.name}</td>
                                <td>
                                    <Link
                                        href={`/admin/properties/${property.id}`}
                                        type="button"
                                        className="btn btn-ghost btn-sm"
                                    >
                                        Edit
                                    </Link>
                                    &nbsp;
                                    <button
                                        disabled={isCreating ||!enable}
                                        onClick={() => deleteProperty({ propertyId: property.id! } )}
                                        type="button"
                                        className="btn btn-danger btn-sm"
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

export default Properties