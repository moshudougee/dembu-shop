/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { FaEyeSlash, FaEye } from 'react-icons/fa'

type Inputs = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

const Form = () => {
  const { data: session } = useSession()
  const [showPass, setShowPass] = useState<boolean>(false)
  const [showConfirmPass, setShowConfirmPass] = useState<boolean>(false)

  const params = useSearchParams()
  const router = useRouter()
  const callbackUrl = params.get('callbackUrl') || '/'
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })
  useEffect(() => {
    if (session && session.user) {
      router.push(callbackUrl)
    }
  }, [callbackUrl, params, router, session])

  const formSubmit: SubmitHandler<Inputs> = async (form) => {
    const { name, email, password } = form

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })
      if (res.ok) {
        return router.push(
          `/signin?callbackUrl=${callbackUrl}&success=Account has been created`
        )
      } else {
        const data = await res.json()
        throw new Error(data.message)
      }
    } catch (err: any) {
      const error =
        err.message && err.message.indexOf('E11000') === 0
          ? 'Email is duplicate'
          : err.message
      toast.error(error || 'error')
    }
  }

  const handleTogglePass = () => setShowPass(!showPass)
  const handleToggleConfirmPass = () => setShowConfirmPass(!showConfirmPass)

  return (
    <div className="max-w-sm  mx-auto card bg-base-300 my-4">
      <div className="card-body">
        <h1 className="card-title">Register</h1>
        <form onSubmit={handleSubmit(formSubmit)}>
          <div className="my-2">
            <label className="label" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              {...register('name', {
                required: 'Name is required',
              })}
              className="input input-bordered w-full max-w-sm"
            />
            {errors.name?.message && (
              <div className="text-error">{errors.name.message}</div>
            )}
          </div>
          <div className="my-2">
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              type="text"
              id="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/,
                  message: 'Email is invalid',
                },
              })}
              className="input input-bordered w-full max-w-sm"
            />
            {errors.email?.message && (
              <div className="text-error"> {errors.email.message}</div>
            )}
          </div>
          <div className="my-2">
            <label className="label" htmlFor="password">
              Password
            </label>
            <div className='flex'>
              <input
                type={showPass ? "text" : "password"}
                id="password"
                {...register('password', {
                  required: 'Password is required',
                })}
                className="input input-bordered w-full max-w-sm"
              />
              <div className='absolute flex'>
                <span 
                  className='relative top-4 left-[280px]'
                  onClick={handleTogglePass}
                >
                  {showPass ? 
                      <FaEyeSlash size={24} />
                      :
                      <FaEye size={24} />
                  }
                </span>
              </div>
            </div>
            {errors.password?.message && (
              <div className="text-error">{errors.password.message}</div>
            )}
          </div>
          <div className="my-2">
            <label className="label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className='flex'>
              <input
                type={showConfirmPass ? "text" : "password"}
                id="confirmPassword"
                {...register('confirmPassword', {
                  required: 'Confirm Password is required',
                  validate: (value) => {
                    const { password } = getValues()
                    return password === value || 'Passwords should match!'
                  },
                })}
                className="input input-bordered w-full max-w-sm"
              />
              <div className='absolute flex'>
                <span 
                  className='relative top-4 left-[280px]'
                  onClick={handleToggleConfirmPass}
                >
                  {showConfirmPass ? 
                      <FaEyeSlash size={24} />
                      :
                      <FaEye size={24} />
                  }
                </span>
              </div>
            </div>
            {errors.confirmPassword?.message && (
              <div className="text-error">{errors.confirmPassword.message}</div>
            )}
          </div>
          <div className="my-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full"
            >
              {isSubmitting && (
                <span className="loading loading-spinner"></span>
              )}
              Register
            </button>
          </div>
        </form>

        <div className="divider"> </div>
        <div>
          Already have an account?{' '}
          <Link className="link" href={`/signin?callbackUrl=${callbackUrl}`}>
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Form
