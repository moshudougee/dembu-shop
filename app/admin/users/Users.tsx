'use client'
import { Switch } from '@/components/ui/switch'
import { ArrowLeftToLine, ArrowRightToLine } from 'lucide-react'
//import { User } from '@/lib/models/UserModel'
//import { formatId } from '@/lib/utils'
import Link from 'next/link'
import { useState } from 'react'
import toast from 'react-hot-toast'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'

export default function Users() {
  const { data: users, error } = useSWR(`/api/admin/users`)
  const [enable, setEnable] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const { trigger: deleteUser } = useSWRMutation(
    `/api/admin/users`,
    async (url, { arg }: { arg: { userId: string } }) => {
      const toastId = toast.loading('Deleting user...')
      const res = await fetch(`${url}/${arg.userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const data = await res.json()
      res.ok
        ? toast.success('User deleted successfully', {
            id: toastId,
          })
        : toast.error(data.message, {
            id: toastId,
          })
    }
  )
  if (error) return 'An error has occurred.'
  if (!users) return 'Loading...'

  // Calculate the range of users to display
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedUsers = users.slice(startIndex, endIndex)
  const totalPages = Math.ceil(users.length / pageSize)

  return (
    <div>
      <div className='flex justify-between items-center'>
        <h1 className="py-4 text-2xl">Users</h1>
        <div className='flex gap-2'>
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
              <th>email</th>
              <th>admin</th>
              <th>actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user: User) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.isAdmin ? 'YES' : 'NO'}</td>

                <td>
                  <Link
                    href={`/admin/users/${user.id}`}
                    type="button"
                    className="btn btn-ghost btn-sm"
                  >
                    Edit
                  </Link>
                  &nbsp;
                  <button
                    onClick={() => deleteUser({ userId: user.id!.toString() })}
                    type="button"
                    className="btn btn-ghost btn-sm"
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
