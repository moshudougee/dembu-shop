/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import { FieldErrors, FieldValues } from 'react-hook-form'

interface FormSelectProps<T extends FieldValues> {
    id: keyof T;
    name: string;
    required?: boolean;
    items: Category[] | Product[] | Property[] | User[];
    register: (name: keyof T, options: any) => any;
    errors: FieldErrors<T>;
  
}

const FormSelect = <T extends FieldValues,>({
    id,
    name,
    required,
    items,
    register,
    errors,
  }: FormSelectProps<T>) => {
    const errorMessage = errors[id]?.message as React.ReactNode;
  return (
    <div className="md:flex mb-6">
        <label className="label md:w-1/5" htmlFor={id as string}>
          {name}
        </label>
        <div className="md:w-4/5">
          <select
            id={id}
            {...register(id, {
              required: required && `${name} is required`,
            })}
            className="select select-bordered w-full max-w-md"
          >
            <option value=''>Select From List</option>
            {items.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        {errorMessage && <div className="text-error">{errorMessage}</div>}
        </div>
    </div>
  )
}

export default FormSelect