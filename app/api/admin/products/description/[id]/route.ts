/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/lib/auth";
import { readDB, writeDB } from "@/lib/db";
import { getToday } from "@/lib/utils";


export const GET = auth(async(...args:any) => {
    const [req, { params }] = args
    if (!req.auth || !req.auth.user?.isAdmin) {
        return Response.json(
        { message: 'unauthorized' },
        {
            status: 401,
        }
        )
    }
    try {
        const db = await readDB()
        const productProperty = db.productProperties.find((items: ProductProperty) => items.id === parseInt(params.id))
        if (!productProperty) {
            return Response.json(
                { message: 'product property not found' },
                {
                    status: 404,
                }
            )
        }
        return Response.json(productProperty)
    } catch (error: any) {
        return Response.json(
            { message: error.message },
            {
                status: 500,
            }
        )
    }
}) as any

export const POST = auth(async (...args: any) => {
    const [req, { params }] = args
    if (!req.auth || !req.auth.user?.isAdmin) {
        return Response.json(
          { message: 'unauthorized' },
          {
            status: 401,
          }
        )
    }
    const db = await readDB()
    const productProperty: ProductProperty = {
        id: db.productProperties.length + 1,
        productId: parseInt(params.id),
        description: [],
        createdAt: getToday(),
        updatedAt: getToday(),
    }
    try {
        await db.productProperties.push(productProperty)
        writeDB(db)
        return Response.json(
            { message: 'Product Properties created successfully', productProperty },
            {
              status: 201,
            }
        )
    } catch (error: any) {
        return Response.json(
            { message: error.message },
            {
              status: 500,
            }
        )
    }
}) as any

export const PUT = auth(async(...args: any) => {
    const [req, { params }] = args
    if (!req.auth || !req.auth.user?.isAdmin) {
        return Response.json(
        { message: 'unauthorized' },
        {
            status: 401,
        }
        )
    }
    try {
       const db = await readDB()
       const { description } = await req.json()
       const updatedDescription = Array.isArray(description) ? description : []
       const productProperty: ProductProperty = db.productProperties.find((items: ProductProperty) => items.id === parseInt(params.id))
       if (productProperty) {
            productProperty.description = updatedDescription.length > 0 ? updatedDescription : productProperty.description
            productProperty.updatedAt = getToday()

            writeDB(db)
            return Response.json(productProperty)
       } else {
        return Response.json(
            { message: 'product property not found' },
            {
                status: 404,
            }
        )
       }
    } catch (error: any) {
        return Response.json(
            { message: 'error updating product property' + error.message },
            {
                status: 500,
            }
        )
    }
}) as any

export const DELETE = auth(async(...args: any) => {
    const [req, { params }] = args
    if (!req.auth || !req.auth.user?.isAdmin) {
        return Response.json(
        { message: 'unauthorized' },
        {
            status: 401,
        }
        )
    }
    try {
        const db = await readDB()
        const productPropertyIndex = await db.productProperties.findIndex((item: ProductProperty) => item.id === parseInt(params.id))
        if (productPropertyIndex!== -1) {
            await db.productProperties.splice(productPropertyIndex, 1)
            writeDB(db)
            return Response.json({ message: 'Product property deleted successfully' })
        } else {
            return Response.json(
                { message: 'product property not found' },
                {
                    status: 404,
                }
            )
        }
    } catch (error: any) {
        return Response.json(
            { message: error.message },
            {
                status: 500,
            }
        )
    }
}) as any