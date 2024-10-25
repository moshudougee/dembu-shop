import { DefaultSession, DefaultUser } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id?: number | null // It could be string in some databases
      isAdmin?: boolean
      name?: string 
      email?: string 
    } & DefaultSession['user']
  }

  export interface User extends DefaultUser {
    id?: number //// It could be string in some databases
    isAdmin?: boolean
    name?: string 
    email?: string
  }
}
