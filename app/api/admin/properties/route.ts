/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/lib/auth";
import { readDB, writeDB } from "@/lib/db";
import { getToday } from "@/lib/utils";



export const GET = auth(async(req: any) => {
    if (!req.auth ||!req.auth.user?.isAdmin) {
        return Response.json(
          { message: 'unauthorized' },
          {
            status: 401,
          }
        );
    }
    try {
        const db = await readDB()
        const properties = await db.properties
        return Response.json(properties)
    } catch (error: any) {
        return Response.json(
            { message: error.message },
            {
              status: 500,
            }
        ) 
    }
}) as any

export const POST = auth(async (req: any) => {
    if (!req.auth ||!req.auth.user?.isAdmin) {
        return Response.json(
          { message: 'unauthorized' },
          {
            status: 401,
          }
        );
    }
    
    try {
        const db = await readDB()
        const property: Property = {
            id: db.properties.length + 1,
            name: 'sample property',
            values: [],
            hasTitle: false,
            fixedValues: false,
            createdAt: getToday(),
            updatedAt: getToday(),
        } 
        await db.properties.push(property)
        writeDB(db)
        return Response.json(
            {message: 'Property created successfully', property},
            {
                status: 201,
            }
        )
    } catch (error: any) {
        return Response.json(
            { message: 'error creating property' + error.message },
            {
              status: 500,
            }
        )
    }
}) as any