declare type User = {
    id: number;
    name: string;
    email: string;
    password: string;
    isAdmin: boolean;
    createdAt?: string;
    updatedAt?: string;
}

declare type Product = {
    id?: number;
    name: string;
    slug: string;
    images: string[];
    banner?: string;
    price: number;
    brand: string;
    description: string;
    category: string;
    rating: number;
    numReviews: number;
    countInStock: number;
    isFeatured: boolean;
    properties?: [];
    createdAt?: string;
    updatedAt?: string;
}

declare type Category = {
    id?: number;
    name: string;
    description: string;
    banner: string;
    properties?: number[];
    createdAt?: string;
    updatedAt?: string;
}

declare type Property = {
    id?: number;
    name: string;
    values?: string[] | number[];
    hasTitle: boolean;
    fixedValues: boolean;
    createdAt?: string;
    updatedAt?: string;
}

declare type Order = {
    id?: number;
    userId: number;
    items: OrderItem[];
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    paymentResult?: { id: string; status: string; email_address: string };
    itemsPrice: number;
    shippingPrice: number;
    taxPrice: number;
    totalPrice: number;
    isPaid: boolean;
    isDelivered: boolean;
    paidAt?: string;
    deliveredAt?: string;
    createdAt?: string;
    user?: {name: string};
}

declare type OrderItem = {
    id?: number;
    product?: number;
    name: string;
    slug: string;
    qty: number;
    images: string[];
    price: number;
    properties?: OrderItemProperty[];
}

declare type OrderItemProperty = {
    propertyId: number;
    name: string;
    value: string | number;
}

declare type ShippingAddress = {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
}

declare type SalesData = {
    id: string;
    totalOrders: number;
    totalSales: number;
}

declare type ProductsData = {
    id: string;
    totalProducts: number;
}

declare type UsersData = {
    id: string;
    totalUsers: number;
}

declare type ProductProperty = {
    id?: number;
    productId: number;
    description: Description[];
    createdAt?: string;
    updatedAt?: string;
}

declare type Description = {
    propertyId: number;
    hasTitle: boolean;
    fixedValues: boolean;
    values?: PropertyValue[];
}

declare type PropertyValue = {
    title?: string;
    value: string | number;
}

declare type DisplayValues = {
    propertyId: number;
    values: PropertyValue[];
}

declare type Reviews = {
    id?: number;
    userId: number[];
    productId: number;
    ratings: Ratings;
    totalReviews: number;
    comments: ReviewComment[];
    createdAt?: string;
    updatedAt?: string;
}

declare type Ratings = {
    one: number;
    two: number;
    three: number;
    four: number;
    five: number;
}

declare type ReviewComment = {
    userId: number;
    comment: string;
    createdAt?: string;
}