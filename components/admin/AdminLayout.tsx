import { auth } from '@/lib/auth'
import { Home, Layers, PackageCheck, ShoppingCart, TableColumnsSplit, Users } from 'lucide-react'
import Link from 'next/link'

const AdminLayout = async ({
  activeItem = 'dashboard',
  children,
}: {
  activeItem: string
  children: React.ReactNode
}) => {
  const session = await auth()
  if (!session || !session.user.isAdmin) {
    return (
      <div className="relative flex flex-grow p-4">
        <div>
          <h1 className="text-2xl">Unauthorized</h1>
          <p>Admin permission required</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex flex-grow">
      <div className="w-full grid md:grid-cols-5">
        <div className="bg-base-200">
          <ul className="menu">
            <li>
              <Link
                className={'dashboard' === activeItem ? 'active' : ''}
                href="/admin/dashboard"
              >
                <Home size={16} />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                className={'orders' === activeItem ? 'active' : ''}
                href="/admin/orders"
              >
                <ShoppingCart size={16} />
                <span>Orders</span>
              </Link>
            </li>
            <li>
              <Link
                className={'products' === activeItem ? 'active' : ''}
                href="/admin/products"
              >
                <PackageCheck size={16} />
                <span>Products</span>
              </Link>
            </li>
            <li>
              <Link
                className={'users' === activeItem ? 'active' : ''}
                href="/admin/users"
              >
                <Users size={16} />
                <span>Users</span>
              </Link>
            </li>
            <li>
              <Link
                className={'categories' === activeItem ? 'active' : ''}
                href="/admin/categories"
              >
                <Layers size={16} />
                <span>Categories</span>
              </Link>
            </li>
            <li>
              <Link
                className={'properties' === activeItem ? 'active' : ''}
                href="/admin/properties"
              >
                <TableColumnsSplit size={16} />
                <span>Properties</span>
              </Link>
            </li>
          </ul>
        </div>
        <div className="md:col-span-4 px-4">{children} </div>
      </div>
    </div>
  )
}

export default AdminLayout
