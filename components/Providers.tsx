import React from 'react'
import ClientProviders from './ClientProviders'
import { SessionProvider } from 'next-auth/react'
import { auth } from '@/lib/auth'

const Providers = async ({
    children,
  }: {
    children: React.ReactNode
  }) => {

    const session = await auth()

  return (
    <SessionProvider session={session}>
    <ClientProviders>{children}</ClientProviders>
    </SessionProvider>
  )
}

export default Providers