/* eslint-disable @typescript-eslint/no-explicit-any */
import { auth } from "@/lib/auth";
import { readDB, writeDB } from "@/lib/db";
import { getToday } from "@/lib/utils";


export const GET = auth(async(req: any) => {
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
        const categories = await db.categories
        return Response.json(categories)
      } catch (error: any) {
        return Response.json(
            { message: error.message },
            {
              status: 500,
            }
        )
      }
}) as any

export const POST = auth(async(req: any) => {
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
        const siteUrl = process.env.AUTH_URL

        const category: Category = {
            id: db.categories.length + 1,
            name: 'sample name',
            description: 'sample description',
            banner: `${siteUrl}/images/banner1.jpg`,
            properties: [],
            createdAt: getToday(),
            updatedAt: getToday(),
        }
        await db.categories.push(category)
        writeDB(db)
        return Response.json(
            {message: 'Category created successfully', category},
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