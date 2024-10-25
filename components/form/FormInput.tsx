/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import React from 'react'
import {  ValidationRule, FieldErrors, FieldValues } from 'react-hook-form'

interface FormInputProps<T extends FieldValues> {
    id: keyof T;
    name: string;
    type?: string;
    disabled?: boolean;
    required?: boolean;
    pattern?: ValidationRule<RegExp>;
    register: (name: keyof T, options: any) => any;
    errors: FieldErrors<T>;
}

const FormInput = <T extends FieldValues,>({
    id,
    name,
    type = 'text',
    disabled = false,
    required,
    pattern,
    register,
    errors,
 }: FormInputProps<T>) => {
    const errorMessage = errors[id]?.message as React.ReactNode;
  return (
    <div className="md:flex mb-6">
    <label className="label md:w-1/5" htmlFor={id as string}>
      {name}
    </label>
    <div className="md:w-4/5">
      <input
        type={type}
        id={id as string}
        {...register(id, {
          required: required && `${name} is required`,
          pattern,
        })}
        className={type === 'checkbox' ? 
            'toggle' :
            'input input-bordered w-full max-w-md'
        }
        disabled={disabled}
      />
      {errorMessage && <div className="text-error">{errorMessage}</div>}
    </div>
  </div>
  )
}

export default FormInput