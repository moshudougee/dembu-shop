/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/lib/auth";
import { readDB, writeDB } from "@/lib/db";
import { getToday } from "@/lib/utils";



export const GET = auth(async(...args: any) => {
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
    const category = await db.categories.find((item: Category) => item.id === parseInt(params.id))
    if (!category) {
        return Response.json(
            { message: 'category not found' },
            {
                status: 404,
            }
        )
    }
    return Response.json(category)
}) as any

export const PUT = auth(async(...args: any) => {
    const [req, { params }] = args
    if (!req.auth ||!req.auth.user?.isAdmin) {
        return Response.json(
        { message: 'unauthorized' },
        {
            status: 401,
        }
        )
    }
    try {
        const db = await readDB()
        const { name, description, banner, properties } = await req.json()
        const updatedProperties = Array.isArray(properties) ? properties : []
        const category: Category = await db.categories.find((item: Category) => item.id === parseInt(params.id))
        if (category) {
            category.name = name || category.name
            category.description = description || category.description
            category.banner = banner || category.banner
            category.properties = updatedProperties.length > 0 ? updatedProperties : category.properties
            category.updatedAt = getToday()

            writeDB(db)
            return Response.json(category)
        }else  {
            return Response.json(
                { message: 'category not found' },
                {
                    status: 404,
                }
            )
        }

    } catch (error: any) {
        return Response.json(
            { message: 'error updating category' + error.message },
            {
                status: 500,
            }
        )
    }
}) as any

export const DELETE = auth(async(...args: any) => {
    const [req, { params }] = args
    if (!req.auth ||!req.auth.user?.isAdmin) {
        return Response.json(
        { message: 'unauthorized' },
        {
            status: 401,
        }
        )
    }
    try {
        const db = await readDB()
        const categoryIndex = await db.categories.findIndex((item: Category) => item.id === parseInt(params.id))
        if (categoryIndex !== -1) {
            await db.categories.splice(categoryIndex, 1)
            writeDB(db)
            return Response.json({ message: 'Category deleted successfully' })
        } else {
            return Response.json(
                { message: 'category not found' },
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