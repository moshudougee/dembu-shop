/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { FieldErrors, FieldValues } from 'react-hook-form'

interface FormToggleProps<T extends FieldValues> {
    id: keyof T;
    name: string;
    required?: boolean;
    register: (name: keyof T, options: any) => any;
    errors?: FieldErrors<T>;
    disabled?: boolean;
}

const FormToggle = <T extends FieldValues,>({
    id,
    name,
    required,
    register,
    errors,
    disabled=false,
  }: FormToggleProps<T>) => {
    const errorMessage = errors![id]?.message as React.ReactNode;
  return (
    <div className='md:flex mb-6'>
        <label className='label md:w-1/5'>
          {name}
        </label>
        <div className='md:w-4/5'>
            <input 
                type='checkbox'
                id={id}
                {...register(id, {required: required})}
                disabled={disabled}
                className='toggle toggle-accent'
            />
            {errorMessage && <div className="text-error">{errorMessage}</div>}
            {disabled && 
              <div>
                <span className='text-slate-600'>This category already has a featured product</span>
              </div>
            }
        </div>
    </div>
  )
}

export default FormToggle