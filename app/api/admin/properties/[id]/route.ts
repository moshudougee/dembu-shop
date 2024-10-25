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
    
    try {
        const db = await readDB()
        const property = db.properties.find((item: Property) => item.id === parseInt(params.id))
        if (!property) {
            return Response.json(
                { message: 'property not found' },
                {
                    status: 404,
                }
            )
        }
        return Response.json(property)  
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
        const {
            name,
            values,
            hasTitle,
            fixedValues,
        } = await req.json()
        const updatedValues = Array.isArray(values) ? values : []
        const property: Property = db.properties.find((item: Property) => item.id === parseInt(params.id)) 
        if (property) {
            property.name = name || property.name
            property.values = updatedValues.length > 0 ? updatedValues :  property.values
            property.hasTitle = Boolean(hasTitle) || property.hasTitle
            property.fixedValues = Boolean(fixedValues) || property.fixedValues
            property.updatedAt = getToday()

            writeDB(db)
            return Response.json(property)
        } else {
            return Response.json(
                { message: 'property not found' },
                {
                    status: 404,
                }
            )
        }
    } catch (error: any) {
        return Response.json(
            { message: 'error updating property' + error.message },
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
        const propertyIndex = await db.properties.findIndex((item: Property) => item.id === parseInt(params.id))
        if (propertyIndex !== -1) {
            await db.properties.splice(propertyIndex, 1)
            writeDB(db)
            return Response.json({ message: 'Property deleted successfully' })
        } else {
            return Response.json(
                { message: 'property not found' },
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