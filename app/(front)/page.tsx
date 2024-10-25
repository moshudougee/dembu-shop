import productService from "@/lib/services/productService";
import { Metadata } from "next";
import Link from "next/link";
//import BannerImg from "@/public/images/banner1.jpg"
import Image from "next/image";
import ProductItem from "@/components/products/ProductItem";
import { getCategories } from "@/lib/services/propDescServices";
import { auth } from "@/lib/auth";
import AdminProdItem from "@/components/admin/AdminProdItem";


export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || 'Dembu Shop',
  description:
    process.env.NEXT_PUBLIC_APP_DESC ||
    'Your one stop shop for everything the market has to offer',
}
export default async function Home() {
  const session = await auth()
  const featuredProducts: Product[] = await productService.getFeatured()
  const latestProducts: Product[] = await productService.getLatest()
  
  const categories: Category[] = await getCategories()
  
  const getBanner = (name: string) => {
    if (categories.length === 0) return ''
    const category: Category | undefined = categories.find((c) => c.name === name)
    if (category) {
      return category.banner
    }
    return ''
  }
  return (
    <>
      <div className="w-full carousel rounded-box mt-6">
      {featuredProducts && featuredProducts.map((product, index) => {
        const banner = getBanner(product.category)
        return(
          <div
            key={product.id}
            id={`slide-${index}`}
            className="carousel-item relative w-full"
          >
            {session?.user.isAdmin ? (
              <Link href={`/admin/products/details/${product.id}`}>
                <Image src={banner} width={1500} height={400} className="object-cover w-full" alt={product.name} priority />
              </Link>
            ) : (
              <Link href={`/product/${product.slug}`}>
                <Image src={banner} width={1500} height={400} className="object-cover w-full" alt={product.name} priority />
              </Link>
            )}
            

            <div
              className="absolute flex justify-between transform 
               -translate-y-1/2 left-5 right-5 top-1/2"
            >
              <a
                href={`#slide-${
                  index === 0 ? featuredProducts.length - 1 : index - 1
                }`}
                className="btn btn-circle"
              >
                ❮
              </a>
              <a
                href={`#slide-${
                  index === featuredProducts.length - 1 ? 0 : index + 1
                }`}
                className="btn btn-circle"
              >
                ❯
              </a>
            </div>
          </div>
        )})}
      </div>
      <h2 className="text-2xl py-2">Latest Products</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {session?.user.isAdmin ? (
          latestProducts.map((product) => (
            <AdminProdItem key={product.id} product={product} />
          ))
        ) : (
          latestProducts.map((product) => (
            <ProductItem key={product.id} product={product} />
          ))
        )
        }
      </div>
    </>
  );
}
