'use client'
import useLayoutService from '@/lib/hooks/useLayout'
import Link from 'next/link'
import React from 'react'
import useSWR from 'swr'

const Sidebar = () => {
  const { toggleDrawer } = useLayoutService()
  const { data: categories, error } = useSWR(`/api/categories`)

  if (error) return error.message
  if (!categories) return 'Loading...'

  return (
    <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
        <li className='mt-20'>
            <h2 className="text-xl">Shop By Department</h2>
        </li>
        {categories.map((category: Category) => (
          <li key={category.id}>
            <Link href={`/search?category=${category.name}`} onClick={toggleDrawer}>
              {category.name}
            </Link>
          </li>
      ))}
    </ul>
  )
}

export default Sidebar