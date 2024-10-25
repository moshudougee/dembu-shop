'use server'
import { readDB, writeDB } from "../db"
import { getToday } from "../utils"


export const getCatProperties = async(catName: string) => {
    try {
        const db = await readDB()
        const category = await db.categories.find((item: Category) => item.name === catName)
        if (category) {
            const properties: number[] = category.properties
            const catProperties: Property[] = []
            for (const propertyId of properties) {
                const property = await db.properties.find((item: Property) => item.id === propertyId)
                if (property) {
                    catProperties.push(property)
                }
            }

            return catProperties
        } else {
            return []
        }
    } catch (error) {
        console.log(error)
        return []
    }
    

}

export const getProductProperties = async(productId: number) => {
    try {
        const db = await readDB()
        const productProperties = await db.productProperties.find((item: ProductProperty) => item.productId === productId)
        if (productProperties) {
            return productProperties
        } else {
            return null
        }
    } catch (error) {
        console.log(error)
        return null
    }
}

export const getCategories = async () => {
    try {
       const db = await readDB()
       const categories: Category[] = await db.categories
       return categories 
    } catch (error) {
        console.log(error)
        return []
    }
}

// Get related products
export const getRelated = async (productId: number, category: string) => {
    try {
        const db = await readDB()
        const products = db.products
            .filter((product: Product) => product.id !== productId && product.category === category)
            .sort((a: Product, b: Product) => b.id! - a.id!) // Sort by descending ID
            .slice(0, 3)
        return products
    } catch (error) {
        console.log(error)
        return [] 
    }
  }

export const rateProduct = async (productId: number, userId: number, rating: number, comment: string) => {
    try {
        let oneStar = 0 
        let twoStars = 0
        let threeStars = 0 
        let fourStars = 0 
        let fiveStars = 0
        let totalReviews = 0
        const db = await readDB()
        const product: Product = await db.products.find((item: Product) => item.id === productId)
        const review: Reviews = await db.reviews.find((item: Reviews) => item.productId === productId)
        if (review) {
            if (rating === 1) {
                oneStar = review.ratings.one
                review.ratings = {...review.ratings, one: oneStar + 1}
                oneStar+1
            }
            if (rating === 2) {
                twoStars = review.ratings.two
                review.ratings = {...review.ratings, two: twoStars + 1}
                twoStars+1
            }
            if (rating === 3) {
                threeStars = review.ratings.three
                review.ratings = {...review.ratings, three: threeStars + 1}
                threeStars+1
            }
            if (rating === 4) {
                fourStars = review.ratings.four
                review.ratings = {...review.ratings, four: fourStars + 1}
                fourStars+1
            }
            if (rating === 5) {
                fiveStars = review.ratings.five
                review.ratings = {...review.ratings, five: fiveStars + 1}
                fiveStars+1
            }
            if (review.userId.includes(userId)) {
                const commentIndex = review.comments.findIndex((item: ReviewComment) => item.userId === userId)
                if (commentIndex !== -1) {
                    review.comments[commentIndex].comment = comment
                }
            } else {
                review.userId.push(userId)
                review.comments.push({ userId, comment, createdAt: getToday() })
            }

            review.totalReviews = review.totalReviews + 1
            review.updatedAt = getToday()
            totalReviews = review.totalReviews + 1
        } else {
            if (rating === 1) {
                oneStar = 1
            }
            if (rating === 2) {
                twoStars = 1
            }
            if (rating === 3) {
                threeStars = 1
            }
            if (rating === 4) {
                fourStars = 1
            }
            if (rating === 5) {
                fiveStars = 1
            }

            const newReview: Reviews = {
                id: db.reviews.length + 1,
                productId,
                userId: [userId],
                ratings: {
                    one: rating === 1 ? 1 : 0,
                    two: rating === 2 ? 1 : 0,
                    three: rating === 3 ? 1 : 0,
                    four: rating === 4 ? 1 : 0,
                    five: rating === 5 ? 1 : 0,
                },
                totalReviews: 1,
                comments: [{ userId, comment, createdAt: getToday() }],
                createdAt: getToday(),
                updatedAt: getToday(),
            }
            db.reviews.push(newReview)
            totalReviews = 1
        }

        
        const updatedRating = ((5 * fiveStars) + (4 * fourStars) + (3 * threeStars) + (2 * twoStars) + (1 * oneStar) / totalReviews)
        product.rating = updatedRating | product.rating
        product.numReviews = product.numReviews + 1
        product.updatedAt = getToday()

        writeDB(db)
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}

export const checkFeaturedCategory = async (catName: string) => {
    try {
        const db = await readDB()
        const featuredProducts: Product[] = db.products.filter((prod: Product) => prod.isFeatured)
        if (featuredProducts.length > 0) {
            return featuredProducts.some((item) => item['category'] === catName)
        }
        return false
    } catch (error) {
        console.log(error)
        return false
    }
}