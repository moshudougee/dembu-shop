/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { FieldErrors, FieldValues } from 'react-hook-form'

interface FormTextAreaProps<T extends FieldValues> {
    id: keyof T;
    name: string;
    maxLength?: number;
    required?: boolean;
    rows?: number;
    register: (name: keyof T, options: any) => any;
    errors: FieldErrors<T>;
}

const FormTextArea = <T extends FieldValues,>({
    id,
    name,
    maxLength,
    required,
    rows = 10,
    register,
    errors,
  }: FormTextAreaProps<T>) => {
    const errorMessage = errors[id]?.message as React.ReactNode;
  return (
    <div className='md:flex mb-6'>
        <label className='label md:w-1/5' htmlFor={id as string}>
            {name}
        </label>
        <div className='md:w-4/5'>
            <textarea
                id={id}
                rows={rows}
                {...register(id, {
                    required: required && `${name} is required`,
                    maxLength: maxLength && `${name} must be at most ${maxLength} characters long`,
                })}
                className='textarea textarea-bordered w-full max-w-md'
            />
            {errorMessage && <div className='text-error'>{errorMessage}</div>}
        </div>
    </div>
  )
}

export default FormTextArea